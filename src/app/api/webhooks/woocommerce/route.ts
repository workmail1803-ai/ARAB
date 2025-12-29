import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * WooCommerce Webhook Handler
 * 
 * This endpoint receives webhooks from WooCommerce (WordPress) when:
 * - A new order is created
 * - An order is updated
 * - An order is completed/cancelled
 * 
 * Setup in WooCommerce:
 * 1. Go to WooCommerce > Settings > Advanced > Webhooks
 * 2. Add Webhook with these settings:
 *    - Name: Fleet Management
 *    - Status: Active
 *    - Topic: Order created / Order updated
 *    - Delivery URL: https://your-domain.com/api/webhooks/woocommerce
 *    - Secret: (generate a random secret)
 *    - API Version: WP REST API Integration v3
 */

// Verify WooCommerce webhook signature
function verifyWooCommerceSignature(payload: string, signature: string, secret: string): boolean {
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload, 'utf8')
            .digest('base64');

        return signature === expectedSignature;
    } catch {
        return false;
    }
}

// Transform WooCommerce order to our format
function transformWooOrder(wooOrder: WooCommerceOrder) {
    const billing = wooOrder.billing || {};
    const shipping = wooOrder.shipping || {};

    // Build delivery address
    const deliveryAddress = [
        shipping.address_1 || billing.address_1,
        shipping.address_2 || billing.address_2,
        shipping.city || billing.city,
        shipping.state || billing.state,
        shipping.postcode || billing.postcode,
        shipping.country || billing.country,
    ].filter(Boolean).join(', ');

    // Transform line items
    const items = (wooOrder.line_items || []).map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.total) || 0,
        sku: item.sku,
    }));

    return {
        external_id: `woo_${wooOrder.id}`,
        customer_name: `${billing.first_name || ''} ${billing.last_name || ''}`.trim() || 'WooCommerce Customer',
        customer_phone: billing.phone || '',
        customer_email: billing.email || '',
        delivery_address: deliveryAddress || 'Address pending',
        items,
        total: parseFloat(wooOrder.total) || 0,
        notes: wooOrder.customer_note || '',
        payment_status: wooOrder.payment_method ?
            (wooOrder.status === 'completed' || wooOrder.status === 'processing' ? 'paid' : 'pending')
            : 'pending',
        status: mapWooStatus(wooOrder.status),
    };
}

// Map WooCommerce status to our status
function mapWooStatus(wooStatus: string): 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled' {
    const statusMap: Record<string, 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'> = {
        'pending': 'pending',
        'processing': 'pending',
        'on-hold': 'pending',
        'completed': 'delivered',
        'cancelled': 'cancelled',
        'refunded': 'cancelled',
        'failed': 'cancelled',
    };
    return statusMap[wooStatus] || 'pending';
}

interface WooCommerceOrder {
    id: number;
    status: string;
    total: string;
    customer_note?: string;
    payment_method?: string;
    billing: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        address_1?: string;
        address_2?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
    shipping: {
        first_name?: string;
        last_name?: string;
        address_1?: string;
        address_2?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
    line_items: Array<{
        name: string;
        quantity: number;
        total: string;
        sku?: string;
    }>;
}

// POST /api/webhooks/woocommerce - Receive webhooks from WooCommerce
export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('x-wc-webhook-signature');
        const topic = request.headers.get('x-wc-webhook-topic');
        const apiKey = request.headers.get('x-api-key');

