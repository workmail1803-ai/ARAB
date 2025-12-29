"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Package,
    Clock,
    Star,
    Shield,
    LogOut,
    ChevronRight,
    Camera,
    Bell,
    HelpCircle,
    FileText
} from "lucide-react";

interface Profile {
    id: string;
    name: string;
    phone: string;
    email?: string;
    photo_url?: string;
    vehicle_type?: string;
    vehicle_number?: string;
    created_at: string;
}

interface Stats {
    total_deliveries: number;
    completed_deliveries: number;
    rating: number;
    active_days: number;
}

export default function AgentProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<Stats>({
        total_deliveries: 0,
        completed_deliveries: 0,
        rating: 0,
        active_days: 0
    });
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState("");

    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem("agent_token");
            if (!token) return;

            const response = await fetch("/api/agent/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.data.rider);
                
                // Calculate active days
                const createdAt = new Date(data.data.rider.created_at);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                setStats(prev => ({
                    ...prev,
                    active_days: diffDays,
                    // These would come from actual stats endpoint
                    total_deliveries: data.data.stats?.total_deliveries || 0,
                    completed_deliveries: data.data.stats?.completed_deliveries || 0,
                    rating: data.data.stats?.rating || 5.0
                }));
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCompanyName(localStorage.getItem("agent_company_name") || "Company");
        fetchProfile();
    }, [fetchProfile]);

    const handleLogout = async () => {
        if (!confirm("Are you sure you want to logout?")) return;

        try {
            const token = localStorage.getItem("agent_token");
            await fetch("/api/agent/auth/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error(error);
        }

        localStorage.removeItem("agent_token");
        localStorage.removeItem("agent_rider_id");
        localStorage.removeItem("agent_rider_name");
        localStorage.removeItem("agent_company_name");
        router.push("/agent/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 pt-4 pb-16">
                <div className="flex items-center gap-3 px-4">
                    <button onClick={() => router.push("/agent")} className="p-2 -ml-2">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-white font-semibold text-lg">My Profile</h1>
                </div>
            </div>

            {/* Profile Card */}
            <div className="px-4 -mt-12">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                                {profile?.photo_url ? (
                                    <img
                                        src={profile.photo_url}
                                        alt={profile.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                                <Camera className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">{profile?.name || "Agent"}</h2>
                            <p className="text-slate-400 text-sm">{companyName}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-amber-400 font-medium">{stats.rating.toFixed(1)}</span>
                                <span className="text-slate-500 text-sm">rating</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{stats.total_deliveries}</p>
                            <p className="text-xs text-slate-500">Total Tasks</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{stats.completed_deliveries}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-teal-400">{stats.active_days}</p>
                            <p className="text-xs text-slate-500">Days Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="px-4 mt-6">
                <h3 className="text-slate-400 text-sm font-medium mb-3 px-1">Contact Information</h3>
                <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
                    <div className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500">Phone Number</p>
                            <p className="text-white">{profile?.phone || "Not set"}</p>
                        </div>
                    </div>

                    {profile?.email && (
                        <div className="flex items-center gap-3 p-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500">Email</p>
                                <p className="text-white">{profile.email}</p>
                            </div>
                        </div>
                    )}

                    {profile?.vehicle_type && (
                        <div className="flex items-center gap-3 p-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Package className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500">Vehicle</p>
                                <p className="text-white">{profile.vehicle_type} - {profile.vehicle_number}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings */}
            <div className="px-4 mt-6">
                <h3 className="text-slate-400 text-sm font-medium mb-3 px-1">Settings</h3>
                <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
                    <button className="w-full flex items-center gap-3 p-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white">Notifications</p>
                            <p className="text-xs text-slate-500">Manage push notifications</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>

                    <button className="w-full flex items-center gap-3 p-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white">Security</p>
                            <p className="text-xs text-slate-500">Change PIN, manage devices</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>

                    <button className="w-full flex items-center gap-3 p-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white">Help & Support</p>
                            <p className="text-xs text-slate-500">FAQs, contact support</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>

                    <button className="w-full flex items-center gap-3 p-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-slate-600/50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white">Terms & Privacy</p>
                            <p className="text-xs text-slate-500">Legal information</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Logout */}
            <div className="px-4 mt-6">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>

            {/* Version */}
            <div className="text-center text-slate-600 text-xs mt-6 pb-4">
                Tookan Agent v1.0.0
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-6 py-3">
                <div className="flex items-center justify-around">
                    <button 
                        onClick={() => router.push("/agent")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <Package className="w-6 h-6" />
                        <span className="text-xs mt-1">Tasks</span>
                    </button>
                    <button className="flex flex-col items-center text-slate-500">
                        <MapPin className="w-6 h-6" />
                        <span className="text-xs mt-1">Map</span>
                    </button>
                    <button 
                        onClick={() => router.push("/agent/history")}
                        className="flex flex-col items-center text-slate-500"
                    >
                        <Clock className="w-6 h-6" />
                        <span className="text-xs mt-1">History</span>
                    </button>
                    <button className="flex flex-col items-center text-teal-400">
                        <User className="w-6 h-6" />
                        <span className="text-xs mt-1">Profile</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
