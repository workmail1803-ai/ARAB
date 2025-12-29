"use client";

import { useState, useEffect, useCallback } from "react";

export interface Order {
    id: string;
    external_id: string | null;
    customer_id: string | null;
    rider_id: string | null;
    status: "pending" | "assigned" | "picked_up" | "delivered" | "cancelled";
    delivery_address: string;
    pickup_address: string | null;
    items: Array<{ name: string; quantity: number; price?: number }>;
    total: number;
    notes: string | null;
    scheduled_time: string | null;
    payment_status: "pending" | "paid" | "failed";
    created_at: string;
    updated_at: string;
    customer?: {
        id: string;
        name: string;
        phone: string;
        email: string | null;
    };
    rider?: {
        id: string;
        name: string;
        phone: string;
    };
}

interface UseOrdersOptions {
    status?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

const API_KEY = typeof window !== "undefined"
    ? localStorage.getItem("api_key") || ""
    : "";

export function useOrders(options: UseOrdersOptions = {}) {
    const { status, autoRefresh = false, refreshInterval = 30000 } = options;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found. Please login.");
                setLoading(false);
                return;
            }

            const params = new URLSearchParams();
            if (status) params.append("status", status);

            const response = await fetch(`/api/v1/orders?${params}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(data.data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchOrders();

        if (autoRefresh) {
            const interval = setInterval(fetchOrders, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchOrders, autoRefresh, refreshInterval]);

    const createOrder = async (orderData: {
        customer_name: string;
        customer_phone: string;
        customer_email?: string;
        delivery_address: string;
        pickup_address?: string;
        items?: Array<{ name: string; quantity: number; price?: number }>;
        total?: number;
        notes?: string;
        scheduled_time?: string;
        rider_id?: string;
    }) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) throw new Error("No API key found");

        const response = await fetch("/api/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create order");
        }

        const data = await response.json();

        // Refresh orders list
        await fetchOrders();

        return data.data;
    };

    const updateOrder = async (orderId: string, updates: Partial<Order>) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) throw new Error("No API key found");

        const response = await fetch(`/api/v1/orders/${orderId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error("Failed to update order");
        }

        await fetchOrders();
        return response.json();
    };

    // Map API status to UI status
    const getOrdersByUIStatus = useCallback(() => {
        return {
            Unassigned: orders.filter(o => o.status === "pending" && !o.rider_id),
            Assigned: orders.filter(o => o.status === "assigned" || (o.status === "pending" && o.rider_id)),
            Completed: orders.filter(o => o.status === "delivered"),
        };
    }, [orders]);

    return {
        orders,
        loading,
        error,
        refetch: fetchOrders,
        createOrder,
        updateOrder,
        getOrdersByUIStatus,
    };
}
