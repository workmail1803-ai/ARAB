"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
    "Unlimited tasks & deliveries",
    "Real-time GPS tracking",
    "Route optimization",
    "Customer notifications",
    "Driver mobile app",
    "Analytics dashboard",
    "API access",
    "24/7 support",
];

export default function Pricing() {
    return (
        <section className="py-20 lg:py-28 bg-[#F9FAFB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left - Pricing Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">
                            <div className="text-sm font-medium text-[#00BFA5] uppercase tracking-wider mb-2">
                                Starting at
                            </div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl lg:text-6xl font-bold text-[#1e293b]">$5,099</span>
                                <span className="text-xl text-[#64748b]">/-</span>
                            </div>
                            <p className="text-[#64748b] mb-8">
                                All-inclusive delivery management solution for your business
                            </p>

                            <div className="grid sm:grid-cols-2 gap-3 mb-8">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-5 h-5 bg-[#00BFA5]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-[#00BFA5]" />
                                        </div>
                                        <span className="text-sm text-[#1e293b]">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <Link
                                href="#contact"
                                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-[#00BFA5] hover:bg-[#00A896] text-white font-semibold rounded-xl transition-all hover:shadow-lg"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right - Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6">
                            Powerful Last Mile Delivery<br />
                            Tracking and Management
                        </h2>
                        <p className="text-lg text-[#64748b] mb-8 leading-relaxed">
                            Get everything you need to manage your delivery operations efficiently.
                            From real-time tracking to automated dispatch, our platform scales with
                            your business.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Complete white-label solution with your branding",
                                "Customizable workflows for your business needs",
                                "Enterprise-grade security and reliability",
                                "Dedicated account manager for support",
                            ].map((item, i) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-6 h-6 bg-[#00BFA5] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-[#1e293b]">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
