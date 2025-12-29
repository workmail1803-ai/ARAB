import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse, errorResponse } from '@/lib/api-middleware';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET /api/v1/riders - List all riders
async function handleGet(request: NextRequest, companyId: string) {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
        .from('riders')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
        return errorResponse('Failed to fetch riders', 500);
    }

    return jsonResponse({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil((count || 0) / limit),
        },
    });
}

// POST /api/v1/riders - Create a new rider
async function handlePost(request: NextRequest, companyId: string) {
    const supabase = createServerClient();
    const body = await request.json();

    const { name, phone, email, external_id, vehicle_type } = body;

    if (!name) {
        return errorResponse('Rider name is required');
    }

    const { data, error } = await supabase
        .from('riders')
        .insert({
            id: uuidv4(),
            company_id: companyId,
            name,
            phone,
            email,
            external_id,
            vehicle_type,
            status: 'offline',
        })
        .select()
        .single();

    if (error) {
        return errorResponse('Failed to create rider', 500);
    }

    return jsonResponse({ success: true, data }, 201);
}

// Main handler
export async function GET(request: NextRequest) {
    return withAuth(request, handleGet);
}

export async function POST(request: NextRequest) {
    return withAuth(request, handlePost);
}
