"use client";

import { useState } from "react";
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
    ChevronDown,
} from "lucide-react";
import CreateTaskModal from "@/components/dashboard/CreateTaskModal";

const tasks = [
    {
        id: "#1234",
        customer: "John Smith",
        address: "123 Main St, Downtown",
        agent: "Mike Rodriguez",
        status: "completed",
        priority: "normal",
        createdAt: "2024-12-28 10:30",
        completedAt: "2024-12-28 11:45",
    },
    {
        id: "#1235",
        customer: "Sarah Johnson",
        address: "456 Oak Ave, Midtown",
        agent: "Lisa Kim",
        status: "in_progress",
        priority: "high",
        createdAt: "2024-12-28 11:00",
        completedAt: null,
    },
    {
        id: "#1236",
        customer: "David Brown",
        address: "789 Pine Rd, Uptown",
        agent: "Unassigned",
        status: "pending",
        priority: "normal",
        createdAt: "2024-12-28 11:30",
        completedAt: null,
    },
    {
        id: "#1237",
        customer: "Emily Davis",
        address: "321 Elm St, Westside",
        agent: "Tom Wilson",
        status: "completed",
        priority: "low",
        createdAt: "2024-12-28 09:00",
        completedAt: "2024-12-28 10:15",
    },
    {
        id: "#1238",
        customer: "Michael Wilson",
        address: "654 Maple Dr, Eastside",
        agent: "John Davis",
        status: "failed",
        priority: "high",
        createdAt: "2024-12-28 08:30",
        completedAt: null,
    },
    {
        id: "#1239",
        customer: "Jennifer Lee",
        address: "987 Cedar Ln, Suburb",
        agent: "Sarah Chen",
        status: "in_progress",
        priority: "normal",
        createdAt: "2024-12-28 12:00",
        completedAt: null,
    },
];

const statusConfig = {
    completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    in_progress: { icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
    pending: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

export default function TasksPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-500">Manage and track all delivery tasks.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00BFA5] hover:bg-[#00A896] text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Task
                </button>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => setShowCreateModal(false)}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: tasks.length, color: "bg-gray-100" },
                    { label: "Completed", value: tasks.filter((t) => t.status === "completed").length, color: "bg-green-100" },
                    { label: "In Progress", value: tasks.filter((t) => t.status === "in_progress").length, color: "bg-blue-100" },
                    { label: "Pending", value: tasks.filter((t) => t.status === "pending").length, color: "bg-yellow-100" },
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
                        placeholder="Search tasks..."
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
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">More Filters</span>
                </button>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Task ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                    Agent
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
                            {filteredTasks.map((task, index) => {
                                const StatusIcon = statusConfig[task.status as keyof typeof statusConfig].icon;
                                return (
                                    <motion.tr
                                        key={task.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{task.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{task.customer}</div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate max-w-[200px]">{task.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className={`text-sm ${task.agent === "Unassigned" ? "text-gray-400" : "text-gray-900"}`}>
                                                {task.agent}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig[task.status as keyof typeof statusConfig].bg
                                                    } ${statusConfig[task.status as keyof typeof statusConfig].color}`}
                                            >
                                                <StatusIcon className="w-3 h-3" />
                                                {task.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-500">{task.createdAt}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:bg-gray-100 rounded">
                                                <MoreVertical className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
