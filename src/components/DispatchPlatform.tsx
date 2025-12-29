"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    Route,
    Truck,
    MapPin,
    BarChart3,
    ClipboardList,
    Users,
    Building2,
    Share2,
    Link2,
    Smartphone,
    PieChart,
    FileText,
} from "lucide-react";

const tabs = [
    { id: "fulfillment", label: "Fulfillment Automation" },
    { id: "dispatch", label: "Dispatch Planning" },
    { id: "orchestration", label: "Delivery Orchestration" },
    { id: "tracking", label: "Real-Time Tracking" },
    { id: "analytics", label: "Smart Analytics" },
];

const tabContent: Record<string, { icon: typeof Package; label: string }[]> = {
    fulfillment: [
        { icon: ClipboardList, label: "Order Management" },
        { icon: Users, label: "Auto Allocation" },
        { icon: Package, label: "Capacity Management" },
    ],
    dispatch: [
        { icon: Route, label: "Route Optimization" },
        { icon: Building2, label: "Capacity Management" },
        { icon: Users, label: "Fleet Management" },
    ],
    orchestration: [
        { icon: Truck, label: "3PL Management" },
        { icon: Share2, label: "Share My Fleet" },
        { icon: Link2, label: "API Integration" },
    ],
    tracking: [
        { icon: MapPin, label: "Tracking Link" },
        { icon: Smartphone, label: "Driver App" },
        { icon: Route, label: "Live Routes" },
    ],
    analytics: [
        { icon: BarChart3, label: "Business Insights" },
        { icon: PieChart, label: "Performance Metrics" },
        { icon: FileText, label: "Customisable Reports" },
    ],
};

export default function DispatchPlatform() {
    const [activeTab, setActiveTab] = useState("fulfillment");

    return (
        <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-[#3366FF] rounded-2xl p-6 lg:p-8 mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
                        Tookan Dispatch Management Platform Built for Enterprise
                    </h2>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 lg:px-6 py-3 rounded-xl text-sm lg:text-base font-medium transition-all ${activeTab === tab.id
                                    ? "bg-[#3366FF] text-white shadow-lg"
                                    : "bg-gray-100 text-[#64748b] hover:bg-gray-200"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4 lg:gap-6"
                    >
                        {tabContent[activeTab]?.map((item, index) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col items-center text-center group cursor-pointer"
                            >
                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] rounded-2xl flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:scale-105 transition-all">
                                    <item.icon className="w-8 h-8 lg:w-10 lg:h-10 text-[#3366FF]" />
                                </div>
                                <span className="text-xs lg:text-sm text-[#64748b] font-medium">{item.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Enterprise Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e293b] mb-4">
                        Delivery Management Software for Enterprises
                    </h3>
                    <p className="text-lg text-[#64748b] max-w-3xl mx-auto mb-10">
                        Tookan empowers enterprises to win in this customer-centric era with optimized routes,
                        automation, real-time tracking and efficient movement of goods for both B2C and B2B segments.
                    </p>

                    {/* Dashboard Preview Cards */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-sm border border-gray-200"
                            >
                                <div className="bg-white rounded-lg h-32 flex items-center justify-center">
                                    <div className="w-full h-full bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] rounded-lg p-3">
                                        <div className="grid grid-cols-3 gap-2 h-full">
                                            {[1, 2, 3].map((j) => (
                                                <div key={j} className="bg-white/60 rounded" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
