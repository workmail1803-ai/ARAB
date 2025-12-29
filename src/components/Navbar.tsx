"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Truck, Zap, MapPin, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

const navLinks = [
    { label: "Products", href: "#products", hasDropdown: true },
    { label: "Solutions", href: "#solutions", hasDropdown: false },
    { label: "Features", href: "#features", hasDropdown: true },
    { label: "Pricing", href: "#pricing", hasDropdown: false },
    { label: "Resources", href: "#resources", hasDropdown: true },
];

const megaMenuContent = {
    logisticsCloud: [
        { name: "Tookan", desc: "Delivery management software for optimizing fleet operations", icon: Truck, color: "#00BFA5" },
        { name: "Evermile", desc: "Last-mile delivery orchestration platform with real-time tracking", icon: Zap, color: "#3366FF" },
        { name: "Mappr", desc: "Route optimization and territory mapping for delivery networks", icon: MapPin, color: "#8b5cf6" },
    ],
    mobilityCloud: [
        { name: "Yelo", desc: "On-demand delivery platform for restaurants and retail businesses", icon: Truck, color: "#f97316" },
        { name: "Jugnoo", desc: "Hyperlocal delivery and ride-hailing solution for urban markets", icon: Zap, color: "#22c55e" },
    ],
    growthCloud: [
        { name: "Hippo", desc: "Customer engagement platform with omnichannel messaging", icon: MessageSquare, color: "#ec4899" },
        { name: "Outplay", desc: "Sales engagement platform for high-performing teams", icon: TrendingUp, color: "#f97316" },
    ],
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showMegaMenu, setShowMegaMenu] = useState(false);

    return (
        <nav
            className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
            onMouseLeave={() => setShowMegaMenu(false)}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-lg flex items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#00BFA5]" />
                            <span className="relative text-white font-bold text-lg z-10">T</span>
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">
                            Tooka<span className="text-[#00BFA5]">n</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <div
                                key={link.label}
                                className="relative"
                                onMouseEnter={() => link.label === "Products" && setShowMegaMenu(true)}
                            >
                                <Link
                                    href={link.href}
                                    className="flex items-center gap-1 text-[#64748b] hover:text-[#1e293b] transition-colors font-medium py-6"
                                >
                                    {link.label}
                                    {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link
                            href="#login"
                            className="px-5 py-2.5 text-[#3366FF] hover:text-[#1e40af] font-medium transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="#signup"
                            className="px-6 py-2.5 bg-[#3366FF] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition-colors"
                        >
                            Free Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 text-[#1e293b]"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mega Menu */}
            <AnimatePresence>
                {showMegaMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100"
                        onMouseEnter={() => setShowMegaMenu(true)}
                        onMouseLeave={() => setShowMegaMenu(false)}
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="grid grid-cols-3 gap-12">
                                {/* Logistics Cloud */}
                                <div>
                                    <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-4">
                                        Logistics Cloud
                                    </h3>
                                    <div className="space-y-4">
                                        {megaMenuContent.logisticsCloud.map((item) => (
                                            <Link
                                                key={item.name}
                                                href="#"
                                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${item.color}15` }}
                                                >
                                                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[#1e293b] group-hover:text-[#3366FF] transition-colors">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-sm text-[#64748b]">{item.desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobility Cloud */}
                                <div>
                                    <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-4">
                                        Mobility Cloud
                                    </h3>
                                    <div className="space-y-4">
                                        {megaMenuContent.mobilityCloud.map((item) => (
                                            <Link
                                                key={item.name}
                                                href="#"
                                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${item.color}15` }}
                                                >
                                                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[#1e293b] group-hover:text-[#3366FF] transition-colors">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-sm text-[#64748b]">{item.desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Growth Cloud */}
                                <div>
                                    <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-4">
                                        Growth Cloud
                                    </h3>
                                    <div className="space-y-4">
                                        {megaMenuContent.growthCloud.map((item) => (
                                            <Link
                                                key={item.name}
                                                href="#"
                                                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${item.color}15` }}
                                                >
                                                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[#1e293b] group-hover:text-[#3366FF] transition-colors">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-sm text-[#64748b]">{item.desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="flex items-center justify-between py-2 text-[#1e293b] font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                    {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <Link
                                    href="#login"
                                    className="block w-full py-2.5 text-center text-[#3366FF] font-medium"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="#signup"
                                    className="block w-full py-2.5 text-center bg-[#3366FF] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition-colors"
                                >
                                    Free Sign Up
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
