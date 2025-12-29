import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/api-middleware';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST /api/v1/company/regenerate-key - Regenerate API key
export async function POST(request: NextRequest) {
    return withAuth(request, async (_req, companyId) => {
        const supabase = createServerClient();

        // Generate new API key
        const newApiKey = `tk_${crypto.randomBytes(32).toString('hex')}`;

        const { data: company, error } = await supabase
            .from('companies')
            .update({ api_key: newApiKey })
            .eq('id', companyId)
            .select('id, name, api_key')
            .single();

        if (error) {
            console.error('Error regenerating API key:', error);
            return NextResponse.json(
                { error: 'Failed to regenerate API key' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'API key regenerated successfully',
            data: {
                api_key: company.api_key,
            },
        });
    });
}
