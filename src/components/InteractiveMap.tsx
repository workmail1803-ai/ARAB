"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, CheckCircle } from "lucide-react";

const deliveries = [
    { id: 1, status: "delivered", driver: "John D.", eta: "Completed", top: "15%", left: "20%" },
    { id: 2, status: "in-transit", driver: "Sarah M.", eta: "5 min", top: "35%", left: "55%" },
    { id: 3, status: "in-transit", driver: "Mike R.", eta: "12 min", top: "60%", left: "30%" },
    { id: 4, status: "pending", driver: "Lisa K.", eta: "20 min", top: "45%", left: "75%" },
    { id: 5, status: "delivered", driver: "Tom W.", eta: "Completed", top: "75%", left: "60%" },
];

export default function InteractiveMap() {
    return (
        <section className="py-20 lg:py-28 bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6">
                            Real-Time <span className="text-[#00BFA5]">Tracking</span>
                        </h2>
                        <p className="text-lg text-[#64748b] mb-8 leading-relaxed">
                            Track your on-field personnel in real-time with powerful geo
                            analytics tools for better workforce productivity. Know exactly
                            where your drivers are at any moment.
                        </p>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {[
                                { icon: MapPin, text: "Live GPS tracking of all drivers" },
                                { icon: Navigation, text: "Route optimization & ETAs" },
                                { icon: Clock, text: "Real-time status updates" },
                                { icon: CheckCircle, text: "Proof of delivery capture" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 bg-[#00BFA5]/10 rounded-lg flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-[#00BFA5]" />
                                    </div>
                                    <span className="text-[#1e293b] font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right - Map Visualization */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* Map Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#00BFA5]" />
                                    <span className="font-semibold text-[#1e293b]">
                                        Live Fleet Map
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-gray-500">5 Active</span>
                                    </span>
                                </div>
                            </div>

                            {/* Map Area */}
                            <div className="relative h-[400px] bg-gradient-to-br from-[#e8f5f3] via-[#e0f2f1] to-[#b2dfdb]">
                                {/* Grid Pattern */}
                                <div className="absolute inset-0">
                                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern
                                                id="grid"
                                                width="40"
                                                height="40"
                                                patternUnits="userSpaceOnUse"
                                            >
                                                <path
                                                    d="M 40 0 L 0 0 0 40"
                                                    fill="none"
                                                    stroke="#00BFA5"
                                                    strokeWidth="0.5"
                                                    strokeOpacity="0.2"
                                                />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                    </svg>
                                </div>

                                {/* Roads (decorative) */}
                                <svg className="absolute inset-0 w-full h-full">
                                    <path
                                        d="M0,150 Q150,100 300,200 T600,180"
                                        stroke="#94a3b8"
                                        strokeWidth="8"
                                        strokeOpacity="0.3"
                                        fill="none"
                                    />
                                    <path
                                        d="M100,0 Q180,150 150,300 T200,400"
                                        stroke="#94a3b8"
                                        strokeWidth="8"
                                        strokeOpacity="0.3"
                                        fill="none"
                                    />
                                    <path
                                        d="M400,0 Q350,200 450,350 T400,400"
                                        stroke="#94a3b8"
                                        strokeWidth="8"
                                        strokeOpacity="0.3"
                                        fill="none"
                                    />
                                </svg>

                                {/* Driver Markers */}
                                {deliveries.map((delivery) => (
                                    <motion.div
                                        key={delivery.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + delivery.id * 0.15 }}
                                        className="absolute group"
                                        style={{ top: delivery.top, left: delivery.left }}
                                    >
                                        {/* Pulse Ring for In-Transit */}
                                        {delivery.status === "in-transit" && (
                                            <div className="absolute -inset-3">
                                                <div className="w-12 h-12 bg-[#00BFA5]/20 rounded-full animate-ping" />
                                            </div>
                                        )}

                                        {/* Marker */}
                                        <div
                                            className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform group-hover:scale-110 ${delivery.status === "delivered"
                                                    ? "bg-green-500"
                                                    : delivery.status === "in-transit"
                                                        ? "bg-[#00BFA5]"
                                                        : "bg-orange-400"
                                                }`}
                                        >
                                            <div className="w-3 h-3 bg-white rounded-full" />
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="bg-[#1e293b] text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                                <div className="font-semibold">{delivery.driver}</div>
                                                <div className="text-gray-300">ETA: {delivery.eta}</div>
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Routes */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        d="M80,60 Q150,100 220,140 T120,240"
                                        stroke="#00BFA5"
                                        strokeWidth="3"
                                        strokeDasharray="8,4"
                                        fill="none"
                                        strokeOpacity="0.6"
                                    />
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        whileInView={{ pathLength: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, delay: 0.7 }}
                                        d="M220,140 Q280,180 300,240"
                                        stroke="#00BFA5"
                                        strokeWidth="3"
                                        strokeDasharray="8,4"
                                        fill="none"
                                        strokeOpacity="0.6"
                                    />
                                </svg>
                            </div>

                            {/* Map Legend */}
                            <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 border-t border-gray-100">
                                {[
                                    { color: "bg-green-500", label: "Delivered" },
                                    { color: "bg-[#00BFA5]", label: "In Transit" },
                                    { color: "bg-orange-400", label: "Pending" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 ${item.color} rounded-full`} />
                                        <span className="text-xs text-gray-500">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
