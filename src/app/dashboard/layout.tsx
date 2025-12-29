"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f5f6f8]">
            {/* Sidebar Overlay */}
            <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content - No margin since sidebar is overlay */}
            <div>
                <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
