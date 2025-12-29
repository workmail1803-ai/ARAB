// Outbound Webhook Service
// Sends notifications back to store owners when order status changes

import crypto from 'crypto';

interface WebhookPayload {
    event: string;
    timestamp: string;
    data: Record<string, unknown>;
}

interface WebhookConfig {
    url: string;
    secret: string;
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
}

/**
 * Send webhook notification to external URL
 */
export async function sendWebhook(
    config: WebhookConfig,
    event: string,
    data: Record<string, unknown>
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!config.url) {
        return { success: false, error: 'No webhook URL configured' };
    }

    const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
    };

    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString, config.secret);

    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-Event': event,
                'User-Agent': 'Tookan-Webhook/1.0',
            },
            body: payloadString,
            signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        return {
            success: response.ok,
            statusCode: response.status,
            error: response.ok ? undefined : `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Order event types for webhooks
 */
export const OrderEvents = {
    ORDER_CREATED: 'order.created',
    ORDER_ASSIGNED: 'order.assigned',
    ORDER_PICKED_UP: 'order.picked_up',
    ORDER_IN_TRANSIT: 'order.in_transit',
    ORDER_DELIVERED: 'order.delivered',
    ORDER_CANCELLED: 'order.cancelled',
    ORDER_FAILED: 'order.failed',
    ORDER_UPDATED: 'order.updated',
} as const;

/**
 * Format order data for webhook payload
 */
export function formatOrderPayload(order: Record<string, unknown>) {
    return {
        order_id: order.id,
        external_id: order.external_id,
        status: order.status,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        pickup_address: order.pickup_address,
        items: order.items,
        total: order.total,
        rider_id: order.rider_id,
        rider_name: order.rider_name,
        notes: order.notes,
        created_at: order.created_at,
        picked_up_at: order.picked_up_at,
        delivered_at: order.delivered_at,
    };
}

/**
 * Map internal status to webhook event
 */
export function statusToEvent(status: string): string {
    const statusMap: Record<string, string> = {
        pending: OrderEvents.ORDER_CREATED,
        assigned: OrderEvents.ORDER_ASSIGNED,
        picked_up: OrderEvents.ORDER_PICKED_UP,
        in_transit: OrderEvents.ORDER_IN_TRANSIT,
        delivered: OrderEvents.ORDER_DELIVERED,
        cancelled: OrderEvents.ORDER_CANCELLED,
        failed: OrderEvents.ORDER_FAILED,
    };
    return statusMap[status] || OrderEvents.ORDER_UPDATED;
}
