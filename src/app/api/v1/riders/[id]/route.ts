import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse, errorResponse } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// GET /api/v1/riders/:id - Get single rider
async function handleGet(
    request: NextRequest,
    companyId: string,
    riderId: string
) {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('riders')
        .select('*')
        .eq('id', riderId)
        .eq('company_id', companyId)
        .single();

    if (error || !data) {
        return errorResponse('Rider not found', 404);
    }

    return jsonResponse({ success: true, data });
}

// PATCH /api/v1/riders/:id - Update rider
async function handlePatch(
    request: NextRequest,
    companyId: string,
    riderId: string
) {
    const supabase = createServerClient();
    const body = await request.json();

    const { name, phone, email, status, vehicle_type } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;
    if (vehicle_type !== undefined) updateData.vehicle_type = vehicle_type;

    const { data, error } = await supabase
        .from('riders')
        .update(updateData)
        .eq('id', riderId)
        .eq('company_id', companyId)
        .select()
        .single();

    if (error) {
        return errorResponse('Failed to update rider', 500);
    }

    if (!data) {
        return errorResponse('Rider not found', 404);
    }

    return jsonResponse({ success: true, data });
}

// DELETE /api/v1/riders/:id - Delete rider
async function handleDelete(
    request: NextRequest,
    companyId: string,
    riderId: string
) {
    const supabase = createServerClient();

    const { error } = await supabase
        .from('riders')
        .delete()
        .eq('id', riderId)
        .eq('company_id', companyId);

    if (error) {
        return errorResponse('Failed to delete rider', 500);
    }

    return jsonResponse({ success: true, message: 'Rider deleted' });
}

// Route handlers
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handleGet(req, companyId, id));
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handlePatch(req, companyId, id));
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handleDelete(req, companyId, id));
}
