import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/api-middleware";
import crypto from "crypto";

// GET /api/v1/settings/integrations - Get all integrations for company
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticateRequest(request);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        const { data: integrations, error } = await supabase
            .from("external_integrations")
            .select("*")
            .eq("company_id", authResult.company!.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch integrations:", error);
            return NextResponse.json(
                { success: false, error: "Failed to fetch integrations" },
                { status: 500 }
            );
        }

        // Mask sensitive data
        const safeIntegrations = integrations?.map((int) => ({
            ...int,
            api_key: int.api_key ? "••••••" + int.api_key.slice(-4) : null,
            api_secret: int.api_secret ? "••••••" : null,
            webhook_secret: int.webhook_secret ? "••••••" + int.webhook_secret.slice(-4) : null,
        }));

        return NextResponse.json({
            success: true,
            integrations: safeIntegrations || [],
        });
    } catch (error) {
        console.error("Integrations fetch error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/v1/settings/integrations - Create new integration
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticateRequest(request);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        const body = await request.json();
        const {
            integration_type,
            name,
            api_url,
            api_key,
            api_secret,
            sync_riders = true,
            sync_orders = true,
            sync_customers = true,
            sync_interval_minutes = 5,
            riders_endpoint,
            orders_endpoint,
            customers_endpoint,
        } = body;

        // Validate required fields
        if (!integration_type || !name || !api_url) {
            return NextResponse.json(
                { success: false, error: "integration_type, name, and api_url are required" },
                { status: 400 }
            );
        }

        // Validate integration type
        const validTypes = ["woocommerce", "shopify", "wordpress", "custom"];
        if (!validTypes.includes(integration_type)) {
            return NextResponse.json(
                { success: false, error: `integration_type must be one of: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        // Generate webhook secret for receiving data
        const webhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

        // Set default endpoints based on integration type
        let defaultRidersEndpoint = riders_endpoint;
        let defaultOrdersEndpoint = orders_endpoint;
        let defaultCustomersEndpoint = customers_endpoint;

        if (integration_type === "woocommerce") {
            defaultRidersEndpoint = defaultRidersEndpoint || "/wp-json/delivery/v1/riders";
            defaultOrdersEndpoint = defaultOrdersEndpoint || "/wp-json/wc/v3/orders";
            defaultCustomersEndpoint = defaultCustomersEndpoint || "/wp-json/wc/v3/customers";
        } else if (integration_type === "shopify") {
            defaultRidersEndpoint = defaultRidersEndpoint || "/admin/api/2024-01/delivery_profiles.json";
            defaultOrdersEndpoint = defaultOrdersEndpoint || "/admin/api/2024-01/orders.json";
            defaultCustomersEndpoint = defaultCustomersEndpoint || "/admin/api/2024-01/customers.json";
        }

        const { data: integration, error } = await supabase
            .from("external_integrations")
            .insert({
                company_id: authResult.company!.id,
                integration_type,
                name,
                api_url: api_url.replace(/\/$/, ""), // Remove trailing slash
                api_key,
                api_secret,
                webhook_secret: webhookSecret,
                sync_riders,
                sync_orders,
                sync_customers,
                sync_interval_minutes,
                riders_endpoint: defaultRidersEndpoint,
                orders_endpoint: defaultOrdersEndpoint,
                customers_endpoint: defaultCustomersEndpoint,
            })
            .select()
            .single();

        if (error) {
            console.error("Failed to create integration:", error);
            return NextResponse.json(
                { success: false, error: "Failed to create integration" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Integration created successfully",
            integration: {
                ...integration,
                api_key: api_key ? "••••••" + api_key.slice(-4) : null,
                api_secret: api_secret ? "••••••" : null,
            },
            webhook_url: `${request.nextUrl.origin}/api/webhooks/integration/${integration.id}`,
            webhook_secret: webhookSecret,
        });
    } catch (error) {
        console.error("Integration create error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
