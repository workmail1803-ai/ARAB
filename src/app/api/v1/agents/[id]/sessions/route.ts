import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse, errorResponse } from '@/lib/api-middleware';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET /api/v1/agents/:id/sessions - Get agent sessions
async function handleGet(
    request: NextRequest,
    companyId: string,
    riderId: string
) {
    const supabase = createServerClient();

    const { data: sessions, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('rider_id', riderId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        return errorResponse('Failed to fetch sessions', 500);
    }

    return jsonResponse({
        success: true,
        data: sessions,
    });
}

// POST /api/v1/agents/:id/credentials - Set up agent credentials (PIN)
async function handlePost(
    request: NextRequest,
    companyId: string,
    riderId: string
) {
    const supabase = createServerClient();
    const body = await request.json();

    const { pin_code } = body;

    if (!pin_code || pin_code.length !== 6 || !/^\d+$/.test(pin_code)) {
        return errorResponse('PIN must be a 6-digit number');
    }

    // Verify rider belongs to company
    const { data: rider, error: riderError } = await supabase
        .from('riders')
        .select('id, name')
        .eq('id', riderId)
        .eq('company_id', companyId)
        .single();

    if (riderError || !rider) {
        return errorResponse('Rider not found', 404);
    }

    // Upsert credentials
    const { data, error } = await supabase
        .from('rider_credentials')
        .upsert({
            id: uuidv4(),
            rider_id: riderId,
            company_id: companyId,
            pin_code,
            is_active: true,
            login_attempts: 0,
            locked_until: null,
        }, { onConflict: 'rider_id' })
        .select()
        .single();

    if (error) {
        console.error('Failed to set credentials:', error);
        return errorResponse('Failed to set credentials', 500);
    }

    return jsonResponse({
        success: true,
        message: `PIN set for ${rider.name}`,
        data: {
            rider_id: riderId,
            rider_name: rider.name,
            pin_set: true,
        },
    }, 201);
}

// DELETE /api/v1/agents/:id/sessions - Invalidate all agent sessions (force logout)
async function handleDelete(
    request: NextRequest,
    companyId: string,
    riderId: string
) {
    const supabase = createServerClient();

    // Invalidate all sessions
    const { error } = await supabase
        .from('agent_sessions')
        .update({ is_active: false })
        .eq('rider_id', riderId)
        .eq('company_id', companyId);

    if (error) {
        return errorResponse('Failed to invalidate sessions', 500);
    }

    // Set rider status to offline
    await supabase
        .from('riders')
        .update({ status: 'offline' })
        .eq('id', riderId)
        .eq('company_id', companyId);

    return jsonResponse({
        success: true,
        message: 'All sessions invalidated. Agent will need to login again.',
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handleGet(req, companyId, id));
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handlePost(req, companyId, id));
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handleDelete(req, companyId, id));
}
