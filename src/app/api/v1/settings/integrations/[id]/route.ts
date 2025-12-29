import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/api-middleware";

// GET /api/v1/settings/integrations/[id] - Get single integration
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await authenticateRequest(request);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        const { data: integration, error } = await supabase
            .from("external_integrations")
            .select("*")
            .eq("id", id)
            .eq("company_id", authResult.company!.id)
            .single();

        if (error || !integration) {
            return NextResponse.json(
                { success: false, error: "Integration not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            integration: {
                ...integration,
                api_key: integration.api_key ? "••••••" + integration.api_key.slice(-4) : null,
                api_secret: integration.api_secret ? "••••••" : null,
            },
        });
    } catch (error) {
        console.error("Integration fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/v1/settings/integrations/[id] - Update integration
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await authenticateRequest(request);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        // Verify integration belongs to company
        const { data: existing } = await supabase
            .from("external_integrations")
            .select("id")
            .eq("id", id)
            .eq("company_id", authResult.company!.id)
            .single();

        if (!existing) {
            return NextResponse.json(
                { success: false, error: "Integration not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        // Only update provided fields
        const allowedFields = [
            "name",
            "api_url",
            "api_key",
            "api_secret",
            "sync_riders",
            "sync_orders",
            "sync_customers",
            "sync_interval_minutes",
            "riders_endpoint",
            "orders_endpoint",
            "customers_endpoint",
            "is_active",
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const { data: integration, error } = await supabase
            .from("external_integrations")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Failed to update integration:", error);
            return NextResponse.json(
                { success: false, error: "Failed to update integration" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Integration updated successfully",
            integration: {
                ...integration,
                api_key: integration.api_key ? "••••••" + integration.api_key.slice(-4) : null,
                api_secret: integration.api_secret ? "••••••" : null,
            },
        });
    } catch (error) {
        console.error("Integration update error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/v1/settings/integrations/[id] - Delete integration
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await authenticateRequest(request);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        const { error } = await supabase
            .from("external_integrations")
            .delete()
            .eq("id", id)
            .eq("company_id", authResult.company!.id);

        if (error) {
            console.error("Failed to delete integration:", error);
            return NextResponse.json(
                { success: false, error: "Failed to delete integration" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Integration deleted successfully",
        });
    } catch (error) {
        console.error("Integration delete error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
