import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/api-middleware';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Generate a unique company code (6 alphanumeric characters)
function generateCompanyCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, 1, I)
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// GET /api/v1/company - Get company details for authenticated user
export async function GET(request: NextRequest) {
    return withAuth(request, async (_req, companyId) => {
        const supabase = createServerClient();

        const { data: company, error } = await supabase
            .from('companies')
            .select('id, name, company_code, api_key, webhook_secret, settings, created_at')
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

        const { name, webhook_secret, settings, regenerate_company_code } = body;

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (webhook_secret !== undefined) updates.webhook_secret = webhook_secret;
        if (settings !== undefined) updates.settings = settings;
        
        // Generate or regenerate company code
        if (regenerate_company_code) {
            let codeIsUnique = false;
            let newCode = generateCompanyCode();
            let attempts = 0;
            
            while (!codeIsUnique && attempts < 10) {
                const { data: existingCode } = await supabase
                    .from('companies')
                    .select('id')
                    .ilike('company_code', newCode)
                    .neq('id', companyId)
                    .single();
                
                if (!existingCode) {
                    codeIsUnique = true;
                } else {
                    newCode = generateCompanyCode();
                    attempts++;
                }
            }
            updates.company_code = newCode;
        }

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
            .select('id, name, company_code, api_key, webhook_secret, settings')
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
