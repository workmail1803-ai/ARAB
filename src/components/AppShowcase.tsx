"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Bell } from "lucide-react";

export default function AppShowcase() {
    return (
        <section className="py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-4">
                        Advance Delivery Management<br />
                        System for Every Business
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Left Phone */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            <div className="w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                                    {/* Phone Status Bar */}
                                    <div className="h-8 bg-gray-100 flex items-center justify-center">
                                        <div className="w-20 h-4 bg-gray-900 rounded-full" />
                                    </div>
                                    {/* Map Content */}
                                    <div className="h-full bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] relative p-4">
                                        <div className="absolute top-4 left-4 right-4">
                                            <div className="bg-white rounded-xl p-3 shadow-lg">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-[#00BFA5]" />
                                                    <span className="text-gray-600">Tracking Order #1234</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Map pins */}
                                        <div className="absolute top-1/3 left-1/4">
                                            <div className="w-8 h-8 bg-[#00BFA5] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                <div className="w-3 h-3 bg-white rounded-full" />
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 right-1/4">
                                            <div className="w-8 h-8 bg-[#3366FF] rounded-full flex items-center justify-center shadow-lg">
                                                <div className="w-3 h-3 bg-white rounded-full" />
                                            </div>
                                        </div>

                                        {/* Bottom card */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="bg-white rounded-xl p-4 shadow-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#00BFA5] rounded-full flex items-center justify-center">
                                                        <Navigation className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-[#1e293b]">Driver en route</div>
                                                        <div className="text-xs text-[#64748b]">ETA: 5 mins</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Center - Dashboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-[#1e293b] px-4 py-3 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <span className="text-xs text-white ml-2">Dashboard</span>
                            </div>
                            <div className="p-4 bg-gray-50">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-[#00BFA5]" />
                                            <span className="text-xs text-gray-500">Active</span>
                                        </div>
                                        <div className="text-xl font-bold">24</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Bell className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs text-gray-500">Pending</span>
                                        </div>
                                        <div className="text-xl font-bold">8</div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] rounded-xl h-40 relative">
                                    <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
                                        <defs>
                                            <pattern id="dashGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00BFA5" strokeWidth="0.5" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#dashGrid)" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Phone */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            <div className="w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                                    <div className="h-8 bg-gray-100 flex items-center justify-center">
                                        <div className="w-20 h-4 bg-gray-900 rounded-full" />
                                    </div>
                                    <div className="p-4">
                                        <div className="text-center mb-4">
                                            <div className="text-lg font-bold text-[#1e293b]">Driver App</div>
                                            <div className="text-sm text-[#64748b]">Today&apos;s Tasks</div>
                                        </div>

                                        {/* Task list */}
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-gray-50 rounded-xl p-3 mb-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-[#1e293b]">
                                                        Order #{1230 + i}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${i === 1 ? "bg-[#00BFA5]/10 text-[#00BFA5]" : "bg-gray-200 text-gray-600"
                                                        }`}>
                                                        {i === 1 ? "In Progress" : "Pending"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>2.{i} km away</span>
                                                </div>
                                            </div>
                                        ))}

                                        <button className="w-full py-3 bg-[#00BFA5] text-white rounded-xl font-semibold mt-4">
                                            Start Navigation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
