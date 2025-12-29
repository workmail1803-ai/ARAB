"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserCircle,
    BarChart3,
    Brain,
    Settings,
    MessageCircle,
    Puzzle,
    Sparkles,
    Share2,
    Headphones,
    X,
    MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: MapPin, label: "Track Orders", href: "/dashboard/dispatch", highlight: true },
    { icon: Users, label: "Agent", href: "/dashboard/agents" },
    { icon: UserCircle, label: "Customers", href: "/dashboard/customers" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Brain, label: "AI Prediction", href: "/dashboard/ai-prediction" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    { icon: MessageCircle, label: "Hippo Chat", href: "/dashboard/chat" },
    { icon: Puzzle, label: "Extensions", href: "/dashboard/extensions", badge: "New" },
    { icon: Sparkles, label: "What's New", href: "/dashboard/whats-new", badge: "New" },
    { icon: Share2, label: "Share My Agents", href: "/dashboard/share" },
    { icon: Headphones, label: "Support", href: "/dashboard/support" },
];

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50"
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-0 left-0 h-full w-64 bg-[#1a1f2e] z-50 shadow-2xl"
                    >
                        {/* Logo Header */}
                        <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">T</span>
                                </div>
                                <span className="font-bold text-lg text-white">Tookan</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="py-4 px-2">
                            {menuItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all mb-1 ${active || item.highlight
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
