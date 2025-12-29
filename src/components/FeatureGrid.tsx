"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const solutions = [
    {
        id: "food",
        title: "Food",
        description: "Tookan automatically allocates food deliveries with optimized routes which enable quick planning for every driver.",
        image: "🍕",
        bgColor: "from-[#fef3c7] to-[#fde68a]",
    },
    {
        id: "grocery",
        title: "Grocery",
        description: "Improve operational efficiency with automated delivery processes, seamless integration, customer profile, inventory management, and more.",
        image: "🛒",
        bgColor: "from-[#d1fae5] to-[#a7f3d0]",
    },
    {
        id: "pickup",
        title: "Pickup and Delivery",
        description: "Enhance pick-up and delivery business with route optimization, real-time tracking, task automation, and more.",
        image: "📦",
        bgColor: "from-[#dbeafe] to-[#bfdbfe]",
    },
    {
        id: "logistics",
        title: "Logistics",
        description: "Tookan manages all complex logistics operations simultaneously and speeds up the business flow to bring in more revenue.",
        image: "🚛",
        bgColor: "from-[#ede9fe] to-[#ddd6fe]",
    },
    {
        id: "courier",
        title: "Courier",
        description: "To manage multiple deliveries in a day, Tookan optimizes your delivery operations keeping your profit margins and operation scale in mind.",
        image: "📮",
        bgColor: "from-[#fce7f3] to-[#fbcfe8]",
    },
];

export default function FeatureGrid() {
    return (
        <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6">
                        Tailor-made Solutions for Every Business
                    </h2>
                </motion.div>

                {/* Solution Cards */}
                <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                    {solutions.map((solution, index) => (
                        <motion.div
                            key={solution.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group"
                        >
                            <Link href={`#${solution.id}`} className="block">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300 w-[180px]">
                                    {/* Illustration */}
                                    <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${solution.bgColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                                        <span className="text-6xl">{solution.image}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-[#1e293b] text-center group-hover:text-[#3366FF] transition-colors">
                                        {solution.title}
                                    </h3>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {/* View All Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Link href="#solutions" className="block">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#3366FF] transition-all duration-300 w-[180px] h-full flex flex-col items-center justify-center">
                                <span className="text-[#3366FF] font-semibold underline underline-offset-4">
                                    View All
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
