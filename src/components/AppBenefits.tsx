"use client";

import { motion } from "framer-motion";
import {
    MapPin,
    Bell,
    Star,
    Clock,
    CreditCard,
    MessageSquare,
    Navigation,
    FileText,
    BarChart3,
    Route,
    Smartphone,
    Shield,
} from "lucide-react";

const customerFeatures = [
    { icon: MapPin, text: "Real-time order tracking" },
    { icon: Bell, text: "Push notifications & alerts" },
    { icon: Star, text: "Rate and review drivers" },
    { icon: Clock, text: "Scheduled deliveries" },
    { icon: CreditCard, text: "Multiple payment options" },
    { icon: MessageSquare, text: "In-app chat support" },
];

const driverFeatures = [
    { icon: Navigation, text: "Turn-by-turn navigation" },
    { icon: FileText, text: "Digital proof of delivery" },
    { icon: BarChart3, text: "Earnings dashboard" },
    { icon: Route, text: "Optimized routes" },
    { icon: Smartphone, text: "Work offline mode" },
    { icon: Shield, text: "Safety features" },
];

export default function AppBenefits() {
    return (
        <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-4">
                        Discover The Benefits Of Tookan Delivery<br />
                        Apps For Your Business
                    </h2>
                    <p className="text-lg text-[#64748b] max-w-3xl mx-auto">
                        Our comprehensive suite of apps empowers both your customers and delivery agents
                        with powerful features for seamless delivery experiences.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Customer Apps */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-[#00BFA5]/10 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-[#00BFA5]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#1e293b]">Customer Apps</h3>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {customerFeatures.map((feature, i) => (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[#00BFA5]/5 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-[#00BFA5]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5 text-[#00BFA5]" />
                                    </div>
                                    <span className="text-[#1e293b] font-medium">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Phone mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-8 flex justify-center"
                        >
                            <div className="w-48 h-80 bg-gray-900 rounded-[2rem] p-2 shadow-xl">
                                <div className="w-full h-full bg-gradient-to-br from-[#00BFA5] to-[#00A896] rounded-[1.5rem] flex flex-col items-center justify-center text-white p-4">
                                    <div className="text-4xl mb-2">📱</div>
                                    <div className="text-sm font-semibold">Customer App</div>
                                    <div className="text-xs opacity-75">iOS & Android</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Driver/Agent Apps */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-[#3366FF]/10 rounded-xl flex items-center justify-center">
                                <Navigation className="w-6 h-6 text-[#3366FF]" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#1e293b]">Driver/Agent App</h3>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {driverFeatures.map((feature, i) => (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[#3366FF]/5 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-[#3366FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="w-5 h-5 text-[#3366FF]" />
                                    </div>
                                    <span className="text-[#1e293b] font-medium">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Phone mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-8 flex justify-center"
                        >
                            <div className="w-48 h-80 bg-gray-900 rounded-[2rem] p-2 shadow-xl">
                                <div className="w-full h-full bg-gradient-to-br from-[#3366FF] to-[#1e40af] rounded-[1.5rem] flex flex-col items-center justify-center text-white p-4">
                                    <div className="text-4xl mb-2">🚚</div>
                                    <div className="text-sm font-semibold">Driver App</div>
                                    <div className="text-xs opacity-75">iOS & Android</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
