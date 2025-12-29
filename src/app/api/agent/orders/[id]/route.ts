import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAgentAuth, agentJsonResponse, agentErrorResponse } from '@/lib/agent-middleware';

export const dynamic = 'force-dynamic';

// GET /api/agent/orders/:id - Get specific order details
async function handleGet(
    request: NextRequest,
    session: { id: string; rider_id: string; company_id: string },
    orderId: string
) {
    const supabase = createServerClient();

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            customers (
                id,
                name,
                phone,
                email
            )
        `)
        .eq('id', orderId)
        .eq('rider_id', session.rider_id)
        .eq('company_id', session.company_id)
        .single();

    if (error || !order) {
        return agentErrorResponse('Order not found', 404);
    }

    return agentJsonResponse({
        success: true,
        data: order,
    });
}

// PATCH /api/agent/orders/:id - Update order status
async function handlePatch(
    request: NextRequest,
    session: { id: string; rider_id: string; company_id: string },
    orderId: string
) {
    const supabase = createServerClient();
    const body = await request.json();

    const { status, notes, signature_url, photo_proof_url, latitude, longitude } = body;

    // Validate status transition
    const validStatuses = ['picked_up', 'in_transit', 'delivered', 'failed'];
    if (status && !validStatuses.includes(status)) {
        return agentErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('rider_id', session.rider_id)
        .eq('company_id', session.company_id)
        .single();

    if (fetchError || !currentOrder) {
        return agentErrorResponse('Order not found or not assigned to you', 404);
    }

    // Validate status transition
    const statusFlow: Record<string, string[]> = {
        assigned: ['picked_up', 'failed'],
        picked_up: ['in_transit', 'failed'],
        in_transit: ['delivered', 'failed'],
    };

    if (status && statusFlow[currentOrder.status] && !statusFlow[currentOrder.status].includes(status)) {
        return agentErrorResponse(`Cannot transition from ${currentOrder.status} to ${status}`);
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (status) {
        updateData.status = status;
        
        if (status === 'picked_up') {
            updateData.picked_up_at = new Date().toISOString();
        } else if (status === 'delivered') {
            updateData.delivered_at = new Date().toISOString();
        }
    }

    if (notes) {
        updateData.notes = currentOrder.notes 
            ? `${currentOrder.notes}\n[Agent ${new Date().toISOString()}]: ${notes}`
            : `[Agent ${new Date().toISOString()}]: ${notes}`;
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

    if (updateError) {
        console.error('Failed to update order:', updateError);
        return agentErrorResponse('Failed to update order', 500);
    }

    // Log activity
    await supabase.from('agent_activity_log').insert({
        rider_id: session.rider_id,
        company_id: session.company_id,
        session_id: session.id,
        activity_type: status === 'delivered' ? 'order_delivered' : 
                       status === 'picked_up' ? 'order_picked_up' : 
                       'order_updated',
        activity_data: {
            order_id: orderId,
            old_status: currentOrder.status,
            new_status: status,
            signature_url,
            photo_proof_url,
        },
        latitude,
        longitude,
    });

    return agentJsonResponse({
        success: true,
        message: `Order ${status || 'updated'} successfully`,
        data: updatedOrder,
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAgentAuth(request, (req, session) => handleGet(req, session, id));
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAgentAuth(request, (req, session) => handlePatch(req, session, id));
}
