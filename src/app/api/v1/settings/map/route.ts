import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// Default map settings
const defaultMapSettings = {
    id: null,
    company_id: null,
    map_type: 'google',
    real_time_tracking: false,
    web_key: '',
    android_key: '',
    ios_key: '',
    server_key: '',
    form_key: '',
    mappr_dashboard_url: 'https://mappr.io/dashboard',
};

// GET /api/v1/settings/map - Get map configuration
export async function GET(request: NextRequest) {
    return withAuth(request, async (_req, companyId) => {
        const supabase = createServerClient();

        try {
            // Try to get existing map settings
            const { data: settings, error } = await supabase
                .from('map_settings')
                .select('*')
                .eq('company_id', companyId)
                .single();

            if (error) {
                // If table doesn't exist or no record, return defaults
                console.log('[Map Settings API] Returning defaults:', error.code);
                return NextResponse.json({
                    success: true,
                    data: { ...defaultMapSettings, company_id: companyId },
                });
            }

            return NextResponse.json({
                success: true,
                data: settings,
            });
        } catch (err) {
            console.error('[Map Settings API] Error:', err);
            return NextResponse.json({
                success: true,
                data: { ...defaultMapSettings, company_id: companyId },
            });
        }
    });
}

// PATCH /api/v1/settings/map - Update map configuration
export async function PATCH(request: NextRequest) {
    return withAuth(request, async (req, companyId) => {
        const supabase = createServerClient();
        const body = await req.json();

        // Allowed fields to update
        const allowedFields = [
            'map_type',
            'real_time_tracking',
            'web_key',
            'android_key',
            'ios_key',
            'server_key',
            'form_key',
            'mappr_dashboard_url',
        ];

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        // Upsert settings (create if not exists, update if exists)
        const { data: settings, error } = await supabase
            .from('map_settings')
            .upsert({
                company_id: companyId,
                ...updates
            }, {
                onConflict: 'company_id'
            })
            .select('*')
            .single();

        if (error) {
            console.error('Error updating map settings:', error);
            return NextResponse.json(
                { error: 'Failed to update map settings' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: settings,
        });
    });
}
