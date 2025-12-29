"use client";

import { useState, useEffect } from "react";
import {
    Smartphone,
    Loader2,
    Save,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

interface AgentAppSettings {
    hide_cancel_button: boolean;
    require_signature: boolean;
    require_photo: boolean;
    show_arrived_button: boolean;
    enable_navigation: boolean;
    auto_accept_tasks: boolean;
    show_customer_phone: boolean;
    enable_offline_mode: boolean;
    custom_arrived_message: string;
    custom_completed_message: string;
}

const defaultSettings: AgentAppSettings = {
    hide_cancel_button: false,
    require_signature: true,
    require_photo: false,
    show_arrived_button: true,
    enable_navigation: true,
    auto_accept_tasks: false,
    show_customer_phone: true,
    enable_offline_mode: true,
    custom_arrived_message: "I have arrived at the location",
    custom_completed_message: "Delivery completed successfully!",
};

const settingsConfig = [
    { key: 'hide_cancel_button', label: 'Hide Cancel Button', description: 'Prevent agents from cancelling tasks' },
    { key: 'require_signature', label: 'Require Signature', description: 'Agent must collect signature on delivery' },
    { key: 'require_photo', label: 'Require Photo Proof', description: 'Agent must take photo on completion' },
    { key: 'show_arrived_button', label: 'Show Arrived Button', description: 'Enable agents to mark arrival' },
    { key: 'enable_navigation', label: 'Enable Navigation', description: 'Allow in-app navigation to location' },
    { key: 'auto_accept_tasks', label: 'Auto Accept Tasks', description: 'Automatically accept assigned tasks' },
    { key: 'show_customer_phone', label: 'Show Customer Phone', description: 'Display customer phone number' },
    { key: 'enable_offline_mode', label: 'Enable Offline Mode', description: 'Allow app to work without internet' },
];

export default function AgentAppPage() {
    const [settings, setSettings] = useState<AgentAppSettings>(defaultSettings);
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // In real app, fetch from API
        setLoading(false);
    }, []);

    const toggleSetting = (key: keyof AgentAppSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        setHasChanges(true);
    };

    const updateMessage = (key: keyof AgentAppSettings, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveSettings = () => {
        // In real app, save to API
        setHasChanges(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-indigo-600" />
                    Agent App Settings
                </h1>
                <p className="text-gray-500 mt-1">
                    Configure how the mobile app behaves for your delivery agents.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Settings List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">App Behavior</h2>

                    {settingsConfig.map((config) => {
                        const key = config.key as keyof AgentAppSettings;
                        const isEnabled = settings[key] as boolean;

                        return (
                            <div
                                key={config.key}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-900">{config.label}</h3>
                                    <p className="text-sm text-gray-500">{config.description}</p>
                                </div>
                                <button
                                    onClick={() => toggleSetting(key)}
                                    className="flex-shrink-0"
                                >
                                    {isEnabled ? (
                                        <ToggleRight className="w-10 h-10 text-indigo-600" />
                                    ) : (
                                        <ToggleLeft className="w-10 h-10 text-gray-300" />
                                    )}
                                </button>
                            </div>
                        );
                    })}

                    {/* Custom Messages */}
                    <div className="mt-8 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Custom Messages</h2>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Arrived Message
                            </label>
                            <textarea
                                value={settings.custom_arrived_message}
                                onChange={(e) => updateMessage('custom_arrived_message', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none"
                                rows={2}
                            />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Completed Message
                            </label>
                            <textarea
                                value={settings.custom_completed_message}
                                onChange={(e) => updateMessage('custom_completed_message', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none"
                                rows={2}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Preview */}
                <div className="lg:sticky lg:top-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">App Preview</h2>

                    <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl max-w-[280px] mx-auto">
                        {/* Phone Frame */}
                        <div className="bg-white rounded-[2rem] overflow-hidden">
                            {/* Status Bar */}
                            <div className="bg-indigo-600 px-4 py-2 flex justify-between items-center text-white text-xs">
                                <span>9:41</span>
                                <div className="flex items-center gap-1">
                                    <span>●●●●</span>
                                    <span>📶</span>
                                    <span>🔋</span>
                                </div>
                            </div>

                            {/* App Header */}
                            <div className="bg-indigo-600 px-4 py-4 text-white">
                                <h3 className="font-semibold">Current Task</h3>
                                <p className="text-indigo-200 text-sm">#12345</p>
                            </div>

                            {/* Task Details */}
                            <div className="p-4 space-y-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase">Customer</p>
                                    <p className="font-medium text-gray-900">John Doe</p>
                                    {settings.show_customer_phone && (
                                        <p className="text-sm text-indigo-600">+1 555-0123</p>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 uppercase">Delivery Address</p>
                                    <p className="text-sm text-gray-700">123 Main Street, Apt 4B</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-2">
                                    {settings.show_arrived_button && (
                                        <button className="w-full py-3 bg-emerald-500 text-white rounded-lg font-medium text-sm">
                                            Mark as Arrived
                                        </button>
                                    )}

                                    {settings.enable_navigation && (
                                        <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium text-sm">
                                            Navigate
                                        </button>
                                    )}

                                    <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm">
                                        Complete Delivery
                                    </button>

                                    {!settings.hide_cancel_button && (
                                        <button className="w-full py-2 text-red-600 text-sm">
                                            Cancel Task
                                        </button>
                                    )}
                                </div>

                                {/* Requirements */}
                                {(settings.require_signature || settings.require_photo) && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Required on completion:</p>
                                        <div className="flex gap-2">
                                            {settings.require_signature && (
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                                    ✍️ Signature
                                                </span>
                                            )}
                                            {settings.require_photo && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                    📷 Photo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Save Button */}
            {hasChanges && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={saveSettings}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}
