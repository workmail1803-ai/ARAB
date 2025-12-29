import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// GET /api/v1/settings - Get company settings
export async function GET(request: NextRequest) {
    return withAuth(request, async (_req, companyId) => {
        const supabase = createServerClient();

        // Default settings to return if table doesn't exist or no record found
        const defaultSettings = {
            id: null,
            company_id: companyId,
            business_type: 'pickup',
            date_format: 'DD MMM YYYY',
            time_format: '12',
            distance_unit: 'km',
            map_type: 'google',
            real_time_tracking: true,
            show_delay_time: true,
            delay_minutes: 5,
            theme_navbar_color: '#4F46E5',
            theme_button_color: '#4F46E5',
            theme_menu_hover_color: '#EEF2FF',
            default_dashboard_view: 'map',
            enable_address_update: false,
            enable_qr_code: false,
            disable_ratings_tracking: false,
            enable_eta_tracking: true,
            disable_call_sms_tracking: false,
        };

        try {
            // Try to get existing settings
            const { data: settings, error } = await supabase
                .from('company_settings')
                .select('*')
                .eq('company_id', companyId)
                .single();

            if (error) {
                // If table doesn't exist or no record, return defaults
                console.log('[Settings API] Returning defaults:', error.code);
                return NextResponse.json({
                    success: true,
                    data: defaultSettings,
                });
            }

            return NextResponse.json({
                success: true,
                data: settings,
            });
        } catch (err) {
            console.error('[Settings API] Error:', err);
            return NextResponse.json({
                success: true,
                data: defaultSettings,
            });
        }
    });
}

// PATCH /api/v1/settings - Update company settings
export async function PATCH(request: NextRequest) {
    return withAuth(request, async (req, companyId) => {
        const supabase = createServerClient();
        const body = await req.json();

        // Allowed fields to update
        const allowedFields = [
            'business_type',
            'date_format',
            'time_format',
            'distance_unit',
            'map_type',
            'real_time_tracking',
            'show_delay_time',
            'delay_minutes',
            'theme_navbar_color',
            'theme_button_color',
            'theme_menu_hover_color',
            'default_dashboard_view',
            'enable_address_update',
            'enable_qr_code',
            'disable_ratings_tracking',
            'enable_eta_tracking',
            'disable_call_sms_tracking',
        ];

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        // Upsert settings (create if not exists, update if exists)
        const { data: settings, error } = await supabase
            .from('company_settings')
            .upsert({
                company_id: companyId,
                ...updates
            }, {
                onConflict: 'company_id'
            })
            .select('*')
            .single();

        if (error) {
            console.error('Error updating settings:', error);
            return NextResponse.json(
                { error: 'Failed to update settings' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: settings,
        });
    });
}
