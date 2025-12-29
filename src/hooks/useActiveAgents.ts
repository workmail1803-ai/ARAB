"use client";

import { useState, useEffect, useCallback } from "react";

export interface AgentSession {
    device_type: string | null;
    device_model: string | null;
    app_version: string | null;
    last_active: string | null;
}

export interface ActiveAgent {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    status: "active" | "busy" | "break" | "offline";
    location: {
        latitude: number | null;
        longitude: number | null;
    };
    battery_level: number | null;
    vehicle_type: string;
    last_seen: string | null;
    is_online: boolean;
    session: AgentSession | null;
}

interface AgentsSummary {
    total: number;
    online: number;
    active: number;
    busy: number;
}

interface UseActiveAgentsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    includeOffline?: boolean;
}

export function useActiveAgents(options: UseActiveAgentsOptions = {}) {
    const { 
        autoRefresh = true, 
        refreshInterval = 15000, // 15 seconds default
        includeOffline = false 
    } = options;

    const [agents, setAgents] = useState<ActiveAgent[]>([]);
    const [summary, setSummary] = useState<AgentsSummary>({
        total: 0,
        online: 0,
        active: 0,
        busy: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchActiveAgents = useCallback(async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found. Please login.");
                setLoading(false);
                return;
            }

            const params = new URLSearchParams();
            if (includeOffline) params.append("include_offline", "true");

            const response = await fetch(`/api/v1/agents/active?${params}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch active agents");
            }

            const data = await response.json();
            setAgents(data.data || []);
            setSummary(data.summary || {
                total: 0,
                online: 0,
                active: 0,
                busy: 0,
            });
            setLastUpdated(new Date(data.timestamp));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [includeOffline]);

    useEffect(() => {
        fetchActiveAgents();

        if (autoRefresh) {
            const interval = setInterval(fetchActiveAgents, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchActiveAgents, autoRefresh, refreshInterval]);

    // Set agent PIN/credentials
    const setAgentCredentials = async (riderId: string, pinCode: string) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) throw new Error("No API key found");

        const response = await fetch(`/api/v1/agents/${riderId}/sessions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ pin_code: pinCode }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to set credentials");
        }

        return response.json();
    };

    // Force logout an agent
    const forceLogout = async (riderId: string) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) throw new Error("No API key found");

        const response = await fetch(`/api/v1/agents/${riderId}/sessions`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to force logout");
        }

        await fetchActiveAgents();
        return response.json();
    };

    // Get agent sessions history
    const getAgentSessions = async (riderId: string) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) throw new Error("No API key found");

        const response = await fetch(`/api/v1/agents/${riderId}/sessions`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch sessions");
        }

        return response.json();
    };

    // Group agents by status
    const getAgentsByStatus = useCallback(() => {
        return {
            online: agents.filter(a => a.is_online),
            active: agents.filter(a => a.status === "active"),
            busy: agents.filter(a => a.status === "busy"),
            onBreak: agents.filter(a => a.status === "break"),
            offline: agents.filter(a => !a.is_online || a.status === "offline"),
        };
    }, [agents]);

    // Get agents with location for map
    const getAgentsWithLocation = useCallback(() => {
        return agents.filter(
            a => a.location.latitude !== null && a.location.longitude !== null
        );
    }, [agents]);

    return {
        agents,
        summary,
        loading,
        error,
        lastUpdated,
        refetch: fetchActiveAgents,
        setAgentCredentials,
        forceLogout,
        getAgentSessions,
        getAgentsByStatus,
        getAgentsWithLocation,
    };
}
