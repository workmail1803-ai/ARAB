"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Check,
    GripVertical,
    HelpCircle,
    Loader2,
    Save,
    Package,
    Calendar,
    Users,
} from "lucide-react";

interface Settings {
    id: string;
    company_id: string;
    business_type: string;
    date_format: string;
    time_format: string;
    distance_unit: string;
    map_type: string;
    real_time_tracking: boolean;
    show_delay_time: boolean;
    delay_minutes: number;
    default_dashboard_view: string;
    enable_address_update: boolean;
    enable_qr_code: boolean;
    disable_ratings_tracking: boolean;
    enable_eta_tracking: boolean;
    disable_call_sms_tracking: boolean;
}

// Business Type options
const businessTypes = [
    {
        id: "pickup",
        title: "Pick-up & Delivery",
        description: "Manage on-demand pickups and deliveries efficiently.",
        icon: Package,
        bgColor: "from-blue-500 to-blue-600",
    },
    {
        id: "appointment",
        title: "Appointment",
        description: "Manage at-home services and keep your customers happy.",
        icon: Calendar,
        bgColor: "from-orange-500 to-orange-600",
    },
    {
        id: "field",
        title: "Field Workforce",
        description: "Manage your on-street customer acquisition teams effortlessly.",
        icon: Users,
        bgColor: "from-teal-500 to-teal-600",
    },
];

// Pane customization tags
const agentPaneTags = [
    { id: "fleet_name", label: "FLEET NAME", color: "bg-emerald-500" },
    { id: "phone", label: "PHONE", color: "bg-blue-500" },
    { id: "tags", label: "TAGS", color: "bg-emerald-500" },
];

const trackingPaneTags = [
    { id: "fleet_name", label: "FLEET NAME", color: "bg-emerald-500" },
    { id: "job_type", label: "JOB TYPE", color: "bg-blue-500" },
    { id: "job_address", label: "JOB ADDRESS", color: "bg-emerald-500" },
];

