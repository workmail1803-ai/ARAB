import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(`sha256=${expectedSignature}`),
        Buffer.from(signature)
    );
}

// POST /api/webhooks - Receive webhooks from external systems
export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('x-webhook-signature');
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key required in x-api-key header' },
                { status: 401 }
            );
        }

        const supabase = createServerClient();

        // Find company by API key
        const { data: company } = await supabase
            .from('companies')
            .select('id, webhook_secret')
            .eq('api_key', apiKey)
            .single();

        if (!company) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        const payload = await request.text();

        // Verify signature if provided
        if (signature && company.webhook_secret) {
            const isValid = verifySignature(payload, signature, company.webhook_secret);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid webhook signature' },
                    { status: 401 }
                );
            }
        }

        const body = JSON.parse(payload);
        const { event, data } = body;

        if (!event) {
            return NextResponse.json(
                { error: 'Event type is required' },
                { status: 400 }
            );
        }

        // Handle different event types
        switch (event) {
            case 'rider.location_updated': {
                const { rider_id, external_rider_id, latitude, longitude, battery_level } = data;

                let query = supabase
                    .from('riders')
                    .update({
                        latitude,
                        longitude,
                        battery_level,
                        last_seen: new Date().toISOString(),
                        status: 'active',
                    })
                    .eq('company_id', company.id);

                if (rider_id) {
                    query = query.eq('id', rider_id);
                } else if (external_rider_id) {
                    query = query.eq('external_id', external_rider_id);
                }

                await query;
                break;
            }

            case 'order.created': {
                const { external_id, customer_name, delivery_address, items, total } = data;

                await supabase.from('orders').insert({
                    company_id: company.id,
                    external_id,
                    delivery_address,
                    items: items || [],
                    total,
                    status: 'pending',
                    payment_status: 'pending',
                });
                break;
            }

            case 'order.status_updated': {
                const { order_id, external_order_id, status } = data;

                let query = supabase
                    .from('orders')
                    .update({ status })
                    .eq('company_id', company.id);

                if (order_id) {
                    query = query.eq('id', order_id);
                } else if (external_order_id) {
                    query = query.eq('external_id', external_order_id);
                }

                await query;
                break;
            }

            case 'rider.status_updated': {
                const { rider_id, external_rider_id, status } = data;

                let query = supabase
                    .from('riders')
                    .update({ status })
                    .eq('company_id', company.id);

                if (rider_id) {
                    query = query.eq('id', rider_id);
                } else if (external_rider_id) {
                    query = query.eq('external_id', external_rider_id);
                }

                await query;
                break;
            }

            default:
                return NextResponse.json(
                    { error: `Unknown event type: ${event}` },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            message: `Event '${event}' processed successfully`,
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
