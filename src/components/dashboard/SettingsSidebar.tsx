"use client";

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
    Upload,
    ScrollText,
    BookOpen,
    Key,
    Map,
    Plug,
} from "lucide-react";

interface SettingsSidebarProps {
    isOpen: boolean;
}

const menuSections = [
    {
        items: [
            { icon: Settings, label: "Preferences", href: "/dashboard/settings" },
            { icon: Palette, label: "Theme Settings", href: "/dashboard/settings/theme" },
            { icon: User, label: "Profile", href: "/dashboard/settings/profile" },
            { icon: Map, label: "Map Configuration", href: "/dashboard/settings/map" },
            { icon: Plug, label: "Integrations", href: "/dashboard/settings/integrations" },
        ],
    },
    {
        items: [
            { icon: FileText, label: "Templates", href: "/dashboard/settings/templates" },
            { icon: MapPin, label: "Geo Fence", href: "/dashboard/settings/geofence" },
            { icon: Zap, label: "Auto Allocation", href: "/dashboard/settings/auto-allocation" },
            { icon: Users, label: "Freelancer", href: "/dashboard/settings/freelancer" },
        ],
    },
    {
        items: [
            { icon: Users, label: "Teams", href: "/dashboard/settings/teams" },
            { icon: Truck, label: "Manager", href: "/dashboard/settings/manager" },
            { icon: Smartphone, label: "Agent App", href: "/dashboard/settings/agent-app" },
            { icon: Bell, label: "Notifications", href: "/dashboard/settings/notifications" },
            { icon: Shield, label: "Access Control", href: "/dashboard/settings/access-control" },
            { icon: TrendingUp, label: "Surge", href: "/dashboard/settings/surge" },
        ],
    },
    {
        items: [
            { icon: Globe, label: "Web App Editor", href: "/dashboard/settings/web-app" },
            { icon: MessageSquare, label: "SMS", href: "/dashboard/settings/sms" },
            { icon: Mail, label: "Email", href: "/dashboard/settings/email" },
            { icon: CreditCard, label: "Billing", href: "/dashboard/settings/billing" },
        ],
    },
    {
        items: [
            { icon: Upload, label: "Bulk Import History", href: "/dashboard/settings/import" },
            { icon: ScrollText, label: "Account Logs", href: "/dashboard/settings/logs" },
            { icon: BookOpen, label: "User Guide", href: "/dashboard/settings/guide" },
            { icon: Key, label: "API Keys", href: "/dashboard/settings/api-keys" },
        ],
    },
];

export default function SettingsSidebar({ isOpen }: SettingsSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href;

    return (
        <aside
            className={`fixed top-14 left-64 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 z-40 transition-all duration-300 overflow-y-auto ${isOpen ? "w-52" : "w-0"
                }`}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Settings</span>
            </div>

            {/* Menu Sections */}
            <nav className="py-2">
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={sectionIndex > 0 ? "border-t border-gray-100 pt-2 mt-2" : ""}>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive(item.href)
                                        ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 border-l-2 border-transparent"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
