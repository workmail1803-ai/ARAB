import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Generate a secure session token
function generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// POST /api/agent/auth/login - Agent/Rider login
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            company_code, // Company identifier (could be API key prefix or company code)
            phone, 
            pin_code,
            device_id,
            device_type,
            device_model,
            app_version,
            os_version,
            push_token
        } = body;

        // Validate required fields
        if (!company_code || !phone || !pin_code || !device_id) {
            return NextResponse.json(
                { error: 'Missing required fields: company_code, phone, pin_code, device_id' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Find company by EITHER:
        // 1. The manual company_code column (e.g. "test")
        // 2. The first part of the API key (e.g. "df83" for "tk_df83...")
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id, name, api_key, company_code, settings')
            .or(`company_code.ilike.${company_code},api_key.ilike.tk_${company_code}%`)
            .eq('is_active', true)
            .single();

        if (companyError || !company) {
            return NextResponse.json(
                { error: 'Invalid company code' },
                { status: 401 }
            );
        }

        // Find rider by phone number within the company
        // Use limit(1) to handle potential duplicates (e.g. from test data)
        const { data: riders, error: riderError } = await supabase
            .from('riders')
            .select('id, name, phone, email, vehicle_type, status')
            .eq('company_id', company.id)
            .eq('phone', phone)
            .limit(1);

        if (riderError || !riders || riders.length === 0) {
            return NextResponse.json(
                { error: 'Rider not found. Please contact your manager.' },
                { status: 401 }
            );
        }

        const rider = riders[0];

        // Check rider credentials
        const { data: credentials, error: credError } = await supabase
            .from('rider_credentials')
            .select('*')
            .eq('rider_id', rider.id)
            .eq('is_active', true)
            .single();

        if (credError || !credentials) {
            // Auto-create credentials if not exists (first time setup)
            // In production, you might want a separate flow for this
            const { error: createCredError } = await supabase
                .from('rider_credentials')
                .insert({
                    id: uuidv4(),
                    rider_id: rider.id,
                    company_id: company.id,
                    pin_code: pin_code, // First login sets the PIN
                    is_active: true,
                });

            if (createCredError) {
                console.error('Failed to create credentials:', createCredError);
                return NextResponse.json(
                    { error: 'Failed to setup rider credentials' },
                    { status: 500 }
                );
            }
        } else {
            // Verify PIN
            if (credentials.pin_code !== pin_code) {
                // Increment login attempts
                await supabase
                    .from('rider_credentials')
                    .update({ 
                        login_attempts: (credentials.login_attempts || 0) + 1,
                        locked_until: (credentials.login_attempts || 0) >= 4 
                            ? new Date(Date.now() + 15 * 60 * 1000).toISOString() // Lock for 15 min after 5 attempts
                            : null
                    })
                    .eq('id', credentials.id);

                return NextResponse.json(
                    { error: 'Invalid PIN code' },
                    { status: 401 }
                );
            }

            // Check if account is locked
            if (credentials.locked_until && new Date(credentials.locked_until) > new Date()) {
                return NextResponse.json(
                    { error: 'Account temporarily locked. Please try again later.' },
                    { status: 423 }
                );
            }

            // Reset login attempts on successful login
            await supabase
                .from('rider_credentials')
                .update({ 
                    login_attempts: 0, 
                    locked_until: null,
                    last_login: new Date().toISOString()
                })
                .eq('id', credentials.id);
        }

        // Invalidate existing sessions for this device
        await supabase
            .from('agent_sessions')
            .update({ is_active: false })
            .eq('device_id', device_id);

        // Create new session
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const { data: session, error: sessionError } = await supabase
            .from('agent_sessions')
            .insert({
                id: uuidv4(),
                rider_id: rider.id,
                company_id: company.id,
                device_id,
                device_type,
                device_model,
                app_version,
                os_version,
                push_token,
                session_token: sessionToken,
                is_active: true,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (sessionError) {
            console.error('Failed to create session:', sessionError);
            return NextResponse.json(
                { error: 'Failed to create session' },
                { status: 500 }
            );
        }

        // Update rider status to active
        await supabase
            .from('riders')
            .update({ 
                status: 'active',
                last_seen: new Date().toISOString()
            })
            .eq('id', rider.id);

        // Register device if not exists
        await supabase
            .from('rider_devices')
            .upsert({
                rider_id: rider.id,
                company_id: company.id,
                device_id,
                device_type,
                device_model,
                last_used: new Date().toISOString(),
            }, { onConflict: 'rider_id,device_id' });

        // Log activity
        await supabase
            .from('agent_activity_log')
            .insert({
                rider_id: rider.id,
                company_id: company.id,
                session_id: session.id,
                activity_type: 'login',
                activity_data: {
                    device_type,
                    device_model,
                    app_version,
                },
            });

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                session_token: sessionToken,
                expires_at: expiresAt.toISOString(),
                rider: {
                    id: rider.id,
                    name: rider.name,
                    phone: rider.phone,
                    email: rider.email,
                    vehicle_type: rider.vehicle_type,
                },
                company: {
                    id: company.id,
                    name: company.name,
                },
            },
        });
    } catch (error) {
        console.error('Agent login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
