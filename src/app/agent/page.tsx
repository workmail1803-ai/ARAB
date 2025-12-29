"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Package,
    MapPin,
    Navigation,
    User,
    Power,
    ChevronRight,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    RefreshCw,
    Phone,
    Map
} from "lucide-react";

interface Order {
    id: string;
    order_id: string;
    pickup_address: string;
    delivery_address: string;
    status: string;
    priority: string;
    created_at: string;
    scheduled_time?: string;
    customer_name?: string;
    customer_phone?: string;
}

interface RiderStats {
    total_today: number;
    completed: number;
    pending: number;
    in_progress: number;
}

export default function AgentDashboard() {
    const router = useRouter();
    const [isOnline, setIsOnline] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<RiderStats>({ total_today: 0, completed: 0, pending: 0, in_progress: 0 });
    const [loading, setLoading] = useState(true);
    const [riderName, setRiderName] = useState("");
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(null);

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
                setOrders(ordersList);

                // Calculate stats
                const today = new Date().toDateString();
                const todayOrders = ordersList.filter((o: Order) =>
                    new Date(o.created_at).toDateString() === today
                );

                setStats({
                    total_today: todayOrders.length,
                    completed: ordersList.filter((o: Order) => o.status === "delivered").length,
                    pending: ordersList.filter((o: Order) => o.status === "assigned").length,
                    in_progress: ordersList.filter((o: Order) => ["picked_up", "in_transit"].includes(o.status)).length
                });
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update location
    const updateLocation = useCallback(async (position: GeolocationPosition) => {
        try {
            const token = localStorage.getItem("agent_token");
            if (!token) return;

            const { latitude, longitude, accuracy, heading, speed } = position.coords;
            setLastLocation({ lat: latitude, lng: longitude });

            await fetch("/api/agent/location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    accuracy,
                    heading: heading || 0,
                    speed: speed || 0,
                    battery_level: 100 // TODO: Get actual battery
                })
            });
        } catch (error) {
            console.error("Failed to update location:", error);
        }
    }, []);

    // Start location tracking
    const startLocationTracking = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationEnabled(true);
                updateLocation(position);
            },
            (error) => {
                console.error("Location error:", error);
                setLocationEnabled(false);
            },
            { enableHighAccuracy: true }
        );

        // Watch position
        const watchId = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => console.error("Watch error:", error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );

        return watchId;
    }, [updateLocation]);

    useEffect(() => {
        setRiderName(localStorage.getItem("agent_rider_name") || "Agent");
        fetchOrders();

        // Start location tracking
        const watchId = startLocationTracking();

        // Refresh orders every 30 seconds
        const interval = setInterval(fetchOrders, 30000);

        return () => {
            clearInterval(interval);
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [fetchOrders, startLocationTracking]);

    const handleLogout = async () => {
        if (!confirm("Are you sure you want to logout?")) return;

        try {
            const token = localStorage.getItem("agent_token");
            await fetch("/api/agent/auth/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error(error);
        }

        localStorage.removeItem("agent_token");
        localStorage.removeItem("agent_rider_id");
        localStorage.removeItem("agent_rider_name");
        router.push("/agent/login");
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            assigned: { bg: "bg-blue-500/20", text: "text-blue-300", icon: <Clock className="w-3 h-3" /> },
            picked_up: { bg: "bg-purple-500/20", text: "text-purple-300", icon: <Package className="w-3 h-3" /> },
            in_transit: { bg: "bg-amber-500/20", text: "text-amber-300", icon: <Truck className="w-3 h-3" /> },
            delivered: { bg: "bg-green-500/20", text: "text-green-300", icon: <CheckCircle className="w-3 h-3" /> },
            cancelled: { bg: "bg-red-500/20", text: "text-red-300", icon: <XCircle className="w-3 h-3" /> }
        };
        return badges[status] || badges.assigned;
    };

    const activeOrders = orders.filter(o => ["assigned", "picked_up", "in_transit"].includes(o.status));

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4 pb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-teal-100 text-sm">Welcome back</p>
                        <h1 className="text-xl font-bold text-white">{riderName}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Online Toggle */}
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${isOnline
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-700 text-slate-300"
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-white animate-pulse" : "bg-slate-500"}`} />
                            {isOnline ? "Online" : "Offline"}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 bg-white/10 rounded-full text-white"
                        >
                            <Power className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Location Status */}
                <div className="mt-4 flex items-center gap-2 text-sm">
                    <MapPin className={`w-4 h-4 ${locationEnabled ? "text-green-300" : "text-red-300"}`} />
                    <span className={locationEnabled ? "text-green-200" : "text-red-200"}>
                        {locationEnabled
                            ? `GPS Active ${lastLocation ? `(${lastLocation.lat.toFixed(4)}, ${lastLocation.lng.toFixed(4)})` : ""}`
                            : "GPS Disabled - Enable location"}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 -mt-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                        <p className="text-slate-400 text-xs">Today</p>
                        <p className="text-2xl font-bold text-white">{stats.total_today}</p>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                        <p className="text-slate-400 text-xs">Active</p>
                        <p className="text-2xl font-bold text-amber-400">{stats.in_progress + stats.pending}</p>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                        <p className="text-slate-400 text-xs">Completed</p>
                        <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                    </div>
                </div>
            </div>

            {/* Active Orders */}
            <div className="px-4 mt-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Active Tasks</h2>
                    <button onClick={fetchOrders} className="text-teal-400 p-2">
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
                    </div>
                ) : activeOrders.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No active tasks</p>
                        <p className="text-slate-500 text-sm">New tasks will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeOrders.map((order) => {
                            const badge = getStatusBadge(order.status);
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => router.push(`/agent/order/${order.id}`)}
                                    className="bg-slate-800 rounded-xl p-4 border border-slate-700 active:bg-slate-700 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-white font-medium">#{order.order_id}</p>
                                            {order.customer_name && (
                                                <p className="text-slate-400 text-sm">{order.customer_name}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                                            {badge.icon}
                                            {order.status.replace("_", " ")}
                                        </span>
                                    </div>

                                    {/* Pickup */}
                                    <div className="flex items-start gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500">PICKUP</p>
                                            <p className="text-slate-300 text-sm truncate">{order.pickup_address}</p>
                                        </div>
                                    </div>

                                    {/* Delivery */}
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <MapPin className="w-3 h-3 text-red-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500">DELIVERY</p>
                                            <p className="text-slate-300 text-sm truncate">{order.delivery_address}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                                        <div className="flex gap-2">
                                            {order.customer_phone && (
                                                <a
                                                    href={`tel:${order.customer_phone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 bg-slate-700 rounded-lg text-slate-400"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                            )}
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.delivery_address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 bg-slate-700 rounded-lg text-slate-400"
                                            >
                                                <Navigation className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-1 text-teal-400 text-sm">
                                            View Details <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-6 py-3">
                <div className="flex items-center justify-around">
                    <button className="flex flex-col items-center text-teal-400">
                        <Package className="w-6 h-6" />
                        <span className="text-xs mt-1">Tasks</span>
                    </button>
                    <button
                        onClick={() => router.push("/agent/map")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <Map className="w-6 h-6" />
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
