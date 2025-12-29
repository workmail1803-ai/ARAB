"use client";

import { useState, useEffect } from "react";
import {
    Palette,
    Loader2,
    Save,
    RotateCcw,
} from "lucide-react";

interface ThemeSettings {
    navbar_color: string;
    button_color: string;
    menu_hover_color: string;
}

const defaultTheme: ThemeSettings = {
    navbar_color: "#4F46E5",
    button_color: "#4F46E5",
    menu_hover_color: "#EEF2FF",
};

export default function ThemeSettingsPage() {
    const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchTheme();
    }, []);

    const fetchTheme = async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setLoading(false);
                return;
            }

            const response = await fetch("/api/v1/settings", {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setTheme({
                        navbar_color: data.data.theme_navbar_color || defaultTheme.navbar_color,
                        button_color: data.data.theme_button_color || defaultTheme.button_color,
                        menu_hover_color: data.data.theme_menu_hover_color || defaultTheme.menu_hover_color,
                    });
                }
            }
        } catch {
            // Use defaults
        } finally {
            setLoading(false);
        }
    };

    const updateTheme = (key: keyof ThemeSettings, value: string) => {
        setTheme(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveTheme = async () => {
        setSaving(true);
        try {
            const apiKey = localStorage.getItem("api_key");
            await fetch("/api/v1/settings", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    theme_navbar_color: theme.navbar_color,
                    theme_button_color: theme.button_color,
                    theme_menu_hover_color: theme.menu_hover_color,
                }),
            });
            setHasChanges(false);
        } catch {
            // Handle error
        } finally {
            setSaving(false);
        }
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
        setHasChanges(true);
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Palette className="w-6 h-6 text-indigo-600" />
                        Theme Settings
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Customize the look and feel of your dashboard.
                    </p>
                </div>
                <button
                    onClick={resetTheme}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Color Pickers */}
                <div className="space-y-6">
                    {/* Navbar Color */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Navbar Color
                        </label>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-xl border-2 border-gray-200 cursor-pointer overflow-hidden"
                                style={{ backgroundColor: theme.navbar_color }}
                            >
                                <input
                                    type="color"
                                    value={theme.navbar_color}
                                    onChange={(e) => updateTheme("navbar_color", e.target.value)}
                                    className="w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={theme.navbar_color}
                                onChange={(e) => updateTheme("navbar_color", e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                            />
                        </div>
                    </div>

                    {/* Button Color */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Button Color
                        </label>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-xl border-2 border-gray-200 cursor-pointer overflow-hidden"
                                style={{ backgroundColor: theme.button_color }}
                            >
                                <input
                                    type="color"
                                    value={theme.button_color}
                                    onChange={(e) => updateTheme("button_color", e.target.value)}
                                    className="w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={theme.button_color}
                                onChange={(e) => updateTheme("button_color", e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                            />
                        </div>
                    </div>

                    {/* Menu Hover Color */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Menu Hover Color
                        </label>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-xl border-2 border-gray-200 cursor-pointer overflow-hidden"
                                style={{ backgroundColor: theme.menu_hover_color }}
                            >
                                <input
                                    type="color"
                                    value={theme.menu_hover_color}
                                    onChange={(e) => updateTheme("menu_hover_color", e.target.value)}
                                    className="w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <input
                                type="text"
                                value={theme.menu_hover_color}
                                onChange={(e) => updateTheme("menu_hover_color", e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div>
                    <h3 className="text-sm font-medium text-gray-600 uppercase mb-3">Live Preview</h3>
                    <div className="bg-gray-100 rounded-xl p-4 shadow-inner">
                        {/* Mini Dashboard Preview */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Navbar */}
                            <div
                                className="h-12 flex items-center px-4 text-white"
                                style={{ backgroundColor: theme.navbar_color }}
                            >
                                <span className="font-semibold">Dashboard</span>
                                <div className="ml-auto flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full" />
                                </div>
                            </div>

                            <div className="flex">
                                {/* Sidebar */}
                                <div className="w-32 bg-gray-50 border-r border-gray-200 p-2">
                                    <div
                                        className="px-3 py-2 rounded-lg text-sm mb-1"
                                        style={{
                                            backgroundColor: theme.menu_hover_color,
                                            color: theme.navbar_color
                                        }}
                                    >
                                        Dashboard
                                    </div>
                                    <div className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg mb-1">
                                        Tasks
                                    </div>
                                    <div className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg">
                                        Agents
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 h-48">
                                    <div className="bg-gray-100 rounded-lg h-20 mb-3" />
                                    <button
                                        className="px-4 py-2 text-white text-sm rounded-lg"
                                        style={{ backgroundColor: theme.button_color }}
                                    >
                                        Create Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Save Button */}
            {hasChanges && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={saveTheme}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Saving..." : "Save Theme"}
                    </button>
                </div>
            )}
        </div>
    );
}
