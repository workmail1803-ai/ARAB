"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Phone, Lock, Building2, Eye, EyeOff } from "lucide-react";

export default function AgentLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        company_code: "",
        phone: "",
        pin_code: "",
    });
    const [showPin, setShowPin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Get device info
            const deviceId = localStorage.getItem("device_id") || `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem("device_id", deviceId);

            const response = await fetch("/api/agent/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    device_id: deviceId,
                    device_type: "web",
                    device_model: navigator.userAgent.slice(0, 50),
                    app_version: "1.0.0",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed");
                return;
            }

            // Store session
            localStorage.setItem("agent_token", data.data.session_token);
            localStorage.setItem("agent_rider_id", data.data.rider.id);
            localStorage.setItem("agent_rider_name", data.data.rider.name);
            localStorage.setItem("agent_company_name", data.data.company.name);

            router.push("/agent");
        } catch (err) {
            console.error(err);
            setError("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Header */}
            <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl mb-4">
                    <Truck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Tookan Agent</h1>
                <p className="text-slate-400 mt-1">Delivery Partner App</p>
            </div>

            {/* Login Form */}
            <div className="flex-1 px-6 pb-8">
                <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-6 border border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Company Code */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Company Code</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={formData.company_code}
                                    onChange={(e) => setFormData({ ...formData, company_code: e.target.value })}
                                    placeholder="Enter company code"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Ask your manager for the code</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+966501234567"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        {/* PIN */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">PIN Code</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPin ? "text" : "password"}
                                    value={formData.pin_code}
                                    onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                                    placeholder="Enter 4-6 digit PIN"
                                    required
                                    maxLength={6}
                                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                                >
                                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">First login? Use any PIN to set it up</p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-teal-500/40"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                {/* Help */}
                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm">
                        Need help?{" "}
                        <a href="tel:+966500000000" className="text-teal-400 hover:underline">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 text-center text-slate-600 text-xs">
                Tookan Agent v1.0.0
            </div>
        </div>
    );
}
