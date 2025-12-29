import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { validateApiKey } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// Shopify webhook payload types
interface ShopifyLineItem {
    name: string;
    quantity: number;
    price: string;
}

interface ShopifyAddress {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
}

interface ShopifyOrder {
    id: number;
    order_number: number;
    email: string;
    phone?: string;
    total_price: string;
    currency: string;
    financial_status: string;
    fulfillment_status: string | null;
    shipping_address?: ShopifyAddress;
    billing_address?: ShopifyAddress;
    line_items: ShopifyLineItem[];
    note?: string;
    created_at: string;
}

export async function POST(request: NextRequest) {
    try {
        // Get API key from headers
        const apiKey = request.headers.get('x-api-key') ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        // Get Shopify HMAC for signature verification (optional but recommended)
        const shopifyHmac = request.headers.get('x-shopify-hmac-sha256');
        const shopifyTopic = request.headers.get('x-shopify-topic');
        const shopifyShopDomain = request.headers.get('x-shopify-shop-domain');

        console.log('[Shopify Webhook] Topic:', shopifyTopic);
        console.log('[Shopify Webhook] Shop:', shopifyShopDomain);

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing API key. Add x-api-key header.' },
                { status: 401 }
            );
        }

        // Validate API key and get company ID
        const companyId = await validateApiKey(apiKey);
        if (!companyId) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        // Parse the Shopify order payload
        const order: ShopifyOrder = await request.json();

        // Get shipping address (fallback to billing)
        const address = order.shipping_address || order.billing_address;

        // Format the address
        const formattedAddress = address
            ? `${address.address1}${address.address2 ? ', ' + address.address2 : ''}, ${address.city}, ${address.province} ${address.zip}, ${address.country}`
            : 'No address provided';

        // Format line items as description
        const itemsDescription = order.line_items
            .map(item => `${item.quantity}x ${item.name}`)
            .join(', ');

        // Create order in Supabase
        const supabase = createServerClient();

        // Check if order already exists (by external_id)
        const externalId = `shopify_${order.id}`;
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('id')
            .eq('company_id', companyId)
            .eq('external_id', externalId)
            .single();

        if (existingOrder) {
            // Update existing order
            const { data: updatedOrder, error } = await supabase
                .from('orders')
                .update({
                    status: mapShopifyStatus(order.fulfillment_status),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingOrder.id)
                .select()
                .single();

            if (error) {
                console.error('[Shopify Webhook] Update error:', error);
                return NextResponse.json(
                    { error: 'Failed to update order' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Order updated',
                order_id: updatedOrder.id,
            });
        }

        // Create new order
        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert({
                company_id: companyId,
                external_id: externalId,
                customer_name: address
                    ? `${address.first_name} ${address.last_name}`
                    : order.email,
                customer_phone: address?.phone || order.phone || null,
                customer_email: order.email,
                delivery_address: formattedAddress,
                order_description: itemsDescription,
                order_value: parseFloat(order.total_price),
                status: 'pending',
                source: 'shopify',
                metadata: {
                    shopify_order_id: order.id,
                    shopify_order_number: order.order_number,
                    currency: order.currency,
                    financial_status: order.financial_status,
                    shop_domain: shopifyShopDomain,
                    note: order.note,
                },
            })
            .select()
            .single();

        if (error) {
            console.error('[Shopify Webhook] Insert error:', error);
            return NextResponse.json(
                { error: 'Failed to create order' },
                { status: 500 }
            );
        }

        console.log('[Shopify Webhook] Order created:', newOrder.id);

        return NextResponse.json({
            success: true,
            message: 'Shopify order received',
            order_id: newOrder.id,
            external_id: externalId,
        });

    } catch (error) {
        console.error('[Shopify Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process Shopify webhook' },
            { status: 500 }
        );
    }
}

// Map Shopify fulfillment status to our status
function mapShopifyStatus(fulfillmentStatus: string | null): string {
    switch (fulfillmentStatus) {
        case 'fulfilled':
            return 'completed';
        case 'partial':
            return 'in_progress';
        case 'restocked':
            return 'cancelled';
        default:
            return 'pending';
    }
}
