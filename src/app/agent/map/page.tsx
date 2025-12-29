"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
    ArrowLeft,
    Package,
    MapPin,
    Clock,
    User,
    Navigation,
    Locate,
    Layers,
    RefreshCw
} from "lucide-react";

// Dynamic import for Leaflet (client-side only)
const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import("react-leaflet").then((mod) => mod.Popup),
    { ssr: false }
);
const Polyline = dynamic(
    () => import("react-leaflet").then((mod) => mod.Polyline),
    { ssr: false }
);

interface Order {
    id: string;
    order_id: string;
    pickup_address: string;
    pickup_latitude: number;
    pickup_longitude: number;
    delivery_address: string;
    delivery_latitude: number;
    delivery_longitude: number;
    status: string;
    customer_name?: string;
}

export default function AgentMapPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Import Leaflet icons
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("leaflet").then((L) => {
                delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                });
                setMapReady(true);
            });
        }
    }, []);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem("agent_token");
            if (!token) return;

            const response = await fetch("/api/agent/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const ordersList = data.data.orders || [];
                // Filter active orders with coordinates
                const activeOrders = ordersList.filter((o: Order) =>
                    ["assigned", "picked_up", "in_transit"].includes(o.status) &&
                    o.delivery_latitude && o.delivery_longitude
                );
                setOrders(activeOrders);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get current location
    const getCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation([latitude, longitude]);
                    
                    // Center map on current location
                    if (mapRef.current) {
                        mapRef.current.setView([latitude, longitude], 14);
                    }
                },
                (error) => {
                    console.error("Location error:", error);
                    // Default to Riyadh
                    setCurrentLocation([24.7136, 46.6753]);
                },
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        getCurrentLocation();

        // Watch position
        let watchId: number;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setCurrentLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => console.error("Watch error:", error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [fetchOrders, getCurrentLocation]);

    const centerOnLocation = () => {
        if (currentLocation && mapRef.current) {
            mapRef.current.setView(currentLocation, 15);
        }
    };

    const fitAllMarkers = () => {
        if (!mapRef.current) return;
        
        const bounds: [number, number][] = [];
        if (currentLocation) bounds.push(currentLocation);
        
        orders.forEach((order) => {
            if (order.pickup_latitude && order.pickup_longitude) {
                bounds.push([order.pickup_latitude, order.pickup_longitude]);
            }
            if (order.delivery_latitude && order.delivery_longitude) {
                bounds.push([order.delivery_latitude, order.delivery_longitude]);
            }
        });

        if (bounds.length > 0) {
            const L = require("leaflet");
            mapRef.current.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
        }
    };

    // Create custom icons
    const createIcon = (color: string, label?: string) => {
        if (typeof window === "undefined") return undefined;
        const L = require("leaflet");
        
        return L.divIcon({
            className: "custom-marker",
            html: `
                <div style="
                    width: 32px;
                    height: 32px;
                    background: ${color};
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    ${label ? `<span style="transform: rotate(45deg); color: white; font-size: 12px; font-weight: bold;">${label}</span>` : ""}
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });
    };

    const defaultCenter: [number, number] = currentLocation || [24.7136, 46.6753];

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
                <div className="flex items-center gap-3 p-4">
                    <button onClick={() => router.push("/agent")} className="p-2 -ml-2">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-white font-semibold text-lg flex-1">Live Map</h1>
                    <button onClick={fetchOrders} className="p-2 text-slate-400">
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Map */}
            <div className="relative" style={{ height: "calc(100vh - 140px)" }}>
                {!mapReady ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <>
                        <link
                            rel="stylesheet"
                            href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"
                        />
                        <MapContainer
                            center={defaultCenter}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                            ref={(map) => { mapRef.current = map as L.Map | null; }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Current Location Marker */}
                            {currentLocation && (
                                <Marker
                                    position={currentLocation}
                                    icon={createIcon("#3b82f6")}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-semibold">Your Location</p>
                                            <p className="text-xs text-gray-500">
                                                {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Order Markers */}
                            {orders.map((order, idx) => (
                                <div key={order.id}>
                                    {/* Pickup Marker */}
                                    {order.pickup_latitude && order.pickup_longitude && (
                                        <Marker
                                            position={[order.pickup_latitude, order.pickup_longitude]}
                                            icon={createIcon("#22c55e", "P")}
                                        >
                                            <Popup>
                                                <div>
                                                    <p className="font-semibold text-green-600">Pickup</p>
                                                    <p className="text-sm">#{order.order_id}</p>
                                                    <p className="text-xs text-gray-500">{order.pickup_address}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* Delivery Marker */}
                                    {order.delivery_latitude && order.delivery_longitude && (
                                        <Marker
                                            position={[order.delivery_latitude, order.delivery_longitude]}
                                            icon={createIcon("#ef4444", "D")}
                                            eventHandlers={{
                                                click: () => setSelectedOrder(order)
                                            }}
                                        >
                                            <Popup>
                                                <div>
                                                    <p className="font-semibold text-red-600">Delivery</p>
                                                    <p className="text-sm">#{order.order_id}</p>
                                                    <p className="text-xs text-gray-500">{order.delivery_address}</p>
                                                    {order.customer_name && (
                                                        <p className="text-xs mt-1">{order.customer_name}</p>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* Route Line */}
                                    {order.pickup_latitude && order.pickup_longitude &&
                                        order.delivery_latitude && order.delivery_longitude && (
                                            <Polyline
                                                positions={[
                                                    [order.pickup_latitude, order.pickup_longitude],
                                                    [order.delivery_latitude, order.delivery_longitude]
                                                ]}
                                                pathOptions={{
                                                    color: order.status === "in_transit" ? "#f59e0b" : "#6b7280",
                                                    weight: 3,
                                                    dashArray: order.status === "in_transit" ? undefined : "5, 10"
                                                }}
                                            />
                                        )}
                                </div>
                            ))}
                        </MapContainer>

                        {/* Map Controls */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
                            <button
                                onClick={centerOnLocation}
                                className="p-3 bg-white rounded-full shadow-lg text-slate-700"
                            >
                                <Locate className="w-5 h-5" />
                            </button>
                            <button
                                onClick={fitAllMarkers}
                                className="p-3 bg-white rounded-full shadow-lg text-slate-700"
                            >
                                <Layers className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                            <div className="flex items-center gap-2 text-xs mb-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>Your Location</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs mb-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Pickup Point</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Delivery Point</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Selected Order Info */}
            {selectedOrder && (
                <div className="absolute bottom-24 left-4 right-4 bg-slate-800 rounded-xl border border-slate-700 p-4 z-[1000]">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="text-white font-semibold">#{selectedOrder.order_id}</p>
                            <p className="text-slate-400 text-sm capitalize">{selectedOrder.status.replace("_", " ")}</p>
                        </div>
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="text-slate-500 text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">{selectedOrder.delivery_address}</p>
                    <div className="flex gap-2">
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.delivery_latitude},${selectedOrder.delivery_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-center text-sm font-medium flex items-center justify-center gap-1"
                        >
                            <Navigation className="w-4 h-4" />
                            Navigate
                        </a>
                        <button
                            onClick={() => router.push(`/agent/order/${selectedOrder.id}`)}
                            className="flex-1 py-2 bg-slate-700 text-white rounded-lg text-center text-sm font-medium"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-6 py-3 z-[1001]">
                <div className="flex items-center justify-around">
                    <button
                        onClick={() => router.push("/agent")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <Package className="w-6 h-6" />
                        <span className="text-xs mt-1">Tasks</span>
                    </button>
                    <button className="flex flex-col items-center text-teal-400">
                        <MapPin className="w-6 h-6" />
                        <span className="text-xs mt-1">Map</span>
                    </button>
                    <button
                        onClick={() => router.push("/agent/history")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <Clock className="w-6 h-6" />
                        <span className="text-xs mt-1">History</span>
                    </button>
                    <button
                        onClick={() => router.push("/agent/profile")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <User className="w-6 h-6" />
                        <span className="text-xs mt-1">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
