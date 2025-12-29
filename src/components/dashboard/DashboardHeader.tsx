"use client";

import { Menu, Bell, Search, User, Settings, HelpCircle, LogOut } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between h-14 px-4">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900 hidden sm:block">Tookan</span>
                    </Link>

                    {/* Search */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg w-64 lg:w-80 ml-4">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-sm w-full text-gray-600 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {/* Help */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <HelpCircle className="w-5 h-5" />
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
                        >
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">JD</span>
                            </div>
                        </button>

                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="font-medium text-gray-900">John Doe</div>
                                        <div className="text-sm text-gray-500">admin@company.com</div>
                                    </div>
                                    <div className="py-1">
                                        <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <User className="w-4 h-4" />
                                            Profile Settings
                                        </a>
                                        <Link
                                            href="/dashboard/settings"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Account Settings
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100 py-1">
                                        <a href="/" className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
