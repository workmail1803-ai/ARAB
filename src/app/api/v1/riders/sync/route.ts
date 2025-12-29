import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/api-middleware";

// POST /api/v1/riders/sync - Webhook endpoint for real-time rider sync
// Companies can call this from their system whenever a rider is added/updated/deleted
export async function POST(request: NextRequest) {
    try {
        // Validate API key and get company
        const authResult = await authenticateRequest(request);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        const body = await request.json();
        const { action, rider } = body;

        // Validate request
        if (!action || !rider) {
            return NextResponse.json(
                { success: false, error: "action and rider are required" },
                { status: 400 }
            );
        }

        if (!["create", "update", "delete"].includes(action)) {
            return NextResponse.json(
                { success: false, error: "action must be: create, update, or delete" },
                { status: 400 }
            );
        }

        const normalizedPhone = rider.phone?.replace(/\s+/g, "").trim();

        switch (action) {
            case "create": {
                if (!rider.name || !rider.phone) {
                    return NextResponse.json(
                        { success: false, error: "name and phone are required for create" },
                        { status: 400 }
                    );
                }

                // Check if already exists
                const { data: existing } = await supabase
                    .from("riders")
                    .select("id")
                    .eq("company_id", authResult.company!.id)
                    .eq("phone", normalizedPhone)
                    .single();

                if (existing) {
                    return NextResponse.json(
                        { success: false, error: "Rider with this phone already exists" },
                        { status: 409 }
                    );
                }

                const { data: newRider, error: createError } = await supabase
                    .from("riders")
                    .insert({
                        company_id: authResult.company!.id,
                        name: rider.name,
                        phone: normalizedPhone,
                        email: rider.email || null,
                        vehicle_type: rider.vehicle_type || "motorcycle",
                        status: "offline",
                        external_id: rider.external_id || rider.id || null,
                    })
                    .select()
                    .single();

                if (createError) {
                    return NextResponse.json(
                        { success: false, error: createError.message },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    action: "created",
                    rider: newRider,
                });
            }

            case "update": {
                // Find rider by external_id or phone
                let query = supabase
                    .from("riders")
                    .select("id")
                    .eq("company_id", authResult.company!.id);

                if (rider.external_id) {
                    query = query.eq("external_id", rider.external_id);
                } else if (rider.phone) {
                    query = query.eq("phone", normalizedPhone);
                } else {
                    return NextResponse.json(
                        { success: false, error: "external_id or phone required for update" },
                        { status: 400 }
                    );
                }

                const { data: existing } = await query.single();

                if (!existing) {
                    return NextResponse.json(
                        { success: false, error: "Rider not found" },
                        { status: 404 }
                    );
                }

                const updateData: Record<string, unknown> = {
                    updated_at: new Date().toISOString(),
                };

                if (rider.name) updateData.name = rider.name;
                if (rider.phone) updateData.phone = normalizedPhone;
                if (rider.email !== undefined) updateData.email = rider.email;
                if (rider.vehicle_type) updateData.vehicle_type = rider.vehicle_type;
                if (rider.status) updateData.status = rider.status;

                const { data: updatedRider, error: updateError } = await supabase
                    .from("riders")
                    .update(updateData)
                    .eq("id", existing.id)
                    .select()
                    .single();

                if (updateError) {
                    return NextResponse.json(
                        { success: false, error: updateError.message },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    action: "updated",
                    rider: updatedRider,
                });
            }

            case "delete": {
                // Find rider by external_id or phone
                let query = supabase
                    .from("riders")
                    .select("id")
                    .eq("company_id", authResult.company!.id);

                if (rider.external_id) {
                    query = query.eq("external_id", rider.external_id);
                } else if (rider.phone) {
                    query = query.eq("phone", normalizedPhone);
                } else {
                    return NextResponse.json(
                        { success: false, error: "external_id or phone required for delete" },
                        { status: 400 }
                    );
                }

                const { data: existing } = await query.single();

                if (!existing) {
                    return NextResponse.json(
                        { success: false, error: "Rider not found" },
                        { status: 404 }
                    );
                }

                const { error: deleteError } = await supabase
                    .from("riders")
                    .delete()
                    .eq("id", existing.id);

                if (deleteError) {
                    return NextResponse.json(
                        { success: false, error: deleteError.message },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    action: "deleted",
                    rider_id: existing.id,
                });
            }
        }
    } catch (error) {
        console.error("Rider sync error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to sync rider" },
            { status: 500 }
        );
    }
}
