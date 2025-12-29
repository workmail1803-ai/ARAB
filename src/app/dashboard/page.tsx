"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Truck,
    Users,
    Package,
    Clock,
    CheckCircle,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import CreateTaskModal from "@/components/dashboard/CreateTaskModal";
import { useOrders, Order } from "@/hooks/useOrders";
import { useRiders } from "@/hooks/useRiders";

// Helper to get time ago string
function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

export default function DashboardPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { orders, loading: ordersLoading, refetch: refreshOrders } = useOrders();
    const { riders, loading: ridersLoading } = useRiders();

    // Calculate stats from real data
    const stats = [
        {
            label: "Total Tasks",
            value: orders.length.toString(),
            change: "+12.5%",
            trend: "up",
            icon: Package,
            color: "bg-purple-500"
        },
        {
            label: "Active Agents",
            value: riders.filter(r => r.status === "online" || r.status === "busy").length.toString(),
            change: "+5.2%",
            trend: "up",
            icon: Users,
            color: "bg-blue-500"
        },
        {
            label: "Completed Today",
            value: orders.filter(o => o.status === "delivered").length.toString(),
            change: "+8.1%",
            trend: "up",
            icon: CheckCircle,
            color: "bg-green-500"
        },
        {
            label: "Avg. Delivery Time",
            value: "32 min",
            change: "-2.3%",
            trend: "down",
            icon: Clock,
            color: "bg-orange-500"
        },
    ];

    // Get recent 5 orders
    const recentTasks = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(order => ({
            id: `#TK-${order.id.slice(0, 4).toUpperCase()}`,
            customer: order.customer?.name || "Unknown",
            status: order.status || "pending",
            agent: order.rider_id ? "Assigned" : "Unassigned",
            time: getTimeAgo(order.created_at),
            address: order.delivery_address || "No address",
        }));

    // Get agent activity from riders
    const agentActivity = riders.slice(0, 4).map(rider => ({
        name: rider.name,
        status: rider.status,
        currentTask: rider.status === "busy" ? "In Progress" : null,
        location: rider.latitude && rider.longitude ? "Active" : "—",
    }));

    const handleTaskCreated = () => {
        setShowCreateModal(false);
        refreshOrders(); // Refresh the orders list
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">Welcome back! Here&apos;s your operations overview.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refreshOrders()}
                        disabled={ordersLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Task
                    </button>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleTaskCreated}
            />

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <span
                                className={`flex items-center gap-0.5 text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {stat.trend === "up" ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">Recent Tasks</h2>
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard/tasks" className="text-xs text-purple-600 hover:underline">
                                View All
                            </Link>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {ordersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                        ) : recentTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Package className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No tasks yet</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-2 text-sm text-purple-600 hover:underline"
                                >
                                    Create your first task
                                </button>
                            </div>
                        ) : (
                            recentTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-gray-900">{task.id}</span>
                                                <span className="text-sm text-gray-500 truncate">{task.customer}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 truncate">{task.address}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="hidden sm:block text-xs text-gray-500">{task.agent}</span>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${task.status === "delivered"
                                                ? "bg-green-100 text-green-700"
                                                : task.status === "assigned" || task.status === "picked_up"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : task.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {task.status.replace("_", " ")}
                                        </span>
                                        <span className="text-[10px] text-gray-400 w-16 text-right">{task.time}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Agent Activity */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">Agent Activity</h2>
                        <Link href="/dashboard/agents" className="text-xs text-purple-600 hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {ridersLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                        ) : agentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Users className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No agents yet</p>
                            </div>
                        ) : (
                            agentActivity.map((agent) => (
                                <div key={agent.name} className="flex items-center gap-3 px-4 py-3">
                                    <div className="relative">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium text-purple-700">
                                                {agent.name.split(" ").map((n) => n[0]).join("")}
                                            </span>
                                        </div>
                                        <span
                                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${agent.status === "online"
                                                ? "bg-green-500"
                                                : agent.status === "busy"
                                                    ? "bg-yellow-500"
                                                    : "bg-gray-400"
                                                }`}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {agent.currentTask ? `Working on ${agent.currentTask}` : "No active task"}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">{agent.location}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Live Map */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h2 className="font-medium text-gray-900">Live Fleet View</h2>
                    <button className="text-xs text-purple-600 hover:underline">Expand Map</button>
                </div>
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 relative">
                    <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
                        <defs>
                            <pattern id="mapGridDash" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#mapGridDash)" />
                    </svg>

                    {[
                        { x: "15%", y: "25%", status: "active" },
                        { x: "35%", y: "55%", status: "active" },
                        { x: "55%", y: "30%", status: "idle" },
                        { x: "75%", y: "65%", status: "active" },
                        { x: "85%", y: "40%", status: "idle" },
                    ].map((marker, i) => (
                        <div
                            key={i}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: marker.x, top: marker.y }}
                        >
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${marker.status === "active" ? "bg-purple-600" : "bg-gray-400"
                                    }`}
                            >
                                <Truck className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
