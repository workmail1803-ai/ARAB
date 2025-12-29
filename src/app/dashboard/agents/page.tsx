"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, MapPin, Phone, Star, MoreVertical } from "lucide-react";

const agents = [
    { id: 1, name: "Mike Rodriguez", email: "mike@example.com", phone: "+1 555-1234", status: "online", tasks: 45, rating: 4.9, location: "Downtown" },
    { id: 2, name: "Lisa Kim", email: "lisa@example.com", phone: "+1 555-2345", status: "online", tasks: 42, rating: 4.8, location: "Midtown" },
    { id: 3, name: "Tom Wilson", email: "tom@example.com", phone: "+1 555-3456", status: "offline", tasks: 38, rating: 4.7, location: "Uptown" },
    { id: 4, name: "Sarah Chen", email: "sarah@example.com", phone: "+1 555-4567", status: "online", tasks: 35, rating: 4.9, location: "Westside" },
    { id: 5, name: "John Davis", email: "john@example.com", phone: "+1 555-5678", status: "busy", tasks: 32, rating: 4.6, location: "Eastside" },
    { id: 6, name: "Emily Brown", email: "emily@example.com", phone: "+1 555-6789", status: "online", tasks: 28, rating: 4.8, location: "Suburb" },
];

export default function AgentsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAgents = agents.filter(
        (agent) =>
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
                    <p className="text-gray-500">Manage your delivery agents and their assignments.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#00BFA5] hover:bg-[#00A896] text-white font-medium rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Agent
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Filters</span>
                </button>
            </div>

            {/* Agent Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent, index) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#00BFA5] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {agent.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                                    <p className="text-sm text-gray-500">{agent.email}</p>
                                </div>
                            </div>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{agent.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{agent.location}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{agent.rating}</span>
                                <span className="text-gray-500 text-sm">({agent.tasks} tasks)</span>
                            </div>
                            <span
                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${agent.status === "online"
                                        ? "bg-green-100 text-green-700"
                                        : agent.status === "busy"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {agent.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
