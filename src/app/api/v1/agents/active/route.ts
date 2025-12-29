import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse, errorResponse } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// GET /api/v1/agents/active - Get all active agents with real-time data
async function handleGet(request: NextRequest, companyId: string) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const includeOffline = searchParams.get('include_offline') === 'true';
    const minutesThreshold = parseInt(searchParams.get('minutes') || '10');

    // Calculate time threshold for "active"
    const activeThreshold = new Date(Date.now() - minutesThreshold * 60 * 1000);

    let query = supabase
        .from('riders')
        .select(`
            id,
            name,
            phone,
            email,
            status,
            latitude,
            longitude,
            battery_level,
            vehicle_type,
            last_seen,
            agent_sessions!inner (
                id,
                device_type,
                device_model,
                app_version,
                last_active,
                is_active
            )
        `)
        .eq('company_id', companyId)
        .eq('agent_sessions.is_active', true);

    if (!includeOffline) {
        query = query.gte('last_seen', activeThreshold.toISOString());
    }

    const { data: agents, error } = await query;

    if (error) {
        console.error('Failed to fetch active agents:', error);
        
        // Fallback: fetch without session join if table doesn't exist
        const { data: ridersOnly, error: riderError } = await supabase
            .from('riders')
            .select('*')
            .eq('company_id', companyId)
            .in('status', ['active', 'busy']);

        if (riderError) {
            return errorResponse('Failed to fetch agents', 500);
        }

        return jsonResponse({
            success: true,
            data: ridersOnly?.map(r => ({
                ...r,
                is_online: r.last_seen && new Date(r.last_seen) > activeThreshold,
                session: null,
            })) || [],
            timestamp: new Date().toISOString(),
        });
    }

    // Process and enrich agent data
    const enrichedAgents = agents?.map(agent => {
        const session = Array.isArray(agent.agent_sessions) 
            ? agent.agent_sessions[0] 
            : agent.agent_sessions;

        return {
            id: agent.id,
            name: agent.name,
            phone: agent.phone,
            email: agent.email,
            status: agent.status,
            location: {
                latitude: agent.latitude,
                longitude: agent.longitude,
            },
            battery_level: agent.battery_level,
            vehicle_type: agent.vehicle_type,
            last_seen: agent.last_seen,
            is_online: agent.last_seen && new Date(agent.last_seen) > activeThreshold,
            session: session ? {
                device_type: session.device_type,
                device_model: session.device_model,
                app_version: session.app_version,
                last_active: session.last_active,
            } : null,
        };
    }) || [];

    return jsonResponse({
        success: true,
        data: enrichedAgents,
        summary: {
            total: enrichedAgents.length,
            online: enrichedAgents.filter(a => a.is_online).length,
            active: enrichedAgents.filter(a => a.status === 'active').length,
            busy: enrichedAgents.filter(a => a.status === 'busy').length,
        },
        timestamp: new Date().toISOString(),
    });
}

export async function GET(request: NextRequest) {
    return withAuth(request, handleGet);
}
