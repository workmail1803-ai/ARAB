"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

export interface RiderLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status: string;
    battery_level: number | null;
    last_seen: string;
}

interface UseRealtimeTrackingOptions {
    enabled?: boolean;
    onLocationUpdate?: (rider: RiderLocation) => void;
    onStatusChange?: (riderId: string, oldStatus: string, newStatus: string) => void;
}

export function useRealtimeTracking(options: UseRealtimeTrackingOptions = {}) {
    const { 
        enabled = true, 
        onLocationUpdate, 
        onStatusChange 
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [riders, setRiders] = useState<Map<string, RiderLocation>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

    // Initialize Supabase client
    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            setError("Supabase configuration missing");
            return;
        }

        supabaseRef.current = createClient(supabaseUrl, supabaseKey, {
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        });
    }, []);

    // Subscribe to rider updates
    const subscribe = useCallback((companyId: string) => {
        if (!supabaseRef.current || !enabled) return;

        // Unsubscribe from existing channel
        if (channelRef.current) {
            supabaseRef.current.removeChannel(channelRef.current);
        }

        // Create new channel for this company's riders
        const channel = supabaseRef.current
            .channel(`riders:${companyId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "riders",
                    filter: `company_id=eq.${companyId}`,
                },
                (payload) => {
                    const newData = payload.new as RiderLocation;
                    const oldData = payload.old as RiderLocation;

                    // Update local state
                    setRiders((prev) => {
                        const updated = new Map(prev);
                        updated.set(newData.id, newData);
                        return updated;
                    });

                    // Callback for location updates
                    if (onLocationUpdate && 
                        (newData.latitude !== oldData.latitude || 
                         newData.longitude !== oldData.longitude)) {
                        onLocationUpdate(newData);
                    }

                    // Callback for status changes
                    if (onStatusChange && newData.status !== oldData.status) {
                        onStatusChange(newData.id, oldData.status, newData.status);
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === "SUBSCRIBED");
                if (status === "CHANNEL_ERROR") {
                    setError("Failed to connect to real-time updates");
                }
            });

        channelRef.current = channel;
    }, [enabled, onLocationUpdate, onStatusChange]);

    // Unsubscribe
    const unsubscribe = useCallback(() => {
        if (supabaseRef.current && channelRef.current) {
            supabaseRef.current.removeChannel(channelRef.current);
            channelRef.current = null;
            setIsConnected(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            unsubscribe();
        };
    }, [unsubscribe]);

    // Get all riders as array
    const getRidersArray = useCallback(() => {
        return Array.from(riders.values());
    }, [riders]);

    // Get specific rider
    const getRider = useCallback((riderId: string) => {
        return riders.get(riderId);
    }, [riders]);

    return {
        isConnected,
        riders: getRidersArray(),
        ridersMap: riders,
        error,
        subscribe,
        unsubscribe,
        getRider,
    };
}

// Hook for subscribing to a specific rider's location
export function useRiderTracking(riderId: string | null, enabled = true) {
    const [location, setLocation] = useState<RiderLocation | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!riderId || !enabled) {
            setIsTracking(false);
            return;
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch initial location
        supabase
            .from("riders")
            .select("id, name, latitude, longitude, status, battery_level, last_seen")
            .eq("id", riderId)
            .single()
            .then(({ data }) => {
                if (data) setLocation(data as RiderLocation);
            });

        // Subscribe to updates
        const channel = supabase
            .channel(`rider:${riderId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "riders",
                    filter: `id=eq.${riderId}`,
                },
                (payload) => {
                    setLocation(payload.new as RiderLocation);
                }
            )
            .subscribe((status) => {
                setIsTracking(status === "SUBSCRIBED");
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            setIsTracking(false);
        };
    }, [riderId, enabled]);

    return {
        location,
        isTracking,
    };
}
