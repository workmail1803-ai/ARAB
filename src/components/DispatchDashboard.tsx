"use client";

import { useState, useMemo } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Filter,
    MapPin,
    Phone,
    Clock,
    Package,
    Truck,
    User,
    Map,
    List,
    RefreshCw,
    Plus,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useOrders, Order } from "@/hooks/useOrders";
import { useRiders, Rider } from "@/hooks/useRiders";
import { useMapSettings } from "@/hooks/useMapSettings";
import CreateTaskModal from "@/components/dashboard/CreateTaskModal";
import DispatchMap from "@/components/dashboard/DispatchMap";

// Task status tabs
type TaskTab = "Unassigned" | "Assigned" | "Completed";
// Agent status tabs
type AgentTab = "Free" | "Busy" | "Inactive";

export default function DispatchDashboard() {
    // State for tab switching
    const [activeTaskTab, setActiveTaskTab] = useState<TaskTab>("Assigned");
    const [activeAgentTab, setActiveAgentTab] = useState<AgentTab>("Free");
    const [taskSearchQuery, setTaskSearchQuery] = useState("");
    const [agentSearchQuery, setAgentSearchQuery] = useState("");
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch data from API - DISABLED AUTO REFRESH to prevent DB flooding
    // Use the manual Refresh button instead
    const { orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders, getOrdersByUIStatus } = useOrders();
    const { riders, loading: ridersLoading, error: ridersError, refetch: refetchRiders, getRidersByUIStatus } = useRiders();
    const { mapSettings, loading: mapLoading, isMapConfigured } = useMapSettings();

    // Get orders grouped by UI status
    const ordersByStatus = useMemo(() => getOrdersByUIStatus(), [getOrdersByUIStatus]);
    const ridersByStatus = useMemo(() => getRidersByUIStatus(), [getRidersByUIStatus]);

    // Filter tasks based on active tab and search
    const filteredTasks = useMemo(() => {
        const tasksForTab = ordersByStatus[activeTaskTab] || [];
        return tasksForTab.filter((order) => {
            const customerName = order.customer?.name || "";
            const address = order.delivery_address || "";
            const matchesSearch =
                customerName.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
                address.toLowerCase().includes(taskSearchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [ordersByStatus, activeTaskTab, taskSearchQuery]);

    // Filter agents based on active tab and search
    const filteredAgents = useMemo(() => {
        const agentsForTab = ridersByStatus[activeAgentTab] || [];
        return agentsForTab.filter((rider) => {
            const matchesSearch =
                rider.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                rider.phone.includes(agentSearchQuery);
            return matchesSearch;
        });
    }, [ridersByStatus, activeAgentTab, agentSearchQuery]);

    // Count tasks by status
    const taskCounts = {
        Unassigned: ordersByStatus.Unassigned.length,
        Assigned: ordersByStatus.Assigned.length,
        Completed: ordersByStatus.Completed.length,
    };

    // Count agents by status
    const agentCounts = {
        Free: ridersByStatus.Free.length,
        Busy: ridersByStatus.Busy.length,
        Inactive: ridersByStatus.Inactive.length,
    };

    const handleRefresh = () => {
        refetchOrders();
        refetchRiders();
    };

    const handleTaskCreated = () => {
        refetchOrders();
    };

    return (
        <>
            <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-gray-100 overflow-hidden -m-6">
                {/* ===== DISPATCH TOOLBAR ===== */}
                <div className="h-12 bg-[#1e2a3a] flex items-center justify-between px-4 flex-shrink-0">
                    {/* Left: View Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/10 rounded overflow-hidden">
                            <button
                                onClick={() => setViewMode("map")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${viewMode === "map" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
                                    }`}
                            >
                                <Map className="w-3.5 h-3.5" />
                                MAP
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${viewMode === "list" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
                                    }`}
                            >
                                <List className="w-3.5 h-3.5" />
                                LIST
                            </button>
                        </div>
                    </div>

                    {/* Center: Filters */}
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3a4a] hover:bg-[#3d4a5a] rounded text-white text-xs">
                            Today 12:00AM - 11:59PM
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3a4a] hover:bg-[#3d4a5a] rounded text-white text-xs">
                            All Teams
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#2d3a4a] hover:bg-[#3d4a5a] rounded text-white text-xs">
                            ALL Agent
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-medium"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Create Task
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="p-2 hover:bg-white/10 rounded text-white/70"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${ordersLoading || ridersLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ===== STATUS BANNER ===== */}
                {(ordersError || ridersError) && (
                    <div className="h-8 bg-red-500 flex items-center justify-center gap-2 flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-white" />
                        <span className="text-white text-xs">
                            {ordersError || ridersError} -
                            <button onClick={handleRefresh} className="underline ml-1">Retry</button>
                        </span>
                    </div>
                )}

                {/* ===== PROMO BANNER ===== */}
                <div className="h-8 bg-[#2d3a4a] flex items-center justify-center gap-4 flex-shrink-0">
                    <span className="text-green-400 text-xs">🔗 Connected to Supabase</span>
                    <span className="text-white/80 text-xs">
                        {orders.length} orders • {riders.length} riders loaded
                    </span>
                    <button className="px-3 py-0.5 bg-teal-500 hover:bg-teal-600 rounded text-white text-xs font-medium">
                        Webhooks Ready →
                    </button>
                </div>

                {/* ===== MAIN 3-COLUMN LAYOUT ===== */}
                <div className="flex-1 flex overflow-hidden">
                    {/* ===== LEFT PANEL: TASKS ===== */}
                    <div
                        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${leftPanelCollapsed ? "w-8" : "w-72"
                            }`}
                    >
                        {leftPanelCollapsed ? (
                            <button
                                onClick={() => setLeftPanelCollapsed(false)}
                                className="h-full flex items-center justify-center hover:bg-gray-50"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        ) : (
                            <>
                                {/* Task Panel Header */}
                                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-[#5c4b8a]">
                                    <span className="text-white font-medium text-sm">Task</span>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 hover:bg-white/10 rounded text-white/70">
                                            <Search className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setLeftPanelCollapsed(true)}
                                            className="p-1 hover:bg-white/10 rounded text-white/70"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Task Tabs */}
                                <div className="flex border-b border-gray-200">
                                    {(["Unassigned", "Assigned", "Completed"] as TaskTab[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTaskTab(tab)}
                                            className={`flex-1 py-2 text-xs font-medium transition-colors ${activeTaskTab === tab
                                                ? "text-gray-900 border-b-2 border-gray-900"
                                                : "text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            {taskCounts[tab]} {tab.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                {/* Task Search */}
                                <div className="p-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 rounded">
                                        <Search className="w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={taskSearchQuery}
                                            onChange={(e) => setTaskSearchQuery(e.target.value)}
                                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Task List */}
                                <div className="flex-1 overflow-y-auto">
                                    {ordersLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                            <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                                            <span className="text-xs">Loading tasks...</span>
                                        </div>
                                    ) : filteredTasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                            <Package className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs text-center">No task available for the day</span>
                                        </div>
                                    ) : (
                                        <div className="p-2 space-y-2">
                                            {filteredTasks.map((order) => (
                                                <TaskCard key={order.id} order={order} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ===== CENTER: MAP VIEW ===== */}
                    <div className="flex-1 relative bg-gray-200">
                        {/* Map Component */}
                        <DispatchMap
                            mapSettings={mapSettings}
                            riders={riders}
                            orders={orders}
                            isMapConfigured={isMapConfigured()}
                            mapLoading={mapLoading}
                        />

                        {/* Filters Button */}
                        <div className="absolute bottom-4 left-4 z-10">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#2d3a4a] hover:bg-[#3d4a5a] rounded-lg text-white text-sm shadow-lg">
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
                            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
                                +
                            </button>
                            <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
                                −
                            </button>
                        </div>
                    </div>

                    {/* ===== RIGHT PANEL: AGENTS ===== */}
                    <div
                        className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${rightPanelCollapsed ? "w-8" : "w-72"
                            }`}
                    >
                        {rightPanelCollapsed ? (
                            <button
                                onClick={() => setRightPanelCollapsed(false)}
                                className="h-full flex items-center justify-center hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                        ) : (
                            <>
                                {/* Agent Panel Header */}
                                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-[#d4820a]">
                                    <span className="text-white font-medium text-sm">Agent</span>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 hover:bg-white/10 rounded text-white/70">
                                            <Search className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setRightPanelCollapsed(true)}
                                            className="p-1 hover:bg-white/10 rounded text-white/70"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Agent Tabs */}
                                <div className="flex border-b border-gray-200">
                                    {(["Free", "Busy", "Inactive"] as AgentTab[]).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveAgentTab(tab)}
                                            className={`flex-1 py-2 text-xs font-medium transition-colors ${activeAgentTab === tab
                                                ? "text-gray-900 border-b-2 border-gray-900"
                                                : "text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            {agentCounts[tab]} {tab.toUpperCase()}
                                        </button>
                                    ))}
                                </div>

                                {/* Agent Search */}
                                <div className="p-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-100 rounded">
                                        <Search className="w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search agents..."
                                            value={agentSearchQuery}
                                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                                            className="flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Agent List */}
                                <div className="flex-1 overflow-y-auto">
                                    {ridersLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                            <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                                            <span className="text-xs">Loading agents...</span>
                                        </div>
                                    ) : filteredAgents.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                            <User className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs text-center">No agents found</span>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {filteredAgents.map((rider) => (
                                                <AgentCard key={rider.id} rider={rider} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleTaskCreated}
            />
        </>
    );
}

// ===== TASK CARD COMPONENT =====
function TaskCard({ order }: { order: Order }) {
    const isPickup = order.pickup_address !== null;
    const statusLabel = order.status === "pending" ? "Pending" : order.status === "assigned" ? "Assigned" : "Completed";

    return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${isPickup ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                        }`}>
                        {isPickup ? <Package className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                        {order.external_id || order.id.slice(0, 8)}
                    </span>
                </div>
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${order.status === "delivered" ? "bg-green-100 text-green-700" :
                    order.status === "assigned" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                    }`}>
                    {statusLabel}
                </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
                {order.customer?.name || "Unknown Customer"}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{order.delivery_address}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{new Date(order.created_at).toLocaleTimeString()}</span>
            </div>
            {order.rider && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1 text-xs text-blue-600">
                    <User className="w-3 h-3" />
                    <span>{order.rider.name}</span>
                </div>
            )}
        </div>
    );
}

// ===== AGENT CARD COMPONENT =====
function AgentCard({ rider }: { rider: Rider }) {
    const activeTasksCount = rider.active_orders_count || 0;

    return (
        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
            <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                </div>
                <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${rider.status === "online" ? "bg-green-500" :
                        rider.status === "busy" ? "bg-orange-500" :
                            "bg-gray-400"
                        }`}
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900">{rider.name}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{rider.phone}</span>
                </div>
            </div>
            <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{activeTasksCount}</div>
                <div className="text-[10px] text-gray-400">Task</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
    );
}
