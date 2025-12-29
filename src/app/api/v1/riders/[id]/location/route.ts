import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { withAuth, jsonResponse, errorResponse } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

// PATCH /api/v1/riders/:id/location - Update rider location
async function handlePatch(
    request: NextRequest,
    companyId: string,
    riderId: string
) {
    const supabase = createServerClient();
    const body = await request.json();

    const { latitude, longitude, battery_level, speed, heading } = body;

    if (latitude === undefined || longitude === undefined) {
        return errorResponse('Latitude and longitude are required');
    }

    // Update rider location
    const { data, error } = await supabase
        .from('riders')
        .update({
            latitude,
            longitude,
            battery_level,
            last_seen: new Date().toISOString(),
            status: 'active', // Mark as active when location is updated
        })
        .eq('id', riderId)
        .eq('company_id', companyId)
        .select()
        .single();

    if (error) {
        return errorResponse('Failed to update location', 500);
    }

    if (!data) {
        return errorResponse('Rider not found', 404);
    }

    // Also log to location history
    await supabase.from('location_history').insert({
        rider_id: riderId,
        latitude,
        longitude,
        speed,
        heading,
    });

    return jsonResponse({
        success: true,
        message: 'Location updated',
        data: {
            id: data.id,
            latitude: data.latitude,
            longitude: data.longitude,
            last_seen: data.last_seen,
        },
    });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return withAuth(request, (req, companyId) => handlePatch(req, companyId, id));
}
