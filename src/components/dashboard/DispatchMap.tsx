"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Truck, Package, MapPin, Settings, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { MapSettings } from "@/hooks/useMapSettings";
import { Rider } from "@/hooks/useRiders";
import { Order } from "@/hooks/useOrders";

interface DispatchMapProps {
    mapSettings: MapSettings;
    riders: Rider[];
    orders: Order[];
    isMapConfigured: boolean;
    mapLoading: boolean;
}

// Riyadh, Saudi Arabia coordinates
const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 };
const DEFAULT_ZOOM = 12;

export default function DispatchMap({
    mapSettings,
    riders,
    orders,
    isMapConfigured,
    mapLoading,
}: DispatchMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    // Load Google Maps Script
    const loadGoogleMapsScript = useCallback(() => {
        if (!mapSettings.web_key) {
            setMapError("No API key configured");
            return;
        }

        // Check if script already loaded
        if (window.google?.maps) {
            setMapLoaded(true);
            return;
        }

        const existingScript = document.getElementById("google-maps-script");
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapSettings.web_key}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setMapLoaded(true);
            setMapError(null);
        };
        script.onerror = () => {
            setMapError("Failed to load Google Maps. Please check your API key.");
        };
        document.head.appendChild(script);
    }, [mapSettings.web_key]);

    // Initialize map when script is loaded
    useEffect(() => {
        if (mapSettings.map_type === "google" && isMapConfigured) {
            loadGoogleMapsScript();
        }
    }, [mapSettings.map_type, isMapConfigured, loadGoogleMapsScript]);

    // Create/Update Google Map
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || mapSettings.map_type !== "google") return;

        if (!googleMapRef.current) {
            googleMapRef.current = new google.maps.Map(mapRef.current, {
                center: DEFAULT_CENTER,
                zoom: DEFAULT_ZOOM,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                    },
                ],
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Add rider markers
        riders
            .filter((r) => r.status !== "offline" && r.latitude && r.longitude)
            .forEach((rider) => {
                const marker = new google.maps.Marker({
                    position: { lat: rider.latitude!, lng: rider.longitude! },
                    map: googleMapRef.current,
                    title: rider.name,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: rider.status === "busy" ? "#f97316" : "#22c55e",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                    },
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px;">
                            <strong>${rider.name}</strong><br/>
                            <span style="color: ${rider.status === "busy" ? "#f97316" : "#22c55e"}">
                                ${rider.status === "busy" ? "Busy" : "Available"}
                            </span><br/>
                            <small>${rider.phone || "No phone"}</small>
                        </div>
                    `,
                });

                marker.addListener("click", () => {
                    infoWindow.open(googleMapRef.current, marker);
                });

                markersRef.current.push(marker);
            });

        // Add order markers for pending orders
        orders
            .filter((o) => o.status === "pending")
            .slice(0, 10)
            .forEach((order, index) => {
                // Generate pseudo-random positions around Riyadh for demo
                const lat = DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.1;
                const lng = DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.1;

                const marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: googleMapRef.current,
                    title: order.customer?.name || "Order",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#3b82f6",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                    },
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px;">
                            <strong>${order.customer?.name || "Unknown"}</strong><br/>
                            <small>${order.delivery_address || "No address"}</small>
                        </div>
                    `,
                });

                marker.addListener("click", () => {
                    infoWindow.open(googleMapRef.current, marker);
                });

                markersRef.current.push(marker);
            });
    }, [mapLoaded, riders, orders, mapSettings.map_type]);

    // Render unconfigured state
    if (!isMapConfigured && !mapLoading) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Map Not Configured
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Connect your map provider to see your riders and deliveries in real-time
                        on the dispatch dashboard.
                    </p>
                    <Link
                        href="/dashboard/settings/map"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Configure Map
                    </Link>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-green-200/30 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-200/30 rounded-full blur-xl" />
                </div>
            </div>
        );
    }

    // Render loading state
    if (mapLoading) {
        return (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-sm text-gray-500">Loading map configuration...</span>
                </div>
            </div>
        );
    }

    // Render error state
    if (mapError) {
        return (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Map Error</h3>
                    <p className="text-sm text-gray-500 mb-4">{mapError}</p>
                    <Link
                        href="/dashboard/settings/map"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        Check Settings →
                    </Link>
                </div>
            </div>
        );
    }

    // Render Google Map
    if (mapSettings.map_type === "google" && isMapConfigured) {
        return (
            <div ref={mapRef} className="absolute inset-0">
                {!mapLoaded && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <span className="text-sm text-gray-500">Loading Google Maps...</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render Mappr placeholder map (default static map)
    return (
        <div className="absolute inset-0 bg-[#e8d5b0]">
            {/* Desert terrain pattern */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.4 }}
            >
                <defs>
                    <pattern
                        id="saudiMap"
                        width="80"
                        height="80"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 80 0 L 0 0 0 80"
                            fill="none"
                            stroke="#d4a574"
                            strokeWidth="0.5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#saudiMap)" />
            </svg>

            {/* Main Roads */}
            <div className="absolute inset-0">
                <div className="absolute top-0 bottom-0 left-1/3 w-1.5 bg-yellow-400/60" />
                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-yellow-300/50" />
                <div className="absolute top-0 bottom-0 right-1/4 w-1.5 bg-yellow-400/60" />
                <div className="absolute left-0 right-0 top-1/4 h-1 bg-yellow-300/50" />
                <div
                    className="absolute left-0 right-0 top-1/2 h-2 bg-orange-400/50"
                    style={{ transform: "rotate(-5deg)" }}
                />
                <div className="absolute left-0 right-0 bottom-1/4 h-1 bg-yellow-300/50" />
            </div>

            {/* City Labels */}
            <div className="absolute top-16 left-20 text-[10px] text-gray-600 font-semibold tracking-wide">
                RIYADH
            </div>
            <div className="absolute top-20 left-24 text-[9px] text-gray-500">
                المملكة العربية السعودية
            </div>
            <div className="absolute top-28 right-32 text-[10px] text-gray-500 font-medium">
                AL OLAYA
            </div>
            <div className="absolute top-44 left-40 text-[10px] text-gray-500 font-medium">
                AL MALAZ
            </div>
            <div className="absolute top-56 right-48 text-[10px] text-gray-500 font-medium">
                AL MURABBA
            </div>
            <div className="absolute bottom-48 left-32 text-[10px] text-gray-500 font-medium">
                AL SULIMANIYAH
            </div>
            <div className="absolute bottom-36 right-40 text-[10px] text-gray-500 font-medium">
                AL WURUD
            </div>
            <div className="absolute bottom-24 left-48 text-[10px] text-gray-500 font-medium">
                AL NAKHEEL
            </div>

            {/* Green areas */}
            <div className="absolute top-1/3 left-1/4 w-16 h-12 bg-green-300/30 rounded-lg" />
            <div className="absolute bottom-1/3 right-1/3 w-20 h-10 bg-green-300/30 rounded-lg" />

            {/* Driver markers from API */}
            {riders
                .filter((r) => r.status !== "offline")
                .map((rider, i) => (
                    <div
                        key={rider.id}
                        className="absolute group"
                        style={{
                            left: `${20 + i * 18}%`,
                            top: `${25 + (i % 3) * 22}%`,
                        }}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition-transform hover:scale-110 ${
                                rider.status === "busy"
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                            }`}
                        >
                            <Truck className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className="text-[8px] bg-white px-1 py-0.5 rounded shadow text-gray-600">
                                {rider.name.split(" ")[0]}
                            </span>
                        </div>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                <div className="font-medium">{rider.name}</div>
                                <div className="text-gray-300">{rider.phone}</div>
                                <div
                                    className={`${
                                        rider.status === "busy"
                                            ? "text-orange-400"
                                            : "text-green-400"
                                    }`}
                                >
                                    {rider.status === "busy" ? "Busy" : "Available"}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            {/* Task markers */}
            {orders
                .filter((o) => o.status === "pending")
                .slice(0, 3)
                .map((order, i) => (
                    <div
                        key={order.id}
                        className="absolute group"
                        style={{
                            left: `${30 + i * 15}%`,
                            top: `${35 + i * 12}%`,
                        }}
                    >
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse cursor-pointer">
                            <Package className="w-3 h-3 text-white" />
                        </div>
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                <div className="font-medium">
                                    {order.customer?.name || "Unknown"}
                                </div>
                                <div className="text-gray-300 max-w-[150px] truncate">
                                    {order.delivery_address}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            {/* Map Attribution */}
            <div className="absolute bottom-2 right-4 flex items-center gap-2 text-[10px] text-gray-500">
                <span>{mapSettings.map_type === "mappr" ? "Mappr" : "Static Map"}</span>
                <MapPin className="w-3 h-3" />
            </div>

            {/* Real-time tracking indicator */}
            {mapSettings.real_time_tracking && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-600">Live Tracking</span>
                </div>
            )}
        </div>
    );
}

// Add Google Maps types
declare global {
    interface Window {
        google: typeof google;
    }
}
