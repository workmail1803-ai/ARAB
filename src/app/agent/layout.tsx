"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("agent_token");
        const isLoginPage = pathname === "/agent/login";

        if (!token && !isLoginPage) {
            router.push("/agent/login");
        } else if (token && isLoginPage) {
            router.push("/agent");
        }
        
        setIsChecking(false);
    }, [pathname, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {children}
        </div>
    );
}
