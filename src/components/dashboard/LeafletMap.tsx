"use client";

import { useEffect, useRef, useState } from "react";
import { Rider } from "@/hooks/useRiders";
import { Order } from "@/hooks/useOrders";

// Riyadh, Saudi Arabia coordinates
const DEFAULT_CENTER: [number, number] = [24.7136, 46.6753];
const DEFAULT_ZOOM = 12;

interface LeafletMapProps {
    riders: Rider[];
    orders: Order[];
    onRiderClick?: (rider: Rider) => void;
    onOrderClick?: (order: Order) => void;
}

export default function LeafletMap({ 
    riders, 
    orders, 
    onRiderClick, 
    onOrderClick 
}: LeafletMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const [isClient, setIsClient] = useState(false);

    // Only run on client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!isClient || !mapRef.current || mapInstanceRef.current) return;

        // Dynamically import Leaflet (client-side only)
        const initMap = async () => {
            const L = (await import("leaflet")).default;
            // Import CSS via link tag to avoid TypeScript issues
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link");
                link.id = "leaflet-css";
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            // Fix default marker icons
            delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            });

            // Create map
            const map = L.map(mapRef.current!, {
                center: DEFAULT_CENTER,
                zoom: DEFAULT_ZOOM,
                zoomControl: true,
            });

            // Add OpenStreetMap tiles (FREE!)
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            mapInstanceRef.current = map;

            // Force a resize after a short delay
            setTimeout(() => map.invalidateSize(), 100);
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isClient]);

    // Update markers when riders change
    useEffect(() => {
        if (!mapInstanceRef.current || !isClient) return;

        const updateMarkers = async () => {
            const L = (await import("leaflet")).default;
            const map = mapInstanceRef.current!;

            // Clear existing markers
            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];

            // Add rider markers
            riders.forEach((rider) => {
                if (rider.latitude && rider.longitude) {
                    const riderIcon = L.divIcon({
                        className: "custom-rider-marker",
                        html: `
                            <div style="
                                width: 36px;
                                height: 36px;
                                background: ${rider.status === "online" ? "#22c55e" : rider.status === "busy" ? "#f59e0b" : "#6b7280"};
                                border: 3px solid white;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            ">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            </div>
                        `,
                        iconSize: [36, 36],
                        iconAnchor: [18, 36],
                        popupAnchor: [0, -36],
                    });

                    const marker = L.marker([rider.latitude, rider.longitude], {
                        icon: riderIcon,
                    }).addTo(map);

                    // Popup content
                    marker.bindPopup(`
                        <div style="min-width: 150px; font-family: system-ui;">
                            <strong style="font-size: 14px;">${rider.name}</strong><br/>
                            <span style="color: ${rider.status === "online" ? "#22c55e" : rider.status === "busy" ? "#f59e0b" : "#6b7280"}; font-size: 12px;">
                                ● ${rider.status}
                            </span><br/>
                            <span style="font-size: 12px; color: #666;">
                                ${rider.phone || "No phone"}<br/>
                                🔋 ${rider.battery_level || 0}% • ${rider.vehicle_type || "Unknown"}
                            </span>
                        </div>
                    `);

                    marker.on("click", () => {
                        if (onRiderClick) onRiderClick(rider);
                    });

                    markersRef.current.push(marker);
                }
            });

            // Add order delivery markers
            orders
                .filter((o) => o.status !== "delivered" && o.status !== "cancelled")
                .forEach((order) => {
                    // For demo, use a position near riders
                    // In production, you'd geocode the delivery address
                    const lat = DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.1;
                    const lng = DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.1;

                    const orderIcon = L.divIcon({
                        className: "custom-order-marker",
                        html: `
                            <div style="
                                width: 28px;
                                height: 28px;
                                background: ${order.status === "pending" ? "#ef4444" : order.status === "assigned" ? "#3b82f6" : "#8b5cf6"};
                                border: 2px solid white;
                                border-radius: 4px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                            ">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                    <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-6 0h-4V5h4v2z"/>
                                </svg>
                            </div>
                        `,
                        iconSize: [28, 28],
                        iconAnchor: [14, 28],
                        popupAnchor: [0, -28],
                    });

                    const marker = L.marker([lat, lng], { icon: orderIcon }).addTo(map);

                    marker.bindPopup(`
                        <div style="min-width: 150px; font-family: system-ui;">
                            <strong style="font-size: 14px;">Order #${order.external_id || order.id.slice(0, 8)}</strong><br/>
                            <span style="color: ${order.status === "pending" ? "#ef4444" : "#3b82f6"}; font-size: 12px;">
                                ● ${order.status}
                            </span><br/>
                            <span style="font-size: 11px; color: #666;">
                                ${order.delivery_address || "Unknown address"}
                            </span>
                        </div>
                    `);

                    marker.on("click", () => {
                        if (onOrderClick) onOrderClick(order);
                    });

                    markersRef.current.push(marker);
                });

            // Fit bounds if we have markers
            if (markersRef.current.length > 0) {
                const group = L.featureGroup(markersRef.current);
                map.fitBounds(group.getBounds().pad(0.1));
            }
        };

        updateMarkers();
    }, [riders, orders, isClient, onRiderClick, onOrderClick]);

    if (!isClient) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-gray-500">Loading map...</div>
            </div>
        );
    }

    return (
        <div 
            ref={mapRef} 
            className="w-full h-full rounded-lg"
            style={{ minHeight: "400px" }}
        />
    );
}
