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
    ChevronDown,
} from "lucide-react";

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
];

export default function SettingsDropdown() {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href;

    return (
        <div className="relative">
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Settings</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-[70vh] overflow-y-auto">
                    {menuItems.map((item, index) =>
                        item.divider ? (
                            <div key={index} className="border-t border-gray-100 my-2" />
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive(item.href!)
                                        ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 border-l-2 border-transparent"
                                    }`}
                            >
                                {item.icon && <item.icon className="w-4 h-4" />}
                                <span>{item.label}</span>
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
