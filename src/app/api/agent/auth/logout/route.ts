import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/agent/auth/logout - Agent logout
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing authorization header' },
                { status: 401 }
            );
        }

        const sessionToken = authHeader.replace('Bearer ', '').trim();
        const supabase = createServerClient();

        // Find and validate session
        const { data: session, error: sessionError } = await supabase
            .from('agent_sessions')
            .select('id, rider_id, company_id')
            .eq('session_token', sessionToken)
            .eq('is_active', true)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Invalid or expired session' },
                { status: 401 }
            );
        }

        // Invalidate session
        await supabase
            .from('agent_sessions')
            .update({ is_active: false })
            .eq('id', session.id);

        // Update rider status to offline
        await supabase
            .from('riders')
            .update({ status: 'offline' })
            .eq('id', session.rider_id);

        // Log activity
        await supabase
            .from('agent_activity_log')
            .insert({
                rider_id: session.rider_id,
                company_id: session.company_id,
                session_id: session.id,
                activity_type: 'logout',
            });

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Agent logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
