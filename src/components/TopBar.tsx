"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

const topLinks = [
    { label: "Products", href: "#", hasDropdown: true },
    { label: "Industries", href: "#", hasDropdown: true },
    { label: "Learn", href: "#", hasDropdown: true },
    { label: "Partner", href: "#", hasDropdown: true },
    { label: "Pricing", href: "#", hasDropdown: true },
];

export default function TopBar() {
    return (
        <div className="bg-[#3366FF] text-white py-2 relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Jungleworks Logo */}
                    <Link href="https://jungleworks.com" className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                            <span className="text-[#3366FF] font-bold text-xs">J</span>
                        </div>
                        <span className="text-sm font-medium">Jungleworks</span>
                    </Link>

                    {/* Top Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {topLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-1 text-sm text-white/90 hover:text-white transition-colors"
                            >
                                {link.label}
                                {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
