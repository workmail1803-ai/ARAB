"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    color?: string;
    index?: number;
}

export default function FeatureCard({
    icon: Icon,
    title,
    description,
    color = "#00BFA5",
    index = 0,
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group bg-white rounded-2xl p-6 lg:p-8 card-hover border border-gray-100 hover:border-transparent"
        >
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon className="w-7 h-7" style={{ color }} />
            </div>
            <h3 className="text-xl font-bold text-[#1e293b] mb-3">{title}</h3>
            <p className="text-[#64748b] leading-relaxed">{description}</p>
        </motion.div>
    );
}