const taskPaneTags = [
    { id: "pickup_time", label: "JOB PICKUP DELIVERY TIME", color: "bg-emerald-500" },
    { id: "customer_name", label: "CUSTOMER USERNAME", color: "bg-emerald-500" },
    { id: "delivery_address", label: "JOB DELIVERY ADDRESS", color: "bg-emerald-500" },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found. Please log in first.");
                setLoading(false);
                return;
            }

            const response = await fetch("/api/v1/settings", {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (!response.ok) throw new Error("Failed to fetch settings");

            const data = await response.json();
            setSettings(data.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = useCallback((key: keyof Settings, value: unknown) => {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
        setHasChanges(true);
    }, []);

    const saveSettings = async () => {
        if (!settings) return;
        setSaving(true);

        try {
            const apiKey = localStorage.getItem("api_key");
            const response = await fetch("/api/v1/settings", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error("Failed to save settings");

            const data = await response.json();
            setSettings(data.data);
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
                <h3 className="font-semibold mb-2">Error Loading Settings</h3>
                <p className="text-sm">{error}</p>
                <button onClick={fetchSettings} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl pb-24">
            {/* Business Type */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Type</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {businessTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = settings?.business_type === type.id;
                        return (
                            <div
                                key={type.id}
                                onClick={() => updateSetting("business_type", type.id)}
                                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${isSelected
                                        ? "border-indigo-500 ring-2 ring-indigo-200 shadow-lg"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                {/* Image */}
                                <div className={`h-28 bg-gradient-to-br ${type.bgColor} flex items-center justify-center`}>
                                    <Icon className="w-12 h-12 text-white/90" />
                                </div>

                                {/* Content */}
                                <div className="p-4 bg-white">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isSelected
                                                    ? "bg-indigo-500 border-indigo-500"
                                                    : "border-gray-300"
                                                }`}
                                        >
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{type.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Agent Pane Customisation */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Agent Pane Customisation</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Customise the information shown in individual Agent tile in Map view.{" "}
                    <button className="text-indigo-600 hover:underline">Reset</button>
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Tags */}
                    <div className="space-y-4">
                        {["LINE1", "LINE2", "LINE3"].map((line, index) => (
                            <div key={line}>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">{line}</label>
                                <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg bg-gray-50/50 hover:border-gray-300 transition-colors">
                                    <span className={`${agentPaneTags[index].color} text-white text-xs font-medium px-2.5 py-1 rounded-md`}>
                                        {agentPaneTags[index].label}
                                    </span>
                                    <div className="flex-1" />
                                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move hover:text-gray-600" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Preview */}
                    <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-3">PREVIEW</div>
                        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg font-semibold">JD</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">JohnDoe</div>
                                <div className="text-sm text-gray-500">9876565434</div>
                                <div className="text-sm text-gray-500">Prime, Sedan</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">0</div>
                                <div className="text-xs text-gray-500">Tasks</div>
                            </div>
                            <span className="text-gray-300 text-xl">›</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tracking Pane customisation */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Tracking Pane customisation</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Customise the information shown in tracking view.{" "}
                    <button className="text-indigo-600 hover:underline">Reset</button>
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {["LINE1", "LINE2", "LINE3"].map((line, index) => (
                            <div key={line}>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">{line}</label>
                                <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                                    <span className={`${trackingPaneTags[index].color} text-white text-xs font-medium px-2.5 py-1 rounded-md`}>
                                        {trackingPaneTags[index].label}
                                    </span>
                                    <div className="flex-1" />
                                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                </div>
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Header</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                placeholder="Enter link header"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-3">PREVIEW</div>
                        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-lg font-semibold">MW</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">Micheal Wade</div>
                                <div className="text-sm text-gray-500">Pickup</div>
                                <div className="text-sm text-gray-500">759 Gleichner Roads Apt. 078,</div>
                                <div className="text-sm text-gray-500">Lula Roberson</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Task Pane Customisation */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Task Pane Customisation</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Customise the information shown in individual Task tile in Map view.{" "}
                    <button className="text-indigo-600 hover:underline">Reset</button>
                </p>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {["LINE1", "LINE2", "LINE3"].map((line, index) => (
                            <div key={line}>
                                <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">{line}</label>
                                <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
                                    <span className={`${taskPaneTags[index].color} text-white text-xs font-medium px-2.5 py-1 rounded-md`}>
                                        {taskPaneTags[index].label}
                                    </span>
                                    <div className="flex-1" />
                                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Preview */}
                    <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-3">PREVIEW</div>
                        <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-1">
                                    <span className="text-white text-lg">👤</span>
                                </div>
                                <div className="text-xs text-gray-500">Agent</div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-gray-600">06:00:00 - 07:00:00</span>
                                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-md">ASSIGNED</span>
                                </div>
                                <div className="font-semibold text-gray-900">SmithAdams</div>
                                <div className="text-sm text-gray-500">759 Gleichner Roads</div>
                                <div className="text-sm text-gray-500">Apt. 078, Lula Roberson</div>
                            </div>
                            <span className="text-gray-300 text-xl">›</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Configuration */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-indigo-600 mb-4">Map Configuration</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">Map Type</label>
                        <select
                            value={settings?.map_type || "google"}
                            onChange={(e) => updateSetting("map_type", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="google">Google Maps</option>
                            <option value="mapbox">Mapbox</option>
                            <option value="osm">OpenStreetMap</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                            Radius Limit to Search Address (IN KM) <HelpCircle className="w-3 h-3" />
                        </label>
                        <input
                            type="number"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                            placeholder="50"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-2 flex items-center gap-1">
                        Real Time Tracking <HelpCircle className="w-3 h-3" />
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings?.real_time_tracking ?? true}
                            onChange={(e) => updateSetting("real_time_tracking", e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                    </label>
                </div>
            </section>

            {/* Default Dashboard View */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Dashboard View</h2>
                <div className="max-w-md">
                    <select
                        value={settings?.default_dashboard_view || "map"}
                        onChange={(e) => updateSetting("default_dashboard_view", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="map">Map View</option>
                        <option value="list">List View</option>
                        <option value="calendar">Calendar View</option>
                    </select>
                </div>
            </section>

            {/* Date Time Format */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Time Format</h2>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
                    <div>
                        <label className="block text-xs font-medium text-indigo-600 uppercase mb-1.5">Date Format</label>
                        <select
                            value={settings?.date_format || "DD MMM YYYY"}
                            onChange={(e) => updateSetting("date_format", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="DD MMM YYYY">DD MMM YYYY (15 DEC 2018)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (12/15/2018)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2018-12-15)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-indigo-600 uppercase mb-1.5">Time Format</label>
                        <select
                            value={settings?.time_format || "12"}
                            onChange={(e) => updateSetting("time_format", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="12">12 Hours</option>
                            <option value="24">24 Hours</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Distance Unit */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Distance Unit</h2>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5">Unit Preferences</label>
                        <select
                            value={settings?.distance_unit || "km"}
                            onChange={(e) => updateSetting("distance_unit", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="km">Kilometer</option>
                            <option value="miles">Miles</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                            Round Off Settings <HelpCircle className="w-3 h-3" />
                        </label>
                        <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                            <option>Default Setting</option>
                            <option>Round Up</option>
                            <option>Round Down</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Task Delay Settings */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Task Delay Settings</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Enable this setting to display task delays. When enabled, the delay time will be shown on both the dashboard and task details.
                </p>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings?.show_delay_time ?? true}
                            onChange={(e) => updateSetting("show_delay_time", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-indigo-600">Show Delay Time</span>
                    </label>
                    <input
                        type="number"
                        value={settings?.delay_minutes ?? 5}
                        onChange={(e) => updateSetting("delay_minutes", parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center"
                    />
                    <span className="text-sm text-gray-500">(in minutes)</span>
                </div>
            </section>

            {/* Barcode Settings */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Barcode Settings</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Enable this setting to switch from Barcode to QR Code.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings?.enable_qr_code ?? false}
                        onChange={(e) => updateSetting("enable_qr_code", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-indigo-600">Enable QR Code</span>
                </label>
            </section>

            {/* Tracking Link Settings */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking Link Settings</h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings?.disable_ratings_tracking ?? false}
                            onChange={(e) => updateSetting("disable_ratings_tracking", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Disable Ratings on Tracking Link</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings?.enable_eta_tracking ?? true}
                            onChange={(e) => updateSetting("enable_eta_tracking", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Enable ETA in Tracking Link</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings?.disable_call_sms_tracking ?? false}
                            onChange={(e) => updateSetting("disable_call_sms_tracking", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Disable Calling and Messaging on Tracking Link</span>
                    </label>
                </div>
            </section>

            {/* Floating Save Button */}
            {hasChanges && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
}
