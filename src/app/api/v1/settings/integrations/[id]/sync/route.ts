import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateApiKey } from "@/lib/api-middleware";

interface ExternalRider {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    vehicle_type?: string;
    status?: string;
    latitude?: number;
    longitude?: number;
}

interface ExternalOrder {
    id: string;
    status: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    delivery_address?: string;
    pickup_address?: string;
    total?: number;
    currency?: string;
    items?: unknown[];
    notes?: string;
    created_at?: string;
}

interface ExternalCustomer {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    address?: string;
    billing?: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        email?: string;
        address_1?: string;
        city?: string;
        country?: string;
    };
}

// POST /api/v1/settings/integrations/[id]/sync - Trigger sync for an integration
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authResult = await validateApiKey(request);
        if (authResult.error) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        // Get integration
        const { data: integration, error: intError } = await supabase
            .from("external_integrations")
            .select("*")
            .eq("id", id)
            .eq("company_id", authResult.company!.id)
            .single();

        if (intError || !integration) {
            return NextResponse.json(
                { success: false, error: "Integration not found" },
                { status: 404 }
            );
        }

        if (!integration.is_active) {
            return NextResponse.json(
                { success: false, error: "Integration is not active" },
                { status: 400 }
            );
        }

        const startTime = Date.now();
        const results = {
            riders: { fetched: 0, created: 0, updated: 0, failed: 0 },
            orders: { fetched: 0, created: 0, updated: 0, failed: 0 },
            customers: { fetched: 0, created: 0, updated: 0, failed: 0 },
        };
        const errors: string[] = [];

        // Build auth headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (integration.api_key) {
            if (integration.integration_type === "woocommerce") {
                // WooCommerce uses Basic Auth with consumer key/secret
                const auth = Buffer.from(
                    `${integration.api_key}:${integration.api_secret || ""}`
                ).toString("base64");
                headers["Authorization"] = `Basic ${auth}`;
            } else if (integration.integration_type === "shopify") {
                headers["X-Shopify-Access-Token"] = integration.api_key;
            } else {
                headers["Authorization"] = `Bearer ${integration.api_key}`;
            }
        }

        // Sync Riders
        if (integration.sync_riders && integration.riders_endpoint) {
            try {
                const ridersUrl = `${integration.api_url}${integration.riders_endpoint}`;
                console.log(`Fetching riders from: ${ridersUrl}`);

                const response = await fetch(ridersUrl, { headers });

                if (response.ok) {
                    const data = await response.json();
                    const riders: ExternalRider[] = Array.isArray(data)
                        ? data
                        : data.riders || data.data || [];

                    results.riders.fetched = riders.length;

                    for (const rider of riders) {
                        try {
                            const riderData = {
                                company_id: authResult.company!.id,
                                name: rider.name,
                                phone: rider.phone?.replace(/\s+/g, "").trim(),
                                email: rider.email || null,
                                vehicle_type: rider.vehicle_type || "motorcycle",
                                status: rider.status || "offline",
                                latitude: rider.latitude || null,
                                longitude: rider.longitude || null,
                                external_id: String(rider.id || rider.phone),
                                external_source: integration.integration_type,
                            };

                            // Upsert by external_id
                            const { data: existing } = await supabase
                                .from("riders")
                                .select("id")
                                .eq("company_id", authResult.company!.id)
                                .eq("external_id", riderData.external_id)
                                .single();

                            if (existing) {
                                await supabase
                                    .from("riders")
                                    .update(riderData)
                                    .eq("id", existing.id);
                                results.riders.updated++;
                            } else {
                                await supabase.from("riders").insert(riderData);
                                results.riders.created++;
                            }
                        } catch (e) {
                            results.riders.failed++;
                        }
                    }
                } else {
                    errors.push(`Riders sync failed: ${response.status} ${response.statusText}`);
                }
            } catch (e) {
                errors.push(`Riders sync error: ${e}`);
            }
        }

        // Sync Orders
        if (integration.sync_orders && integration.orders_endpoint) {
            try {
                const ordersUrl = `${integration.api_url}${integration.orders_endpoint}`;
                console.log(`Fetching orders from: ${ordersUrl}`);

                const response = await fetch(ordersUrl, { headers });

                if (response.ok) {
                    const data = await response.json();
                    const orders: ExternalOrder[] = Array.isArray(data)
                        ? data
                        : data.orders || data.data || [];

                    results.orders.fetched = orders.length;

                    for (const order of orders) {
                        try {
                            // First, ensure customer exists
                            let customerId: string | null = null;

                            if (order.customer_phone || order.customer_email) {
                                const { data: existingCustomer } = await supabase
                                    .from("customers")
                                    .select("id")
                                    .eq("company_id", authResult.company!.id)
                                    .or(
                                        `phone.eq.${order.customer_phone},email.eq.${order.customer_email}`
                                    )
                                    .single();

                                if (existingCustomer) {
                                    customerId = existingCustomer.id;
                                } else {
                                    const { data: newCustomer } = await supabase
                                        .from("customers")
                                        .insert({
                                            company_id: authResult.company!.id,
                                            name: order.customer_name || "Unknown",
                                            phone: order.customer_phone || null,
                                            email: order.customer_email || null,
                                            address: order.delivery_address || null,
                                            external_id: String(order.id),
                                            external_source: integration.integration_type,
                                        })
                                        .select("id")
                                        .single();

                                    customerId = newCustomer?.id || null;
                                }
                            }

                            // Map external status to internal status
                            let internalStatus = "pending";
                            const extStatus = order.status?.toLowerCase();
                            if (extStatus === "processing" || extStatus === "confirmed") {
                                internalStatus = "assigned";
                            } else if (extStatus === "shipped" || extStatus === "in_transit" || extStatus === "out_for_delivery") {
                                internalStatus = "in_progress";
                            } else if (extStatus === "delivered" || extStatus === "completed") {
                                internalStatus = "delivered";
                            } else if (extStatus === "cancelled" || extStatus === "refunded") {
                                internalStatus = "cancelled";
                            }

                            const orderData = {
                                company_id: authResult.company!.id,
                                customer_id: customerId,
                                external_id: String(order.id),
                                external_source: integration.integration_type,
                                status: internalStatus,
                                pickup_address: order.pickup_address || integration.name,
                                delivery_address: order.delivery_address || null,
                                notes: order.notes || null,
                            };

                            // Upsert by external_id
                            const { data: existing } = await supabase
                                .from("orders")
                                .select("id")
                                .eq("company_id", authResult.company!.id)
                                .eq("external_id", orderData.external_id)
                                .single();

                            if (existing) {
                                await supabase
                                    .from("orders")
                                    .update(orderData)
                                    .eq("id", existing.id);
                                results.orders.updated++;
                            } else {
                                await supabase.from("orders").insert(orderData);
                                results.orders.created++;
                            }
                        } catch (e) {
                            results.orders.failed++;
                        }
                    }
                } else {
                    errors.push(`Orders sync failed: ${response.status} ${response.statusText}`);
                }
            } catch (e) {
                errors.push(`Orders sync error: ${e}`);
            }
        }

        // Sync Customers
        if (integration.sync_customers && integration.customers_endpoint) {
            try {
                const customersUrl = `${integration.api_url}${integration.customers_endpoint}`;
                console.log(`Fetching customers from: ${customersUrl}`);

                const response = await fetch(customersUrl, { headers });

                if (response.ok) {
                    const data = await response.json();
                    const customers: ExternalCustomer[] = Array.isArray(data)
                        ? data
                        : data.customers || data.data || [];

                    results.customers.fetched = customers.length;

                    for (const customer of customers) {
                        try {
                            const customerName =
                                customer.name ||
                                `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
                                `${customer.billing?.first_name || ""} ${customer.billing?.last_name || ""}`.trim() ||
                                "Unknown";

                            const customerData = {
                                company_id: authResult.company!.id,
                                name: customerName,
                                phone:
                                    customer.phone ||
                                    customer.billing?.phone ||
                                    null,
                                email:
                                    customer.email ||
                                    customer.billing?.email ||
                                    null,
                                address:
                                    customer.address ||
                                    customer.billing?.address_1 ||
                                    null,
                                external_id: String(customer.id),
                                external_source: integration.integration_type,
                            };

                            // Upsert by external_id
                            const { data: existing } = await supabase
                                .from("customers")
                                .select("id")
                                .eq("company_id", authResult.company!.id)
                                .eq("external_id", customerData.external_id)
                                .single();

                            if (existing) {
                                await supabase
                                    .from("customers")
                                    .update(customerData)
                                    .eq("id", existing.id);
                                results.customers.updated++;
                            } else {
                                await supabase.from("customers").insert(customerData);
                                results.customers.created++;
                            }
                        } catch (e) {
                            results.customers.failed++;
                        }
                    }
                } else {
                    errors.push(`Customers sync failed: ${response.status} ${response.statusText}`);
                }
            } catch (e) {
                errors.push(`Customers sync error: ${e}`);
            }
        }

        const duration = Date.now() - startTime;
        const status = errors.length === 0 ? "success" : "partial";

        // Update integration with sync results
        await supabase
            .from("external_integrations")
            .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: status,
                last_sync_error: errors.length > 0 ? errors.join("; ") : null,
                total_riders_synced: integration.total_riders_synced + results.riders.created,
                total_orders_synced: integration.total_orders_synced + results.orders.created,
                total_customers_synced: integration.total_customers_synced + results.customers.created,
            })
            .eq("id", id);

        // Log the sync
        await supabase.from("integration_sync_logs").insert({
            integration_id: id,
            sync_type: "full",
            status,
            records_fetched:
                results.riders.fetched + results.orders.fetched + results.customers.fetched,
            records_created:
                results.riders.created + results.orders.created + results.customers.created,
            records_updated:
                results.riders.updated + results.orders.updated + results.customers.updated,
            records_failed:
                results.riders.failed + results.orders.failed + results.customers.failed,
            error_message: errors.length > 0 ? errors.join("; ") : null,
            duration_ms: duration,
        });

        return NextResponse.json({
            success: true,
            message: `Sync completed in ${duration}ms`,
            status,
            results,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Integration sync error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
