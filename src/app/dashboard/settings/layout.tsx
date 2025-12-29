"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Settings,
    Palette,
    User,
    FileText,
    MapPin,
    Zap,
    Users,
    Truck,
    Smartphone,
    Bell,
    Shield,
    TrendingUp,
    Globe,
    MessageSquare,
    Mail,
    CreditCard,
    ChevronUp,
    Key,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
    { icon: Settings, label: "Preferences", href: "/dashboard/settings" },
    { icon: Palette, label: "Theme Settings", href: "/dashboard/settings/theme" },
    { icon: User, label: "Profile", href: "/dashboard/settings/profile" },
    { divider: true },
    { icon: FileText, label: "Templates", href: "/dashboard/settings/templates" },
    { icon: MapPin, label: "Geo Fence", href: "/dashboard/settings/geofence" },
    { icon: Zap, label: "Auto Allocation", href: "/dashboard/settings/auto-allocation" },
    { icon: Users, label: "Freelancer", href: "/dashboard/settings/freelancer" },
    { divider: true },
    { icon: Users, label: "Teams", href: "/dashboard/settings/teams" },
    { icon: Truck, label: "Manager", href: "/dashboard/settings/manager" },
    { icon: Smartphone, label: "Agent App", href: "/dashboard/settings/agent-app" },
    { icon: Bell, label: "Notifications", href: "/dashboard/settings/notifications" },
    { icon: Shield, label: "Access Control", href: "/dashboard/settings/access-control" },
    { icon: TrendingUp, label: "Surge", href: "/dashboard/settings/surge" },
    { divider: true },
    { icon: Globe, label: "Web App Editor", href: "/dashboard/settings/web-app" },
    { icon: MessageSquare, label: "SMS", href: "/dashboard/settings/sms" },
    { icon: Mail, label: "Email", href: "/dashboard/settings/email" },
    { icon: CreditCard, label: "Billing", href: "/dashboard/settings/billing" },
    { divider: true },
    { icon: Key, label: "API Keys", href: "/dashboard/settings/api-keys" },
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [menuOpen, setMenuOpen] = useState(true);
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href;

    return (
        <div className="flex gap-6">
            {/* Settings Dropdown Menu - Sticky */}
            <div className="flex-shrink-0 sticky top-0 self-start">
                {/* Toggle Header */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 mb-2"
                >
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Settings</span>
                    <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "" : "rotate-180"}`} />
                </button>

                {/* Dropdown Panel */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-[calc(100vh-120px)] overflow-y-auto"
                        >
                            {menuItems.map((item, index) =>
                                item.divider ? (
                                    <div key={index} className="border-t border-gray-100 my-1" />
                                ) : (
                                    <Link
                                        key={item.href}
                                        href={item.href!}
                                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive(item.href!)
                                            ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                                            : "text-gray-600 hover:bg-gray-50 border-l-2 border-transparent"
                                            }`}
                                    >
                                        {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
