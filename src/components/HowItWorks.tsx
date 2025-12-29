"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const steps = [
    {
        step: 1,
        title: "Create your account",
        description: "Sign up and set up your business profile with your delivery preferences.",
    },
    {
        step: 2,
        title: "Configure your fleet",
        description: "Add drivers, vehicles, and set up delivery zones and pricing.",
    },
    {
        step: 3,
        title: "Start accepting orders",
        description: "Integrate with your ordering system and start managing deliveries.",
    },
    {
        step: 4,
        title: "Track & optimize",
        description: "Monitor performance, track deliveries in real-time, and scale your operations.",
    },
];

export default function HowItWorks() {
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
                        How It Works
                    </h2>
                    <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
                        Get started with Tookan in just a few simple steps and transform your delivery operations.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((item, index) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-[#00BFA5] to-[#00BFA5]/30" />
                            )}

                            <div className="text-center">
                                {/* Step number */}
                                <div className="relative inline-flex">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#00BFA5] to-[#00A896] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#00BFA5]/30">
                                        {item.step}
                                    </div>
                                    <div className="absolute -right-1 -bottom-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                                        <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-[#1e293b] mt-6 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-[#64748b] leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <a
                        href="#get-started"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#00BFA5] hover:bg-[#00A896] text-white font-semibold rounded-xl transition-all hover:shadow-lg"
                    >
                        Get Started Now
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
