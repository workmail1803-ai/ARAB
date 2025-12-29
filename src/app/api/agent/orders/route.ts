import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAgentAuth, agentJsonResponse, agentErrorResponse } from '@/lib/agent-middleware';

export const dynamic = 'force-dynamic';

// GET /api/agent/orders - Get orders assigned to this agent
async function handleGet(
    request: NextRequest,
    session: { id: string; rider_id: string; company_id: string }
) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status'); // 'assigned', 'picked_up', 'in_transit', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
        .from('orders')
        .select(`
            *,
            customers (
                id,
                name,
                phone
            )
        `, { count: 'exact' })
        .eq('rider_id', session.rider_id)
        .eq('company_id', session.company_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Filter by status
    if (status && status !== 'all') {
        query = query.eq('status', status);
    } else {
        // Default: show active orders only
        query = query.in('status', ['assigned', 'picked_up', 'in_transit']);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Failed to fetch agent orders:', error);
        return agentErrorResponse('Failed to fetch orders', 500);
    }

    return agentJsonResponse({
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

export async function GET(request: NextRequest) {
    return withAgentAuth(request, handleGet);
}
