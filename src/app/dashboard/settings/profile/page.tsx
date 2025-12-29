"use client";

import { useState, useEffect } from "react";
import {
    User,
    Building2,
    Phone,
    Mail,
    Globe,
    MapPin,
    Loader2,
    Save,
    Camera,
    ChevronDown,
    Lock,
    Shield,
    Languages,
    Trash2,
} from "lucide-react";

interface CompanyProfile {
    id: string;
    name: string;
    api_key: string;
    webhook_secret: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Expanded accordion states
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Form fields (simulated additional fields)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        timezone: "Asia/Dhaka",
        address: "",
        city: "",
        country: "Bangladesh",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found. Please log in first.");
                setLoading(false);
                return;
            }

            const response = await fetch("/api/v1/company", {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (!response.ok) throw new Error("Failed to fetch profile");

            const data = await response.json();
            setProfile(data.data);
            setFormData(prev => ({
                ...prev,
                firstName: data.data.name?.split(' ')[0] || "",
                lastName: data.data.name?.split(' ')[1] || "",
            }));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    const updateFormData = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const apiKey = localStorage.getItem("api_key");
            const response = await fetch("/api/v1/company", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`.trim() || profile?.name,
                }),
            });

            if (!response.ok) throw new Error("Failed to save");
            setHasChanges(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                <h3 className="font-semibold mb-2">Error Loading Profile</h3>
                <p className="text-sm">{error}</p>
                <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                        <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
                    <p className="text-gray-500">Company Profile</p>
                </div>
            </div>

            {/* Basic Info */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Basic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => updateFormData("firstName", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter first name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => updateFormData("lastName", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter last name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                            <Phone className="w-4 h-4" /> Phone
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="+880 1XXX-XXXXXX"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                            <Mail className="w-4 h-4" /> Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="email@company.com"
                        />
                    </div>
                </div>
            </section>

            {/* Location */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Location
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => updateFormData("address", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => updateFormData("city", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="City"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                            <Globe className="w-4 h-4" /> Timezone
                        </label>
                        <select
                            value={formData.timezone}
                            onChange={(e) => updateFormData("timezone", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Asia/Dhaka">Asia/Dhaka (UTC+6)</option>
                            <option value="America/New_York">America/New_York (UTC-5)</option>
                            <option value="Europe/London">Europe/London (UTC+0)</option>
                            <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Accordion Sections */}
            <section className="space-y-3">
                {/* Language */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleSection("language")}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                        <span className="flex items-center gap-2 font-medium text-gray-900">
                            <Languages className="w-5 h-5 text-indigo-600" />
                            Change Language
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.has("language") ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSections.has("language") && (
                        <div className="p-4 pt-0 border-t border-gray-100">
                            <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>Arabic</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Password */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleSection("password")}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                        <span className="flex items-center gap-2 font-medium text-gray-900">
                            <Lock className="w-5 h-5 text-indigo-600" />
                            Change Password
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.has("password") ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSections.has("password") && (
                        <div className="p-4 pt-0 border-t border-gray-100 space-y-3">
                            <input type="password" placeholder="Current Password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                            <input type="password" placeholder="New Password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                            <input type="password" placeholder="Confirm New Password" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                                Update Password
                            </button>
                        </div>
                    )}
                </div>

                {/* 2FA */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleSection("2fa")}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                        <span className="flex items-center gap-2 font-medium text-gray-900">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            Two-Factor Authentication
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.has("2fa") ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSections.has("2fa") && (
                        <div className="p-4 pt-0 border-t border-gray-100">
                            <p className="text-sm text-gray-600 mb-3">
                                Add an extra layer of security to your account by enabling two-factor authentication.
                            </p>
                            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                                Enable 2FA
                            </button>
                        </div>
                    )}
                </div>

                {/* Delete Account */}
                <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleSection("delete")}
                        className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
                    >
                        <span className="flex items-center gap-2 font-medium text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Delete Account
                        </span>
                        <ChevronDown className={`w-5 h-5 text-red-400 transition-transform ${expandedSections.has("delete") ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSections.has("delete") && (
                        <div className="p-4 pt-0 border-t border-red-100">
                            <p className="text-sm text-red-600 mb-3">
                                Warning: This action cannot be undone. All your data will be permanently deleted.
                            </p>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                                Delete My Account
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Floating Save Button */}
            {hasChanges && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
}
