import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export interface AuthenticatedRequest extends NextRequest {
    companyId?: string;
}

// Validate API key and return company ID
export async function validateApiKey(apiKey: string): Promise<string | null> {
    const supabase = createServerClient();

    console.log('[API Auth] Validating API key:', apiKey.substring(0, 20) + '...');

    const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('api_key', apiKey)
        .single();

    if (error) {
        console.error('[API Auth] Supabase error:', error.message, error.code);
        return null;
    }

    if (!data) {
        console.error('[API Auth] No company found for API key');
        return null;
    }

    console.log('[API Auth] Company found:', data.id);
    return data.id as string;
}

// API authentication middleware
export async function withAuth(
    request: NextRequest,
    handler: (req: NextRequest, companyId: string) => Promise<NextResponse>
): Promise<NextResponse> {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[API Auth] Missing or invalid authorization header');
        return NextResponse.json(
            { error: 'Missing or invalid authorization header' },
            { status: 401 }
        );
    }

    const apiKey = authHeader.replace('Bearer ', '').trim();
    const companyId = await validateApiKey(apiKey);

    if (!companyId) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        );
    }

    return handler(request, companyId);
}

// Helper to create JSON response
export function jsonResponse(data: unknown, status = 200): NextResponse {
    return NextResponse.json(data, { status });
}

// Helper to create error response
export function errorResponse(message: string, status = 400): NextResponse {
    return NextResponse.json({ error: message }, { status });
}
