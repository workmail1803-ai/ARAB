import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/api-middleware";

// POST /api/v1/riders/import - Bulk import riders from external system
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
        const { riders, sync_mode = "merge" } = body;

        // Validate riders array
        if (!Array.isArray(riders) || riders.length === 0) {
            return NextResponse.json(
                { success: false, error: "riders array is required" },
                { status: 400 }
            );
        }

        if (riders.length > 500) {
            return NextResponse.json(
                { success: false, error: "Maximum 500 riders per import" },
                { status: 400 }
            );
        }

        const results = {
            created: 0,
            updated: 0,
            skipped: 0,
            errors: [] as { index: number; phone: string; error: string }[],
        };

        // Process each rider
        for (let i = 0; i < riders.length; i++) {
            const rider = riders[i];

            // Validate required fields
            if (!rider.name || !rider.phone) {
                results.errors.push({
                    index: i,
                    phone: rider.phone || "unknown",
                    error: "name and phone are required",
                });
                results.skipped++;
                continue;
            }

            // Normalize phone number (remove spaces, ensure format)
            const normalizedPhone = rider.phone.replace(/\s+/g, "").trim();

            // Check if rider already exists (by phone number)
            const { data: existingRider } = await supabase
                .from("riders")
                .select("id")
                .eq("company_id", authResult.company!.id)
                .eq("phone", normalizedPhone)
                .single();

            if (existingRider) {
                if (sync_mode === "merge" || sync_mode === "update") {
                    // Update existing rider
                    const { error: updateError } = await supabase
                        .from("riders")
                        .update({
                            name: rider.name,
                            email: rider.email || null,
                            vehicle_type: rider.vehicle_type || "motorcycle",
                            status: rider.status || "offline",
                            latitude: rider.latitude || null,
                            longitude: rider.longitude || null,
                            external_id: rider.external_id || rider.id || null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", existingRider.id);

                    if (updateError) {
                        results.errors.push({
                            index: i,
                            phone: normalizedPhone,
                            error: updateError.message,
                        });
                        results.skipped++;
                    } else {
                        results.updated++;
                    }
                } else {
                    // Skip existing
                    results.skipped++;
                }
            } else {
                // Create new rider
                const { error: insertError } = await supabase
                    .from("riders")
                    .insert({
                        company_id: authResult.company!.id,
                        name: rider.name,
                        phone: normalizedPhone,
                        email: rider.email || null,
                        vehicle_type: rider.vehicle_type || "motorcycle",
                        status: rider.status || "offline",
                        latitude: rider.latitude || null,
                        longitude: rider.longitude || null,
                        external_id: rider.external_id || rider.id || null,
                    });

                if (insertError) {
                    results.errors.push({
                        index: i,
                        phone: normalizedPhone,
                        error: insertError.message,
                    });
                    results.skipped++;
                } else {
                    results.created++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Import complete: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
            results,
        });
    } catch (error) {
        console.error("Riders import error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to import riders" },
            { status: 500 }
        );
    }
}
