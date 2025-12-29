import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// Default notification events
const DEFAULT_EVENTS = [
    'task_created',
    'task_assigned',
    'task_started',
    'task_completed',
    'task_failed',
    'task_cancelled',
    'agent_on_duty',
    'agent_off_duty',
];

// GET /api/v1/settings/notifications - Get notification settings
export async function GET(request: NextRequest) {
    return withAuth(request, async (_req, companyId) => {
        const supabase = createServerClient();

        // Default notification matrix
        const defaultMatrix = DEFAULT_EVENTS.map(event => ({
            event_type: event,
            sms_enabled: false,
            email_enabled: false,
            webhook_enabled: false,
            webhook_url: null,
        }));

        try {
            const { data: notifications, error } = await supabase
                .from('notification_settings')
                .select('*')
                .eq('company_id', companyId);

            if (error) {
                // If table doesn't exist, return defaults
                console.log('[Notifications API] Returning defaults:', error.code);
                return NextResponse.json({
                    success: true,
                    data: defaultMatrix,
                });
            }

            // Build the full matrix with defaults
            const eventMap = new Map(notifications?.map(n => [n.event_type, n]) || []);

            const matrix = DEFAULT_EVENTS.map(event => ({
                event_type: event,
                sms_enabled: eventMap.get(event)?.sms_enabled ?? false,
                email_enabled: eventMap.get(event)?.email_enabled ?? false,
                webhook_enabled: eventMap.get(event)?.webhook_enabled ?? false,
                webhook_url: eventMap.get(event)?.webhook_url ?? null,
            }));

            return NextResponse.json({
                success: true,
                data: matrix,
            });
        } catch (err) {
            console.error('[Notifications API] Error:', err);
            return NextResponse.json({
                success: true,
                data: defaultMatrix,
            });
        }
    });
}

// PATCH /api/v1/settings/notifications - Update notification settings
export async function PATCH(request: NextRequest) {
    return withAuth(request, async (req, companyId) => {
        const supabase = createServerClient();
        const body = await req.json();

        const { event_type, sms_enabled, email_enabled, webhook_enabled, webhook_url } = body;

        if (!event_type) {
            return NextResponse.json(
                { error: 'event_type is required' },
                { status: 400 }
            );
        }

        const { data: notification, error } = await supabase
            .from('notification_settings')
            .upsert({
                company_id: companyId,
                event_type,
                sms_enabled: sms_enabled ?? false,
                email_enabled: email_enabled ?? false,
                webhook_enabled: webhook_enabled ?? false,
                webhook_url: webhook_url ?? null,
            }, {
                onConflict: 'company_id,event_type'
            })
            .select('*')
            .single();

        if (error) {
            console.error('Error updating notification:', error);
            return NextResponse.json(
                { error: 'Failed to update notification settings' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: notification,
        });
    });
}
