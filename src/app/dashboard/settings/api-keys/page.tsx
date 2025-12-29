"use client";

import { useState, useEffect } from "react";
import {
    Copy,
    Check,
    Plus,
    HelpCircle,
    MoreHorizontal,
    Loader2,
    ExternalLink,
    ShoppingCart,
    Trash2,
    Save,
    Bell,
} from "lucide-react";

interface CompanyData {
    id: string;
    name: string;
    api_key: string;
    webhook_secret: string | null;
    settings?: {
        callback_url?: string;
    };
}

export default function ApiKeysPage() {
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [v2Keys, setV2Keys] = useState<{ id: string; key: string; created: string }[]>([]);
    const [showMenu, setShowMenu] = useState<string | null>(null);
    const [callbackUrl, setCallbackUrl] = useState("");
    const [savingCallback, setSavingCallback] = useState(false);
    const [callbackSaved, setCallbackSaved] = useState(false);

    // Get base URL for webhook endpoints
    const baseUrl = typeof window !== "undefined"
        ? window.location.origin
        : "https://your-domain.com";

    // Fetch company data on mount
    useEffect(() => {
        fetchCompanyData();
    }, []);

    const fetchCompanyData = async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found in localStorage. Please log in first.");
                setLoading(false);
                return;
            }

            const response = await fetch("/api/v1/company", {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch company data");
            }

            const data = await response.json();
            setCompanyData(data.data);
            setCallbackUrl(data.data?.settings?.callback_url || "");
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const saveCallbackUrl = async () => {
        setSavingCallback(true);
        try {
            const apiKey = localStorage.getItem("api_key");
            const response = await fetch("/api/v1/company", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    settings: {
                        ...companyData?.settings,
                        callback_url: callbackUrl,
                    },
                }),
            });

            if (response.ok) {
                setCallbackSaved(true);
                setTimeout(() => setCallbackSaved(false), 2000);
            }
        } catch (err) {
            console.error("Failed to save callback URL:", err);
        } finally {
            setSavingCallback(false);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const generateV2Key = () => {
        const newKey = {
            id: crypto.randomUUID(),
            key: `tk_v2_${Math.random().toString(36).substring(2, 15)}`,
            created: new Date().toLocaleString(),
        };
        setV2Keys([...v2Keys, newKey]);
    };

    const deleteV2Key = (id: string) => {
        setV2Keys(v2Keys.filter(k => k.id !== id));
        setShowMenu(null);
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
                <h3 className="font-semibold mb-2">Error Loading API Keys</h3>
                <p className="text-sm">{error}</p>
                <button
                    onClick={fetchCompanyData}
                    className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            {/* V1 API Section - Exactly like Tookan */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Access Token</h2>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            V1 API ACCESS TOKEN
                        </label>
                        <button
                            onClick={() => copyToClipboard(companyData?.api_key || "", "v1_token")}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                            {copiedField === "v1_token" ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Copied
                                </>
                            ) : (
                                "Copy"
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-gray-900 font-mono break-all select-all">
                        {companyData?.api_key}
                    </p>
                </div>
            </section>

            {/* V2 API Keys Section - Like Tookan */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        V2 API KEYS
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={generateV2Key}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Generate Key
                        </button>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </div>
                </div>

                {v2Keys.length === 0 ? (
                    <p className="text-sm text-gray-500">No V2 API keys generated yet.</p>
                ) : (
                    <div className="space-y-2">
                        {v2Keys.map((key) => (
                            <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-mono text-gray-900">{key.key}</p>
                                    <p className="text-xs text-gray-400 mt-1">Created: {key.created}</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(showMenu === key.id ? null : key.id)}
                                        className="p-1 hover:bg-gray-200 rounded"
                                    >
                                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                    </button>
                                    {showMenu === key.id && (
                                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                            <button
                                                onClick={() => copyToClipboard(key.key, key.id)}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </button>
                                            <button
                                                onClick={() => deleteV2Key(key.id)}
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Revoke
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Documentation Note - Like Tookan */}
            <p className="text-sm text-gray-500 mb-8">
                You can refer to the v2 API documentation{" "}
                <a href="/api/docs" className="text-indigo-600 hover:underline">here</a>.
                Keys are used to authenticate all v2 API requests.
            </p>

            {/* Webhook Endpoints Section - Additional feature beyond Tookan */}
            <section className="border-t border-gray-200 pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Endpoints</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Configure your external systems to send data to these URLs.
                </p>

                <div className="space-y-4">
                    {/* WooCommerce Endpoint */}
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">WooCommerce / WordPress</h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                    {baseUrl}/api/webhooks/woocommerce
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => copyToClipboard(`${baseUrl}/api/webhooks/woocommerce`, "woo_url")}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                            {copiedField === "woo_url" ? "Copied" : "Copy"}
                        </button>
                    </div>

                    {/* General Webhook */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">General Webhook</h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                    {baseUrl}/api/webhooks
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => copyToClipboard(`${baseUrl}/api/webhooks`, "general_url")}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            {copiedField === "general_url" ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Outbound Webhook Callback - Send updates BACK to store */}
            <section className="border-t border-gray-200 pt-8 mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    Outbound Webhook Callback
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    When order status changes (assigned, picked up, delivered, etc.), we&apos;ll send a webhook notification to your store.
                </p>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Store&apos;s Callback URL
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={callbackUrl}
                            onChange={(e) => setCallbackUrl(e.target.value)}
                            placeholder="https://yourstore.com/api/tookan-callback"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                            onClick={saveCallbackUrl}
                            disabled={savingCallback}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {savingCallback ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : callbackSaved ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {callbackSaved ? "Saved!" : "Save"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        We&apos;ll send POST requests with order data and a signature header for verification.
                    </p>

                    {/* Events List */}
                    <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-xs font-medium text-gray-600 mb-2">Events you&apos;ll receive:</p>
                        <div className="flex flex-wrap gap-2">
                            {['order.created', 'order.assigned', 'order.picked_up', 'order.delivered', 'order.cancelled'].map(event => (
                                <span key={event} className="px-2 py-1 bg-white text-xs rounded border border-green-200 text-gray-700">
                                    {event}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* WordPress Setup Guide - Collapsible */}
            <section className="border-t border-gray-200 pt-8 mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                    WordPress / WooCommerce Setup
                </h2>

                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                    <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                        <li>
                            Go to <code className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-800">WooCommerce → Settings → Advanced → Webhooks</code>
                        </li>
                        <li>
                            Click <strong>"Add Webhook"</strong> and set:
                            <ul className="list-disc list-inside ml-4 mt-2 text-gray-600">
                                <li>Name: <span className="text-gray-900">Fleet Management</span></li>
                                <li>Topic: <span className="text-gray-900">Order created</span></li>
                                <li>Delivery URL: <span className="text-indigo-600">(copy from above)</span></li>
                            </ul>
                        </li>
                        <li>
                            Add header: <code className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-800">x-api-key: YOUR_API_KEY</code>
                        </li>
                        <li>
                            Save and your orders will sync automatically! ✨
                        </li>
                    </ol>
                </div>
            </section>
        </div>
    );
}
