import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAgentAuth, agentJsonResponse, agentErrorResponse } from '@/lib/agent-middleware';

export const dynamic = 'force-dynamic';

// POST /api/agent/location - Update agent location (heartbeat)
async function handlePost(
    request: NextRequest,
    session: { id: string; rider_id: string; company_id: string }
) {
    const supabase = createServerClient();
    const body = await request.json();

    const { 
        latitude, 
        longitude, 
        battery_level, 
        speed, 
        heading,
        accuracy,
        altitude 
    } = body;

    if (latitude === undefined || longitude === undefined) {
        return agentErrorResponse('Latitude and longitude are required');
    }

    // Update rider location and status
    const { data: rider, error: updateError } = await supabase
        .from('riders')
        .update({
            latitude,
            longitude,
            battery_level: battery_level ?? null,
            last_seen: new Date().toISOString(),
            status: 'active', // Mark as active when updating location
        })
        .eq('id', session.rider_id)
        .eq('company_id', session.company_id)
        .select('id, name, status, latitude, longitude, battery_level, last_seen')
        .single();

    if (updateError) {
        console.error('Failed to update rider location:', updateError);
        return agentErrorResponse('Failed to update location', 500);
    }

    // Log to location history
    await supabase.from('location_history').insert({
        rider_id: session.rider_id,
        latitude,
        longitude,
        speed,
        heading,
    });

    // Update session last_active
    await supabase
        .from('agent_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', session.id);

    return agentJsonResponse({
        success: true,
        message: 'Location updated',
        data: {
            rider,
            timestamp: new Date().toISOString(),
        },
    });
}

// GET /api/agent/location - Get current location (for debugging)
async function handleGet(
    request: NextRequest,
    session: { id: string; rider_id: string; company_id: string }
) {
    const supabase = createServerClient();

    const { data: rider, error } = await supabase
        .from('riders')
        .select('id, name, latitude, longitude, battery_level, last_seen, status')
        .eq('id', session.rider_id)
        .single();

    if (error || !rider) {
        return agentErrorResponse('Rider not found', 404);
    }

    return agentJsonResponse({
        success: true,
        data: rider,
    });
}

export async function POST(request: NextRequest) {
    return withAgentAuth(request, handlePost);
}

export async function GET(request: NextRequest) {
    return withAgentAuth(request, handleGet);
}