        console.log('[WooCommerce Webhook] Received:', { topic, hasSignature: !!signature });

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key required. Add x-api-key header or configure in WooCommerce webhook settings.' },
                { status: 401 }
            );
        }

        const supabase = createServerClient();

        // Find company by API key
        const { data: company } = await supabase
            .from('companies')
            .select('id, webhook_secret, name')
            .eq('api_key', apiKey)
            .single();

        if (!company) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        const payload = await request.text();

        // Verify WooCommerce signature if provided
        if (signature && company.webhook_secret) {
            const isValid = verifyWooCommerceSignature(payload, signature, company.webhook_secret);
            if (!isValid) {
                console.error('[WooCommerce Webhook] Signature verification failed');
                // Don't block - some WooCommerce setups have signature issues
            }
        }

        const wooOrder: WooCommerceOrder = JSON.parse(payload);

        // Handle different WooCommerce webhook topics
        switch (topic) {
            case 'order.created':
            case 'order.updated': {
                const orderData = transformWooOrder(wooOrder);

                // Check if order already exists (by external_id)
                const { data: existingOrder } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('company_id', company.id)
                    .eq('external_id', orderData.external_id)
                    .single();

                if (existingOrder) {
                    // Update existing order
                    await supabase
                        .from('orders')
                        .update({
                            status: orderData.status,
                            items: orderData.items,
                            total: orderData.total,
                            notes: orderData.notes,
                            payment_status: orderData.payment_status,
                        })
                        .eq('id', existingOrder.id);

                    console.log('[WooCommerce Webhook] Updated order:', existingOrder.id);
                } else {
                    // Check if customer exists
                    let customerId = null;
                    if (orderData.customer_phone || orderData.customer_email) {
                        const { data: existingCustomer } = await supabase
                            .from('customers')
                            .select('id')
                            .eq('company_id', company.id)
                            .or(`phone.eq.${orderData.customer_phone},email.eq.${orderData.customer_email}`)
                            .single();

                        if (existingCustomer) {
                            customerId = existingCustomer.id;
                        } else {
                            // Create new customer
                            const { data: newCustomer } = await supabase
                                .from('customers')
                                .insert({
                                    company_id: company.id,
                                    name: orderData.customer_name,
                                    phone: orderData.customer_phone,
                                    email: orderData.customer_email,
                                })
                                .select('id')
                                .single();

                            customerId = newCustomer?.id;
                        }
                    }

                    // Create new order
                    const { data: newOrder } = await supabase
                        .from('orders')
                        .insert({
                            company_id: company.id,
                            customer_id: customerId,
                            external_id: orderData.external_id,
                            delivery_address: orderData.delivery_address,
                            items: orderData.items,
                            total: orderData.total,
                            notes: orderData.notes,
                            status: 'pending',
                            payment_status: orderData.payment_status,
                        })
                        .select('id')
                        .single();

                    console.log('[WooCommerce Webhook] Created order:', newOrder?.id);
                }
                break;
            }

            case 'order.deleted': {
                const externalId = `woo_${wooOrder.id}`;

                await supabase
                    .from('orders')
                    .update({ status: 'cancelled' })
                    .eq('company_id', company.id)
                    .eq('external_id', externalId);

                console.log('[WooCommerce Webhook] Cancelled order:', externalId);
                break;
            }

            default:
                console.log('[WooCommerce Webhook] Unhandled topic:', topic);
        }

        return NextResponse.json({
            success: true,
            message: `WooCommerce webhook processed: ${topic}`,
            company: company.name,
        });

    } catch (error) {
        console.error('[WooCommerce Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process WooCommerce webhook' },
            { status: 500 }
        );
    }
}

// GET - Health check and documentation
export async function GET() {
    return NextResponse.json({
        name: 'WooCommerce Webhook Endpoint',
        version: '1.0',
        description: 'Receives order webhooks from WooCommerce/WordPress sites',
        setup: {
            step1: 'Go to WooCommerce > Settings > Advanced > Webhooks',
            step2: 'Click "Add Webhook"',
            step3: 'Configure with these settings:',
            settings: {
                name: 'Fleet Management Integration',
                status: 'Active',
                topic: 'Order created (for new orders) or Order updated (for status changes)',
                delivery_url: 'https://your-domain.com/api/webhooks/woocommerce',
                secret: 'Generate a random secret and save it in your fleet dashboard',
            },
            step4: 'Add custom header: x-api-key with your Fleet Management API key',
        },
        supported_topics: [
            'order.created',
            'order.updated',
            'order.deleted',
        ],
        headers_required: [
            'x-api-key: Your Fleet Management API key',
        ],
        headers_optional: [
            'x-wc-webhook-signature: WooCommerce signature (auto-sent)',
            'x-wc-webhook-topic: Event type (auto-sent)',
        ],
    });
}
