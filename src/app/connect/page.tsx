"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Key,
    Loader2,
    CheckCircle2,
    XCircle,
    Plug,
    ArrowRight,
    ShoppingCart,
    Store,
    Globe,
    Code,
    Copy,
    Check,
} from "lucide-react";

interface ConnectionStatus {
    connected: boolean;
    companyName: string | null;
    ordersCount: number;
    ridersCount: number;
}

const platforms = [
    {
        id: "woocommerce",
        name: "WooCommerce / WordPress",
        icon: ShoppingCart,
        color: "from-purple-500 to-purple-600",
        description: "Connect your WordPress store with WooCommerce",
    },
    {
        id: "shopify",
        name: "Shopify",
        icon: Store,
        color: "from-green-500 to-green-600",
        description: "Sync orders from your Shopify store",
    },
    {
        id: "custom",
        name: "Custom / Any Platform",
        icon: Code,
        color: "from-blue-500 to-blue-600",
        description: "Use our REST API with any platform",
    },
    {
        id: "api",
        name: "Direct API",
        icon: Globe,
        color: "from-orange-500 to-orange-600",
        description: "Send orders directly via API calls",
    },
];

export default function ConnectPage() {
    const router = useRouter();
    const [apiKey, setApiKey] = useState("");
    const [testing, setTesting] = useState(false);
    const [status, setStatus] = useState<ConnectionStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    // Check for existing API key on mount
    useEffect(() => {
        const savedKey = localStorage.getItem("api_key");
        if (savedKey) {
            setApiKey(savedKey);
            testConnection(savedKey);
        }
    }, []);

    const testConnection = async (key: string) => {
        setTesting(true);
        setError(null);

        try {
            // Test company endpoint
            const companyRes = await fetch("/api/v1/company", {
                headers: { Authorization: `Bearer ${key}` },
            });

            if (!companyRes.ok) {
                throw new Error("Invalid API key");
            }

            const companyData = await companyRes.json();

            // Test orders endpoint
            const ordersRes = await fetch("/api/v1/orders", {
                headers: { Authorization: `Bearer ${key}` },
            });
            const ordersData = await ordersRes.json();

            // Test riders endpoint
            const ridersRes = await fetch("/api/v1/riders", {
                headers: { Authorization: `Bearer ${key}` },
            });
            const ridersData = await ridersRes.json();

            // Save API key
            localStorage.setItem("api_key", key);

            setStatus({
                connected: true,
                companyName: companyData.data.name,
                ordersCount: ordersData.data?.length || 0,
                ridersCount: ridersData.data?.length || 0,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Connection failed");
            setStatus(null);
        } finally {
            setTesting(false);
        }
    };

    const handleConnect = () => {
        if (!apiKey.trim()) {
            setError("Please enter an API key");
            return;
        }
        testConnection(apiKey.trim());
    };

    const goToDashboard = () => {
        router.push("/dashboard/dispatch");
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                        <Plug className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Connect Your Store
                    </h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Enter your API key to connect your e-commerce platform and start managing deliveries.
                    </p>
                </div>

                {/* API Key Input */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" />
                        API Key
                    </h2>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key (e.g., tk_xxxxxxxx...)"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                        />
                        <button
                            onClick={handleConnect}
                            disabled={testing || !apiKey.trim()}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {testing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plug className="w-5 h-5" />
                            )}
                            {testing ? "Testing..." : "Connect"}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success */}
                    {status?.connected && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-center gap-3 text-emerald-700 mb-3">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Connected to {status.companyName}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{status.ordersCount}</div>
                                    <div className="text-sm text-gray-500">Orders</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{status.ridersCount}</div>
                                    <div className="text-sm text-gray-500">Riders</div>
                                </div>
                            </div>
                            <button
                                onClick={goToDashboard}
                                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                Go to Dashboard
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Platform Selection */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Choose Your Platform
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {platforms.map((platform) => {
                            const Icon = platform.icon;
                            const isSelected = selectedPlatform === platform.id;
                            return (
                                <button
                                    key={platform.id}
                                    onClick={() => setSelectedPlatform(isSelected ? null : platform.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                            ? "border-indigo-500 bg-indigo-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-gray-900">{platform.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{platform.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Integration Instructions */}
                {selectedPlatform && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Integration Setup
                        </h3>

                        {selectedPlatform === "woocommerce" && (
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-xl">
                                    <h4 className="font-medium text-purple-900 mb-2">Webhook URL</h4>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                                            {baseUrl}/api/webhooks/woocommerce
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(`${baseUrl}/api/webhooks/woocommerce`, "woo")}
                                            className="p-2 hover:bg-purple-100 rounded-lg"
                                        >
                                            {copied === "woo" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    <li>Go to <strong>WooCommerce → Settings → Advanced → Webhooks</strong></li>
                                    <li>Click <strong>Add Webhook</strong></li>
                                    <li>Set Topic to <strong>Order created</strong></li>
                                    <li>Paste the Webhook URL above</li>
                                    <li>Add header: <code className="bg-gray-100 px-1 rounded">x-api-key: YOUR_API_KEY</code></li>
                                    <li>Save and you're done! ✨</li>
                                </ol>
                            </div>
                        )}

                        {selectedPlatform === "shopify" && (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-xl">
                                    <h4 className="font-medium text-green-900 mb-2">Webhook URL</h4>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                                            {baseUrl}/api/webhooks/shopify
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(`${baseUrl}/api/webhooks/shopify`, "shopify")}
                                            className="p-2 hover:bg-green-100 rounded-lg"
                                        >
                                            {copied === "shopify" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    <li>Go to <strong>Settings → Notifications → Webhooks</strong></li>
                                    <li>Click <strong>Create webhook</strong></li>
                                    <li>Select event: <strong>Order creation</strong></li>
                                    <li>Paste the Webhook URL above</li>
                                    <li>Set format to <strong>JSON</strong></li>
                                    <li>Save! Orders will sync automatically 🚀</li>
                                </ol>
                            </div>
                        )}

                        {(selectedPlatform === "custom" || selectedPlatform === "api") && (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <h4 className="font-medium text-blue-900 mb-2">API Endpoint</h4>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
                                            POST {baseUrl}/api/v1/orders
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(`${baseUrl}/api/v1/orders`, "api")}
                                            className="p-2 hover:bg-blue-100 rounded-lg"
                                        >
                                            {copied === "api" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                                    <pre className="text-sm text-gray-100">
                                        {`curl -X POST ${baseUrl}/api/v1/orders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "John Doe",
    "customer_phone": "+1555123456",
    "delivery_address": "123 Main St",
    "order_description": "2x Product A"
  }'`}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
