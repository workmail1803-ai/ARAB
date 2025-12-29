"use client";

import { useState, useEffect } from "react";
import {
    Save,
    Loader2,
    Map,
    HelpCircle,
    ExternalLink,
    Eye,
    EyeOff,
    Copy,
    Check,
} from "lucide-react";

interface MapSettings {
    id: string | null;
    company_id: string;
    map_type: string;
    real_time_tracking: boolean;
    web_key: string;
    android_key: string;
    ios_key: string;
    server_key: string;
    form_key: string;
    mappr_dashboard_url: string;
}

export default function MapSettingsPage() {
    const [settings, setSettings] = useState<MapSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

            const response = await fetch("/api/v1/settings/map", {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch map settings");
            }

            const result = await response.json();
            setSettings(result.data);
        } catch (err) {
            console.error("Error fetching map settings:", err);
            setError("Failed to load map settings");
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!settings) return;

        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found. Please log in first.");
                return;
            }

            const response = await fetch("/api/v1/settings/map", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error("Failed to save map settings");
            }

            const result = await response.json();
            setSettings(result.data);
            setHasChanges(false);
            setSuccessMessage("Map configuration saved successfully!");
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error saving map settings:", err);
            setError("Failed to save map settings");
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = <K extends keyof MapSettings>(
        key: K,
        value: MapSettings[K]
    ) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: value });
        setHasChanges(true);
    };

    const toggleKeyVisibility = (keyName: string) => {
        setShowKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
    };

    const copyToClipboard = async (text: string, keyName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(keyName);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const maskKey = (key: string) => {
        if (!key) return "";
        return key.slice(0, 8) + "••••••••" + key.slice(-4);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Map className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Map Configuration
                    </h1>
                </div>
                <p className="text-gray-500">
                    Configure your map provider and API keys to enable real-time tracking in the dispatch dashboard.
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {settings && (
                <div className="space-y-8">
                    {/* Map Type Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Map Provider
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Map Type Dropdown */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Map Type
                                </label>
                                <select
                                    value={settings.map_type}
                                    onChange={(e) =>
                                        updateSetting("map_type", e.target.value)
                                    }
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700"
                                >
                                    <option value="mappr">Mappr</option>
                                    <option value="google">Google Map</option>
                                </select>

                                {settings.map_type === "mappr" && (
                                    <a
                                        href={settings.mappr_dashboard_url || "https://mappr.io/dashboard"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-sm text-orange-500 hover:text-orange-600"
                                    >
                                        Go To Mappr Dashboard
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>

                            {/* Real Time Tracking Toggle */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Real Time Tracking
                                    <button className="ml-1 text-gray-400 hover:text-gray-600">
                                        <HelpCircle className="w-3.5 h-3.5 inline" />
                                    </button>
                                </label>
                                <div className="flex items-center mt-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateSetting(
                                                "real_time_tracking",
                                                !settings.real_time_tracking
                                            )
                                        }
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            settings.real_time_tracking
                                                ? "bg-blue-600"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                settings.real_time_tracking
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                    <span className="ml-3 text-sm text-gray-600">
                                        {settings.real_time_tracking
                                            ? "Enabled"
                                            : "Disabled"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Keys Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            API Keys
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {settings.map_type === "google"
                                ? "Enter your Google Maps API keys for different platforms."
                                : "Enter your Mappr API keys for different platforms."}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Web Key */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Web Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKeys.web_key ? "text" : "password"}
                                        value={settings.web_key}
                                        onChange={(e) =>
                                            updateSetting("web_key", e.target.value)
                                        }
                                        placeholder="Enter your web API key"
                                        className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 font-mono text-sm"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleKeyVisibility("web_key")}
                                            className="p-1.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showKeys.web_key ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        {settings.web_key && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(settings.web_key, "web_key")
                                                }
                                                className="p-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedKey === "web_key" ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Android Key */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Android Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKeys.android_key ? "text" : "password"}
                                        value={settings.android_key}
                                        onChange={(e) =>
                                            updateSetting("android_key", e.target.value)
                                        }
                                        placeholder="Enter your Android API key"
                                        className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 font-mono text-sm"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleKeyVisibility("android_key")}
                                            className="p-1.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showKeys.android_key ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        {settings.android_key && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        settings.android_key,
                                                        "android_key"
                                                    )
                                                }
                                                className="p-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedKey === "android_key" ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* iOS Key */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    iOS Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKeys.ios_key ? "text" : "password"}
                                        value={settings.ios_key}
                                        onChange={(e) =>
                                            updateSetting("ios_key", e.target.value)
                                        }
                                        placeholder="Enter your iOS API key"
                                        className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 font-mono text-sm"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleKeyVisibility("ios_key")}
                                            className="p-1.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showKeys.ios_key ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        {settings.ios_key && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(settings.ios_key, "ios_key")
                                                }
                                                className="p-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedKey === "ios_key" ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Server Key */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Server Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKeys.server_key ? "text" : "password"}
                                        value={settings.server_key}
                                        onChange={(e) =>
                                            updateSetting("server_key", e.target.value)
                                        }
                                        placeholder="Enter your server API key"
                                        className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 font-mono text-sm"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleKeyVisibility("server_key")}
                                            className="p-1.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showKeys.server_key ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        {settings.server_key && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        settings.server_key,
                                                        "server_key"
                                                    )
                                                }
                                                className="p-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedKey === "server_key" ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Key */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Form Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKeys.form_key ? "text" : "password"}
                                        value={settings.form_key}
                                        onChange={(e) =>
                                            updateSetting("form_key", e.target.value)
                                        }
                                        placeholder="Enter your form API key"
                                        className="w-full px-4 py-3 pr-20 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 font-mono text-sm"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleKeyVisibility("form_key")}
                                            className="p-1.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showKeys.form_key ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        {settings.form_key && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(settings.form_key, "form_key")
                                                }
                                                className="p-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {copiedKey === "form_key" ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                            <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">How to get API keys?</p>
                                <p className="text-blue-600">
                                    {settings.map_type === "google" ? (
                                        <>
                                            Visit the{" "}
                                            <a
                                                href="https://console.cloud.google.com/apis/credentials"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline hover:text-blue-800"
                                            >
                                                Google Cloud Console
                                            </a>{" "}
                                            to create API keys for Maps JavaScript API, Directions API,
                                            and Geocoding API.
                                        </>
                                    ) : (
                                        <>
                                            Visit the{" "}
                                            <a
                                                href="https://mappr.io/dashboard"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline hover:text-blue-800"
                                            >
                                                Mappr Dashboard
                                            </a>{" "}
                                            to generate API keys for your integration.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={saveSettings}
                            disabled={saving || !hasChanges}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                                hasChanges
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Update
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
