"use client";

import { useState, useEffect, useCallback } from "react";

export interface Rider {
    id: string;
    external_id: string | null;
    name: string;
    phone: string;
    email: string | null;
    status: "online" | "offline" | "busy";
    latitude: number | null;
    longitude: number | null;
    battery_level: number | null;
    vehicle_type: "motorcycle" | "car" | "bicycle" | "van" | "truck";
    last_seen: string | null;
    created_at: string;
    active_orders_count?: number;
}

interface UseRidersOptions {
    status?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export function useRiders(options: UseRidersOptions = {}) {
    const { status, autoRefresh = false, refreshInterval = 30000 } = options;

    const [riders, setRiders] = useState<Rider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRiders = useCallback(async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found. Please login.");
                setLoading(false);
                return;
            }

            const params = new URLSearchParams();
            if (status) params.append("status", status);

            const response = await fetch(`/api/v1/riders?${params}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch riders");
            }

            const data = await response.json();
            setRiders(data.data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchRiders();

        if (autoRefresh) {
            const interval = setInterval(fetchRiders, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchRiders, autoRefresh, refreshInterval]);

    const createRider = async (riderData: {
        name: string;
        phone: string;
        email?: string;
        vehicle_type?: string;
    }) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) throw new Error("No API key found");

        const response = await fetch("/api/v1/riders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(riderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create rider");
        }

        const data = await response.json();
        await fetchRiders();
        return data.data;
    };

    const updateRiderLocation = async (riderId: string, location: {
        latitude: number;
        longitude: number;
        battery_level?: number;
    }) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) throw new Error("No API key found");

        const response = await fetch(`/api/v1/riders/${riderId}/location`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(location),
        });

        if (!response.ok) {
            throw new Error("Failed to update rider location");
        }

        await fetchRiders();
        return response.json();
    };

    // Map API status to UI status
    const getRidersByUIStatus = useCallback(() => {
        return {
            Free: riders.filter(r => r.status === "online"),
            Busy: riders.filter(r => r.status === "busy"),
            Inactive: riders.filter(r => r.status === "offline"),
        };
    }, [riders]);

    return {
        riders,
        loading,
        error,
        refetch: fetchRiders,
        createRider,
        updateRiderLocation,
        getRidersByUIStatus,
    };
}
