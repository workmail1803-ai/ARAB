import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse, errorResponse } from '@/lib/api-middleware';
import { sendWebhook, statusToEvent, formatOrderPayload } from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

// GET /api/v1/orders/:id - Get single order
async function handleGet(
    request: NextRequest,
    companyId: string,
    orderId: string
) {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('orders')
        .select('*, rider:riders(id, name, phone, latitude, longitude), customer:customers(id, name, phone, email)')
        .eq('id', orderId)
        .eq('company_id', companyId)
        .single();

    if (error || !data) {
        return errorResponse('Order not found', 404);
    }

    return jsonResponse({ success: true, data });
}

// PATCH /api/v1/orders/:id - Update order
async function handlePatch(
    request: NextRequest,
    companyId: string,
    orderId: string
) {
    const supabase = createServerClient();
    const body = await request.json();

    const {
        status,
        rider_id,
        payment_status,
        notes,
        delivery_address,
        pickup_address,
    } = body;

    // Get company info for webhook callback
    const { data: company } = await supabase
        .from('companies')
        .select('webhook_secret, settings')
        .eq('id', companyId)
        .single();

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (rider_id !== undefined) updateData.rider_id = rider_id;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (notes !== undefined) updateData.notes = notes;
    if (delivery_address !== undefined) updateData.delivery_address = delivery_address;
    if (pickup_address !== undefined) updateData.pickup_address = pickup_address;

    // Handle status-specific timestamps
    if (status === 'picked_up') {
        updateData.picked_up_at = new Date().toISOString();
    } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
        updateData.payment_status = 'completed';
    }

    // If assigning a rider, update status
    if (rider_id && !status) {
        updateData.status = 'assigned';
    }

    const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .eq('company_id', companyId)
        .select('*, rider:riders(id, name), customer:customers(id, name, phone)')
        .single();

    if (error) {
        return errorResponse('Failed to update order', 500);
    }

    if (!data) {
        return errorResponse('Order not found', 404);
    }

    // Send webhook notification for status change
    const webhookUrl = company?.settings?.callback_url || company?.settings?.webhook_callback_url;
    const finalStatus = (updateData.status || data.status) as string;

    if (webhookUrl && company?.webhook_secret) {
        const webhookPayload = formatOrderPayload({
            ...data,
            status: finalStatus,
            rider_name: data.rider?.name,
        });

        // Send webhook asynchronously
        sendWebhook(
            { url: webhookUrl, secret: company.webhook_secret },
            statusToEvent(finalStatus),
            webhookPayload
        ).then(result => {
            if (!result.success) {
                console.error('Webhook failed:', result.error);
            }
        }).catch(err => {
            console.error('Webhook error:', err);
        });
    }

    return jsonResponse({ success: true, data });
}

// DELETE /api/v1/orders/:id - Cancel/Delete order
async function handleDelete(
    request: NextRequest,
    companyId: string,
    orderId: string
) {
    const supabase = createServerClient();

    // Get company info for webhook callback
    const { data: company } = await supabase
        .from('companies')
        .select('webhook_secret, settings')
        .eq('id', companyId)
        .single();

    // Mark as cancelled instead of deleting
    const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('company_id', companyId)
        .select('*, customer:customers(id, name, phone)')
        .single();

    if (error) {
        return errorResponse('Failed to cancel order', 500);
    }

    // Send webhook notification for cancellation
    const webhookUrl = company?.settings?.callback_url || company?.settings?.webhook_callback_url;
    if (webhookUrl && company?.webhook_secret && data) {
        const webhookPayload = formatOrderPayload({
            ...data,
            status: 'cancelled',
        });

        sendWebhook(
            { url: webhookUrl, secret: company.webhook_secret },
            'order.cancelled',
            webhookPayload
        ).then(result => {
            if (!result.success) {
                console.error('Webhook failed:', result.error);
            }
        }).catch(err => {
            console.error('Webhook error:', err);
        });
    }

    return jsonResponse({ success: true, message: 'Order cancelled', data });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handleGet(req, companyId, id));
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handlePatch(req, companyId, id));
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handleDelete(req, companyId, id));
}
