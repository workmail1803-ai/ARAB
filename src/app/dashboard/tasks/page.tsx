"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    Plus,
    Package,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    User,
    Truck,
    RefreshCw,
} from "lucide-react";
import CreateTaskModal from "@/components/dashboard/CreateTaskModal";

interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    pickup_address: string;
    status: string;
    rider_id: string | null;
    rider?: { id: string; name: string } | null;
    created_at: string;
    updated_at: string;
}

interface Rider {
    id: string;
    name: string;
    phone: string;
    status: string;
}

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
    pending: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100", label: "Pending" },
    assigned: { icon: User, color: "text-blue-600", bg: "bg-blue-100", label: "Assigned" },
    picked_up: { icon: Truck, color: "text-purple-600", bg: "bg-purple-100", label: "Picked Up" },
    in_transit: { icon: Clock, color: "text-indigo-600", bg: "bg-indigo-100", label: "In Transit" },
    delivered: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Delivered" },
    cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Cancelled" },
};

export default function TasksPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [riders, setRiders] = useState<Rider[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) {
            setError("No API key found. Please login first.");
            setLoading(false);
            return;
        }

        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        };

        try {
            const [ordersRes, ridersRes] = await Promise.all([
                fetch("/api/v1/orders", { headers }),
                fetch("/api/v1/riders", { headers }),
            ]);

            if (!ordersRes.ok || !ridersRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const ordersData = await ordersRes.json();
            const ridersData = await ridersRes.json();

            setOrders(ordersData.data || []);
            setRiders(ridersData.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const assignRider = async (orderId: string, riderId: string) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) return;

        try {
            const response = await fetch(`/api/v1/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    rider_id: riderId,
                    status: "assigned"
                }),
            });

            if (response.ok) {
                fetchData(); // Refresh data
            }
        } catch (err) {
            console.error("Error assigning rider:", err);
        } finally {
            setAssigningOrder(null);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const apiKey = localStorage.getItem("api_key");
        if (!apiKey) return;

        try {
            const response = await fetch(`/api/v1/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.delivery_address?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
        assigned: orders.filter((o) => o.status === "assigned").length,
        in_transit: orders.filter((o) => o.status === "in_transit" || o.status === "picked_up").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRiderName = (order: Order) => {
        if (order.rider?.name) return order.rider.name;
        if (order.rider_id) {
            const rider = riders.find((r) => r.id === order.rider_id);
            return rider?.name || "Unknown";
        }
        return "Unassigned";
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-500">Manage and track all delivery tasks.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00BFA5] hover:bg-[#00A896] text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Task
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchData();
                }}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total", value: stats.total, color: "bg-gray-100" },
                    { label: "Pending", value: stats.pending, color: "bg-yellow-100" },
                    { label: "Assigned", value: stats.assigned, color: "bg-blue-100" },
                    { label: "In Transit", value: stats.in_transit, color: "bg-purple-100" },
                    { label: "Delivered", value: stats.delivered, color: "bg-green-100" },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredOrders.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-4">Create your first order or adjust your filters.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BFA5] hover:bg-[#00A896] text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Task
                    </button>
                </div>
            )}

            {/* Orders Table */}
            {!loading && filteredOrders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                        Delivery Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Rider
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order, index) => {
                                    const config = statusConfig[order.status] || statusConfig.pending;
                                    const StatusIcon = config.icon;
                                    const riderName = getRiderName(order);

                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 text-sm">
                                                        #{order.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{order.customer_name || "N/A"}</div>
                                                <div className="text-xs text-gray-500">{order.customer_phone || ""}</div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate max-w-[200px]">{order.delivery_address || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {assigningOrder === order.id ? (
                                                    <select
                                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                                        onChange={(e) => assignRider(order.id, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Select rider...</option>
                                                        {riders.map((rider) => (
                                                            <option key={rider.id} value={rider.id}>
                                                                {rider.name} ({rider.status || "offline"})
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <button
                                                        onClick={() => riderName === "Unassigned" && setAssigningOrder(order.id)}
                                                        className={`text-sm ${riderName === "Unassigned"
                                                            ? "text-blue-600 hover:text-blue-800 cursor-pointer underline"
                                                            : "text-gray-900 cursor-default"
                                                            }`}
                                                    >
                                                        {riderName}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <select
                                                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="assigned">Assigned</option>
                                                        <option value="picked_up">Picked Up</option>
                                                        <option value="in_transit">In Transit</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
