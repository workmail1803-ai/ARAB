"use client";

import { motion } from "framer-motion";

const logos = [
    { name: "McDonald's", abbr: "Mc" },
    { name: "Tata", abbr: "TATA" },
    { name: "Domino's", abbr: "D" },
    { name: "KFC", abbr: "KFC" },
    { name: "Pizza Hut", abbr: "PH" },
    { name: "Swiggy", abbr: "SW" },
    { name: "Zomato", abbr: "Z" },
    { name: "Uber", abbr: "U" },
];

export default function TrustedBy() {
    return (
        <section className="py-16 bg-[#F9FAFB] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <p className="text-sm font-medium text-[#64748b] uppercase tracking-wider">
                        Trusted by the best
                    </p>
                </motion.div>

                {/* Logo Carousel */}
                <div className="relative">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F9FAFB] to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F9FAFB] to-transparent z-10" />

                    <div className="flex overflow-hidden">
                        <div className="flex gap-16 animate-scroll">
                            {[...logos, ...logos].map((logo, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-center min-w-[120px] h-16"
                                >
                                    <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-600 font-bold text-sm">
                                                {logo.abbr}
                                            </span>
                                        </div>
                                        <span className="text-gray-500 font-semibold whitespace-nowrap">
                                            {logo.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
