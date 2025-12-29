"use client";

import { motion } from "framer-motion";

const awards = [
    { title: "Easiest To Do Business With", subtitle: "Mid-Market", season: "FALL 2024", color: "#f97316" },
    { title: "Momentum Leader", subtitle: "", season: "FALL 2024", color: "#22c55e" },
    { title: "Leader", subtitle: "Small Business", season: "FALL 2024", color: "#f97316" },
    { title: "Leader", subtitle: "", season: "FALL 2024", color: "#f97316" },
    { title: "Leader", subtitle: "Asia Pacific", season: "FALL 2024", color: "#f97316" },
    { title: "Leader", subtitle: "Asia", season: "FALL 2024", color: "#f97316" },
];

export default function AwardsBadges() {
    return (
        <section className="py-8 bg-[#F9FAFB] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center gap-4 overflow-x-auto pb-4"
                >
                    {/* G2 Logo */}
                    <div className="flex-shrink-0 w-16 h-16 bg-[#FF492C] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">G2</span>
                    </div>

                    {/* Award Badges */}
                    {awards.map((award, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex-shrink-0 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[140px] text-center"
                        >
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: `${award.color}20` }}>
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: award.color }} />
                            </div>
                            <div className="text-xs font-semibold text-[#1e293b] leading-tight">{award.title}</div>
                            {award.subtitle && (
                                <div className="text-[10px] text-[#64748b] mt-0.5" style={{ color: award.color }}>{award.subtitle}</div>
                            )}
                            <div className="text-[10px] text-[#64748b] mt-1">{award.season}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
