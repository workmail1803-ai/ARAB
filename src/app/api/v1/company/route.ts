import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// GET /api/v1/company - Get company details for authenticated user
export async function GET(request: NextRequest) {
    return withAuth(request, async (_req, companyId) => {
        const supabase = createServerClient();

        const { data: company, error } = await supabase
            .from('companies')
            .select('id, name, api_key, webhook_secret, settings, created_at')
            .eq('id', companyId)
            .single();

        if (error) {
            console.error('Error fetching company:', error);
            return NextResponse.json(
                { error: 'Failed to fetch company data' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: company,
        });
    });
}

// PATCH /api/v1/company - Update company settings
export async function PATCH(request: NextRequest) {
    return withAuth(request, async (req, companyId) => {
        const supabase = createServerClient();
        const body = await req.json();

        const { name, webhook_secret, settings } = body;

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (webhook_secret !== undefined) updates.webhook_secret = webhook_secret;
        if (settings !== undefined) updates.settings = settings;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        const { data: company, error } = await supabase
            .from('companies')
            .update(updates)
            .eq('id', companyId)
            .select('id, name, api_key, webhook_secret, settings')
            .single();

        if (error) {
            console.error('Error updating company:', error);
            return NextResponse.json(
                { error: 'Failed to update company' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: company,
        });
    });
}
