"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="pt-8 lg:pt-16 pb-16 lg:pb-24 bg-gradient-to-b from-white to-[#F9FAFB] overflow-hidden relative">
            {/* Static decorative snowflakes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {["10%", "25%", "45%", "65%", "80%", "90%"].map((left, i) => (
                    <div
                        key={i}
                        className="snowflake-bg absolute"
                        style={{
                            left,
                            top: `${10 + i * 15}%`,
                            fontSize: `${16 + i * 4}px`,
                        }}
                    >
                        ❄
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center lg:text-left"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1e293b] leading-tight mb-6">
                            Deliveries<br />
                            Made Smarter
                        </h1>
                        <p className="text-lg lg:text-xl text-[#64748b] leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                            Manage all your delivery operations from one platform to enhance
                            efficiency and deliver exceptional customer experience at scale.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3366FF] hover:bg-[#1e40af] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#3366FF]/25"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/connect"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[#3366FF] font-semibold transition-all hover:bg-[#3366FF]/5 rounded-xl"
                            >
                                Talk to Sales
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Content - Hero Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative">
                            {/* Main Dashboard Image */}
                            <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                {/* Dashboard Chrome */}
                                <div className="flex items-center gap-2 px-4 py-3 bg-[#1e293b] border-b border-gray-700">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-[#00BFA5] rounded flex items-center justify-center">
                                                <span className="text-white text-[8px] font-bold">T</span>
                                            </div>
                                            <span className="text-xs text-white">Tookan Dashboard</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="p-4 bg-gray-50">
                                    {/* Top Stats */}
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {["Orders", "Drivers", "Completed", "Revenue"].map((label, i) => (
                                            <div key={label} className="bg-white rounded-lg p-3 shadow-sm">
                                                <div className="text-xs text-gray-500">{label}</div>
                                                <div className="text-lg font-bold text-[#1e293b]">
                                                    {["156", "42", "1,284", "$12.4K"][i]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Map Area */}
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                        <div className="h-44 bg-gradient-to-br from-[#e0f2f1] via-[#b2dfdb] to-[#80cbc4] relative">
                                            {/* Map Grid */}
                                            <div className="absolute inset-0 opacity-20">
                                                <svg className="w-full h-full">
                                                    <defs>
                                                        <pattern id="heroGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                                                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#00BFA5" strokeWidth="0.5" />
                                                        </pattern>
                                                    </defs>
                                                    <rect width="100%" height="100%" fill="url(#heroGrid)" />
                                                </svg>
                                            </div>

                                            {/* Map Pins */}
                                            {[
                                                { top: "20%", left: "25%", color: "#00BFA5" },
                                                { top: "40%", left: "55%", color: "#3366FF" },
                                                { top: "65%", left: "35%", color: "#f97316" },
                                                { top: "30%", left: "75%", color: "#00BFA5" },
                                            ].map((pin, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                    className="absolute"
                                                    style={{ top: pin.top, left: pin.left }}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                                                        style={{ backgroundColor: pin.color }}
                                                    >
                                                        <div className="w-3 h-3 bg-white rounded-full" />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Delivery Guy */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="absolute -right-8 -bottom-8 w-32 h-40 bg-gradient-to-br from-[#3366FF] to-[#1e40af] rounded-2xl flex flex-col items-center justify-center text-white shadow-xl"
                            >
                                <div className="text-4xl mb-2">📦</div>
                                <div className="text-xs font-medium">Delivery</div>
                                <div className="text-xs opacity-75">En Route</div>
                            </motion.div>

                            {/* Floating Van */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 }}
                                className="absolute -left-6 bottom-1/4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
                            >
                                <div className="w-10 h-10 bg-[#fef3c7] rounded-lg flex items-center justify-center text-2xl">
                                    🚚
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-[#1e293b]">Van #12</div>
                                    <div className="text-[10px] text-[#00BFA5]">● In Transit</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
