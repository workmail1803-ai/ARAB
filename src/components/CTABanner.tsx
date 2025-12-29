"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTABanner() {
    return (
        <section className="py-20 lg:py-28 bg-gradient-to-r from-[#00BFA5] to-[#00A896] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                            Launch Your Pickup And Delivery
                            Application And Allow Customers To Order
                            Products/Services, Anytime, Anywhere!
                        </h2>
                        <p className="text-lg text-white/90 mb-8">
                            Start Your 14 Days Free Trial
                        </p>
                        <Link
                            href="#get-started"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#00BFA5] font-semibold rounded-xl transition-all hover:shadow-xl hover:scale-105"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>

                    {/* Right - App Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            {/* Dashboard card */}
                            <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-[#00BFA5] rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">T</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#1e293b]">Tookan</div>
                                        <div className="text-xs text-[#64748b]">Delivery Dashboard</div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-[#64748b]">Today&apos;s Revenue</span>
                                        <span className="text-lg font-bold text-[#00BFA5]">$4,280</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-[#00BFA5] rounded-full" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#00BFA5]/10 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-[#00BFA5]">156</div>
                                        <div className="text-xs text-[#64748b]">Orders</div>
                                    </div>
                                    <div className="bg-[#3366FF]/10 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-[#3366FF]">24</div>
                                        <div className="text-xs text-[#64748b]">Drivers</div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating notification */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="absolute -right-8 top-1/4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600">✓</span>
                                </div>
                                <div className="text-xs">
                                    <div className="font-semibold text-[#1e293b]">Order Delivered!</div>
                                    <div className="text-[#64748b]">Just now</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
