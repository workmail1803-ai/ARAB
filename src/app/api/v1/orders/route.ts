import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse, errorResponse } from '@/lib/api-middleware';
import { v4 as uuidv4 } from 'uuid';
import { sendWebhook, OrderEvents, formatOrderPayload } from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

// GET /api/v1/orders - List all orders
async function handleGet(request: NextRequest, companyId: string) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const rider_id = searchParams.get('rider_id');
    const customer_id = searchParams.get('customer_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
        .from('orders')
        .select('*, rider:riders(id, name, phone), customer:customers(id, name, phone)', { count: 'exact' })
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (rider_id) query = query.eq('rider_id', rider_id);
    if (customer_id) query = query.eq('customer_id', customer_id);

    const { data, error, count } = await query;

    if (error) {
        return errorResponse('Failed to fetch orders', 500);
    }

    return jsonResponse({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil((count || 0) / limit),
        },
    });
}

// POST /api/v1/orders - Create a new order
async function handlePost(request: NextRequest, companyId: string) {
    const supabase = createServerClient();
    const body = await request.json();

    const {
        external_id,
        customer_id,
        customer_name,
        customer_phone,
        customer_email,
        rider_id,
        pickup_address,
        delivery_address,
        items,
        subtotal,
        delivery_fee,
        total,
        payment_method,
        notes,
        scheduled_at,
    } = body;

    if (!delivery_address) {
        return errorResponse('Delivery address is required');
    }

    // Get company info for webhook callback
    const { data: company } = await supabase
        .from('companies')
        .select('webhook_secret, settings')
        .eq('id', companyId)
        .single();

    // If customer details provided but no customer_id, create/find customer
    let finalCustomerId = customer_id;
    if (!customer_id && customer_name) {
        // Check if customer exists by phone
        if (customer_phone) {
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('company_id', companyId)
                .eq('phone', customer_phone)
                .single();

            if (existingCustomer) {
                finalCustomerId = existingCustomer.id;
            }
        }

        // Create new customer if not found
        if (!finalCustomerId) {
            const { data: newCustomer } = await supabase
                .from('customers')
                .insert({
                    id: uuidv4(),
                    company_id: companyId,
                    name: customer_name,
                    phone: customer_phone,
                    email: customer_email,
                    addresses: [{ address: delivery_address, type: 'delivery' }],
                })
                .select('id')
                .single();

            if (newCustomer) {
                finalCustomerId = newCustomer.id;
            }
        }
    }

    // Create order
    const orderId = uuidv4();
    const { data, error } = await supabase
        .from('orders')
        .insert({
            id: orderId,
            company_id: companyId,
            external_id,
            customer_id: finalCustomerId,
            rider_id,
            pickup_address,
            delivery_address,
            items: items || [],
            subtotal,
            delivery_fee,
            total,
            payment_method,
            notes,
            scheduled_at,
            status: rider_id ? 'assigned' : 'pending',
            payment_status: 'pending',
        })
        .select('*, rider:riders(id, name), customer:customers(id, name)')
        .single();

    if (error) {
        console.error('Error creating order:', error);
        return errorResponse('Failed to create order', 500);
    }

    // Update customer stats
    if (finalCustomerId && total) {
        await supabase.rpc('increment_customer_stats', {
            p_customer_id: finalCustomerId,
            p_amount: total,
        });
    }

    // Send webhook notification to store owner
    const webhookUrl = company?.settings?.callback_url || company?.settings?.webhook_callback_url;
    if (webhookUrl && company?.webhook_secret) {
        const webhookPayload = formatOrderPayload({
            ...data,
            customer_name,
            customer_phone,
        });

        // Send webhook asynchronously (don't block response)
        sendWebhook(
            { url: webhookUrl, secret: company.webhook_secret },
            OrderEvents.ORDER_CREATED,
            webhookPayload
        ).then(result => {
            if (!result.success) {
                console.error('Webhook failed:', result.error);
            }
        }).catch(err => {
            console.error('Webhook error:', err);
        });
    }

    return jsonResponse({ success: true, data }, 201);
}

export async function GET(request: NextRequest) {
    return withAuth(request, handleGet);
}

export async function POST(request: NextRequest) {
    return withAuth(request, handlePost);
}
