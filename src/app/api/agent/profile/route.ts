import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAgentAuth, agentJsonResponse, agentErrorResponse } from '@/lib/agent-middleware';

export const dynamic = 'force-dynamic';

// GET /api/agent/profile - Get agent profile
async function handleGet(
    request: NextRequest,
    session: { id: string; rider_id: string; company_id: string }
) {
    const supabase = createServerClient();

    const { data: rider, error } = await supabase
        .from('riders')
        .select(`
            id,
            name,
            phone,
            email,
            vehicle_type,
            status,
            latitude,
            longitude,
            battery_level,
            last_seen,
            created_at
        `)
        .eq('id', session.rider_id)
        .single();

    if (error || !rider) {
        return agentErrorResponse('Rider not found', 404);
    }

    // Get company info
    const { data: company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', session.company_id)
        .single();

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayDeliveries } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('rider_id', session.rider_id)
        .eq('status', 'delivered')
        .gte('delivered_at', today.toISOString());

    const { count: activeOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('rider_id', session.rider_id)
        .in('status', ['assigned', 'picked_up', 'in_transit']);

    return agentJsonResponse({
        success: true,
        data: {
            rider,
            company,
            stats: {
                today_deliveries: todayDeliveries || 0,
                active_orders: activeOrders || 0,
            },
            session: {
                id: session.id,
            },
        },
    });
}

// PATCH /api/agent/profile - Update agent profile/status
async function handlePatch(
    request: NextRequest,
    session: { id: string; rider_id: string; company_id: string }
) {
    const supabase = createServerClient();
    const body = await request.json();

    const { status, push_token } = body;

    // Validate status if provided
    const validStatuses = ['active', 'busy', 'break', 'offline'];
    if (status && !validStatuses.includes(status)) {
        return agentErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Update rider status
    if (status) {
        const { error: riderError } = await supabase
            .from('riders')
            .update({ 
                status,
                last_seen: new Date().toISOString()
            })
            .eq('id', session.rider_id);

        if (riderError) {
            return agentErrorResponse('Failed to update status', 500);
        }

        // Log status change
        await supabase.from('agent_activity_log').insert({
            rider_id: session.rider_id,
            company_id: session.company_id,
            session_id: session.id,
            activity_type: 'status_change',
            activity_data: { new_status: status },
        });
    }

    // Update push token if provided
    if (push_token) {
        await supabase
            .from('agent_sessions')
            .update({ push_token })
            .eq('id', session.id);
    }

    // Get updated profile
    const { data: rider } = await supabase
        .from('riders')
        .select('id, name, phone, status, vehicle_type')
        .eq('id', session.rider_id)
        .single();

    return agentJsonResponse({
        success: true,
        message: 'Profile updated',
        data: rider,
    });
}

export async function GET(request: NextRequest) {
    return withAgentAuth(request, handleGet);
}

export async function PATCH(request: NextRequest) {
    return withAgentAuth(request, handlePatch);
}
