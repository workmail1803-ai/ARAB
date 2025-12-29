import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Generate a secure API key
function generateApiKey(): string {
    return `tk_${crypto.randomBytes(32).toString('hex')}`;
}

// Generate webhook secret
function generateWebhookSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

// POST /api/auth/signup - Register a new company
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        const supabase = createServerClient();

        // Check if email already exists
        const { data: existing } = await supabase
            .from('companies')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'A company with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Generate API key and webhook secret
        const apiKey = generateApiKey();
        const webhookSecret = generateWebhookSecret();

        // Create company
        const { data: company, error } = await supabase
            .from('companies')
            .insert({
                id: uuidv4(),
                name,
                email: email.toLowerCase(),
                password_hash: passwordHash,
                api_key: apiKey,
                webhook_secret: webhookSecret,
                plan: 'free',
                settings: {},
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating company:', error);
            return NextResponse.json(
                { error: 'Failed to create company' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Company registered successfully',
            data: {
                id: company.id,
                name: company.name,
                email: company.email,
                api_key: apiKey, // Only shown once at registration
                webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks`,
                webhook_secret: webhookSecret, // Only shown once at registration
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
