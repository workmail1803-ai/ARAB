"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
    {
        name: "John Smith",
        role: "Operations Manager",
        company: "FastDelivery Co.",
        rating: 5,
        text: "Tookan has transformed our delivery operations. Real-time tracking and route optimization have reduced our delivery times by 40%.",
    },
    {
        name: "Sarah Johnson",
        role: "CEO",
        company: "GroceryNow",
        rating: 5,
        text: "The best delivery management solution we've used. The customer support is exceptional and the platform is incredibly reliable.",
    },
    {
        name: "Mike Chen",
        role: "Fleet Manager",
        company: "QuickShip Logistics",
        rating: 5,
        text: "Easy to set up and use. Our drivers love the app and customers appreciate the real-time updates. Highly recommended!",
    },
];

const stats = [
    { value: "4.0", label: "Average Rating" },
    { value: "10K+", label: "Happy Customers" },
    { value: "50M+", label: "Deliveries" },
];

export default function Reviews() {
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
                        Reviews And Ratings
                    </h2>
                    <p className="text-lg text-[#64748b] max-w-2xl mx-auto">
                        See what our customers have to say about their experience with Tookan
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Rating Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-[#00BFA5] to-[#00A896] rounded-2xl p-8 text-white"
                    >
                        <div className="text-6xl font-bold mb-2">4.0</div>
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            ))}
                            <Star className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
                        </div>
                        <div className="text-white/80 mb-6">Based on 2,500+ reviews</div>

                        <div className="space-y-3">
                            {stats.map((stat) => (
                                <div key={stat.label} className="flex justify-between items-center">
                                    <span className="text-white/80">{stat.label}</span>
                                    <span className="font-semibold">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Review Cards */}
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (index + 1) * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            <Quote className="w-8 h-8 text-[#00BFA5]/20 mb-3" />

                            <p className="text-[#64748b] mb-6 leading-relaxed">
                                &quot;{review.text}&quot;
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#00BFA5] to-[#3366FF] rounded-full flex items-center justify-center text-white font-semibold">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-[#1e293b]">{review.name}</div>
                                    <div className="text-xs text-[#64748b]">{review.role}, {review.company}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
