import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Middleware to validate agent session token
export async function validateAgentSession(sessionToken: string) {
    const supabase = createServerClient();

    const { data: session, error } = await supabase
        .from('agent_sessions')
        .select(`
            id,
            rider_id,
            company_id,
            device_id,
            is_active,
            expires_at,
            riders (
                id,
                name,
                phone,
                status,
                vehicle_type
            )
        `)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();

    if (error || !session) {
        return null;
    }

    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
        // Mark session as inactive
        await supabase
            .from('agent_sessions')
            .update({ is_active: false })
            .eq('id', session.id);
        return null;
    }

    return session;
}

// Wrapper for agent-authenticated endpoints
export async function withAgentAuth(
    request: NextRequest,
    handler: (
        req: NextRequest,
        session: {
            id: string;
            rider_id: string;
            company_id: string;
            device_id: string;
        }
    ) => Promise<NextResponse>
): Promise<NextResponse> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Missing or invalid authorization header' },
            { status: 401 }
        );
    }

    const sessionToken = authHeader.replace('Bearer ', '').trim();
    const session = await validateAgentSession(sessionToken);

    if (!session) {
        return NextResponse.json(
            { error: 'Invalid or expired session. Please login again.' },
            { status: 401 }
        );
    }

    // Update last_active timestamp
    const supabase = createServerClient();
    await supabase
        .from('agent_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', session.id);

    return handler(request, {
        id: session.id,
        rider_id: session.rider_id,
        company_id: session.company_id,
        device_id: session.device_id,
    });
}

// Helper to create JSON response
export function agentJsonResponse(data: unknown, status = 200): NextResponse {
    return NextResponse.json(data, { status });
}

// Helper to create error response
export function agentErrorResponse(message: string, status = 400): NextResponse {
    return NextResponse.json({ error: message }, { status });
}
