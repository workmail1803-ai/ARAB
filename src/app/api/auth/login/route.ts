import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// POST /api/auth/login - Login and get API key
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Find company by email
        const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !company) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, company.password_hash as string);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                id: company.id,
                name: company.name,
                email: company.email,
                api_key: company.api_key,
                plan: company.plan,
                webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks`,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
