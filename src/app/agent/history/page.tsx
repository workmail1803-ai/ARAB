"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Package,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
    Calendar,
    TrendingUp
} from "lucide-react";

interface Order {
    id: string;
    order_id: string;
    pickup_address: string;
    delivery_address: string;
    status: string;
    created_at: string;
    delivered_at?: string;
    customer_name?: string;
}

interface Stats {
    total: number;
    delivered: number;
    failed: number;
}

export default function AgentHistoryPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, delivered: 0, failed: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "delivered" | "failed">("all");
    const [period, setPeriod] = useState<"today" | "week" | "month">("week");

    const fetchOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem("agent_token");
            if (!token) return;

            // Get all orders and filter completed ones
            const response = await fetch("/api/agent/orders?status=delivered,failed,cancelled", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const allOrders = data.data.orders || [];
                
                // Filter by period
                const now = new Date();
                let startDate = new Date();
                
                if (period === "today") {
                    startDate.setHours(0, 0, 0, 0);
                } else if (period === "week") {
                    startDate.setDate(now.getDate() - 7);
                } else {
                    startDate.setMonth(now.getMonth() - 1);
                }

                const filteredOrders = allOrders.filter((o: Order) => {
                    const orderDate = new Date(o.created_at);
                    const matchesPeriod = orderDate >= startDate;
                    const matchesFilter = filter === "all" || o.status === filter;
                    const isCompleted = ["delivered", "failed", "cancelled"].includes(o.status);
                    return matchesPeriod && matchesFilter && isCompleted;
                });

                setOrders(filteredOrders);
                
                // Calculate stats
                setStats({
                    total: filteredOrders.length,
                    delivered: filteredOrders.filter((o: Order) => o.status === "delivered").length,
                    failed: filteredOrders.filter((o: Order) => ["failed", "cancelled"].includes(o.status)).length
                });
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    }, [filter, period]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="flex items-center gap-3 p-4">
                    <button onClick={() => router.push("/agent")} className="p-2 -ml-2">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-white font-semibold text-lg">Delivery History</h1>
                </div>
            </div>

            {/* Period Selector */}
            <div className="p-4">
                <div className="flex gap-2">
                    {(["today", "week", "month"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                period === p
                                    ? "bg-teal-500 text-white"
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                        >
                            {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="px-4 mb-4">
                <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                        <TrendingUp className="w-4 h-4" />
                        Performance Summary
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                            <p className="text-xs text-slate-500">Total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-400">{stats.delivered}</p>
                            <p className="text-xs text-slate-500">Delivered</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-400">{stats.failed}</p>
                            <p className="text-xs text-slate-500">Failed</p>
                        </div>
                    </div>
                    {stats.total > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Success Rate</span>
                                <span className={`font-semibold ${
                                    (stats.delivered / stats.total) >= 0.9 ? "text-green-400" :
                                    (stats.delivered / stats.total) >= 0.7 ? "text-amber-400" : "text-red-400"
                                }`}>
                                    {Math.round((stats.delivered / stats.total) * 100)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="px-4 mb-4">
                <div className="flex gap-2">
                    {(["all", "delivered", "failed"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-sm ${
                                filter === f
                                    ? f === "delivered" ? "bg-green-500/20 text-green-300 border border-green-500/50"
                                    : f === "failed" ? "bg-red-500/20 text-red-300 border border-red-500/50"
                                    : "bg-teal-500/20 text-teal-300 border border-teal-500/50"
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                        >
                            {f === "all" ? "All" : f === "delivered" ? "Delivered" : "Failed"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="px-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No completed deliveries</p>
                        <p className="text-slate-500 text-sm">Your delivery history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/agent/order/${order.id}`)}
                                className="bg-slate-800 rounded-xl p-4 border border-slate-700 cursor-pointer active:bg-slate-700"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-white font-medium">#{order.order_id}</p>
                                        <p className="text-slate-500 text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(order.delivered_at || order.created_at)}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                                        order.status === "delivered"
                                            ? "bg-green-500/20 text-green-300"
                                            : "bg-red-500/20 text-red-300"
                                    }`}>
                                        {order.status === "delivered" ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : (
                                            <XCircle className="w-3 h-3" />
                                        )}
                                        {order.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <p className="truncate">{order.delivery_address}</p>
                                </div>

                                <div className="flex items-center justify-end mt-2 text-teal-400 text-sm">
                                    View Details <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-6 py-3">
                <div className="flex items-center justify-around">
                    <button 
                        onClick={() => router.push("/agent")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <Package className="w-6 h-6" />
                        <span className="text-xs mt-1">Tasks</span>
                    </button>
                    <button className="flex flex-col items-center text-slate-500">
                        <MapPin className="w-6 h-6" />
                        <span className="text-xs mt-1">Map</span>
                    </button>
                    <button className="flex flex-col items-center text-teal-400">
                        <Clock className="w-6 h-6" />
                        <span className="text-xs mt-1">History</span>
                    </button>
                    <button 
                        onClick={() => router.push("/agent/profile")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <Package className="w-6 h-6" />
                        <span className="text-xs mt-1">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
