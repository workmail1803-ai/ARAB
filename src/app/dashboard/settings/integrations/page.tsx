"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Globe,
    Plus,
    Trash2,
    RefreshCw,
    Settings,
    CheckCircle,
    XCircle,
    AlertCircle,
    ExternalLink,
    Loader2,
    Plug,
    ShoppingCart,
    Store,
    Code,
} from "lucide-react";

interface Integration {
    id: string;
    integration_type: string;
    name: string;
    api_url: string;
    api_key: string | null;
    is_active: boolean;
    sync_riders: boolean;
    sync_orders: boolean;
    sync_customers: boolean;
    sync_interval_minutes: number;
    last_sync_at: string | null;
    last_sync_status: string | null;
    total_riders_synced: number;
    total_orders_synced: number;
    total_customers_synced: number;
    created_at: string;
}

const integrationTypes = [
    {
        id: "woocommerce",
        name: "WooCommerce",
        icon: ShoppingCart,
        description: "WordPress + WooCommerce stores",
        color: "bg-purple-500",
    },
    {
        id: "shopify",
        name: "Shopify",
        icon: Store,
        description: "Shopify e-commerce stores",
        color: "bg-green-500",
    },
    {
        id: "wordpress",
        name: "WordPress",
        icon: Globe,
        description: "Custom WordPress REST API",
        color: "bg-blue-500",
    },
    {
        id: "custom",
        name: "Custom API",
        icon: Code,
        description: "Any REST API endpoint",
        color: "bg-gray-500",
    },
];

export default function IntegrationsSettingsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        integration_type: "woocommerce",
        name: "",
        api_url: "",
        api_key: "",
        api_secret: "",
        sync_riders: true,
        sync_orders: true,
        sync_customers: true,
        sync_interval_minutes: 5,
        riders_endpoint: "",
        orders_endpoint: "",
        customers_endpoint: "",
    });

    const fetchIntegrations = useCallback(async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) return;

            const response = await fetch("/api/v1/settings/integrations", {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (response.ok) {
                const data = await response.json();
                setIntegrations(data.integrations || []);
            }
        } catch (e) {
            console.error("Failed to fetch integrations:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    const handleAddIntegration = async () => {
        try {
            setError(null);
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) return;

            const response = await fetch("/api/v1/settings/integrations", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create integration");
                return;
            }

            setShowAddModal(false);
            setFormData({
                integration_type: "woocommerce",
                name: "",
                api_url: "",
                api_key: "",
                api_secret: "",
                sync_riders: true,
                sync_orders: true,
                sync_customers: true,
                sync_interval_minutes: 5,
                riders_endpoint: "",
                orders_endpoint: "",
                customers_endpoint: "",
            });
            fetchIntegrations();
        } catch (e) {
            setError("Failed to create integration");
        }
    };

    const handleSync = async (integrationId: string) => {
        try {
            setSyncing(integrationId);
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) return;

            const response = await fetch(
                `/api/v1/settings/integrations/${integrationId}/sync`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${apiKey}` },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(`Sync failed: ${data.error}`);
            } else {
                alert(
                    `Sync complete!\n` +
                        `Riders: ${data.results.riders.created} new, ${data.results.riders.updated} updated\n` +
                        `Orders: ${data.results.orders.created} new, ${data.results.orders.updated} updated\n` +
                        `Customers: ${data.results.customers.created} new, ${data.results.customers.updated} updated`
                );
                fetchIntegrations();
            }
        } catch (e) {
            alert("Sync failed");
        } finally {
            setSyncing(null);
        }
    };

    const handleDelete = async (integrationId: string) => {
        if (!confirm("Are you sure you want to delete this integration?")) return;

        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) return;

            await fetch(`/api/v1/settings/integrations/${integrationId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            fetchIntegrations();
        } catch (e) {
            alert("Failed to delete integration");
        }
    };

    const handleToggleActive = async (integration: Integration) => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) return;

            await fetch(`/api/v1/settings/integrations/${integration.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_active: !integration.is_active }),
            });

            fetchIntegrations();
        } catch (e) {
            alert("Failed to update integration");
        }
    };

    const getTypeIcon = (type: string) => {
        const found = integrationTypes.find((t) => t.id === type);
        return found?.icon || Globe;
    };

    const getTypeColor = (type: string) => {
        const found = integrationTypes.find((t) => t.id === type);
        return found?.color || "bg-gray-500";
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        External Integrations
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Connect your website to automatically sync riders, orders, and
                        customers
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Integration
                </button>
            </div>

            {/* Integrations List */}
            {integrations.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                    <Plug className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Integrations Yet
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Connect your WordPress, WooCommerce, Shopify, or custom API to
                        automatically sync your riders and orders.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Your First Integration
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {integrations.map((integration) => {
                        const Icon = getTypeIcon(integration.integration_type);
                        return (
                            <div
                                key={integration.id}
                                className="bg-white rounded-xl border p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`w-12 h-12 ${getTypeColor(
                                                integration.integration_type
                                            )} rounded-lg flex items-center justify-center`}
                                        >
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {integration.name}
                                                </h3>
                                                {integration.is_active ? (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {integration.api_url}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-sm">
                                                {integration.sync_riders && (
                                                    <span className="text-gray-600">
                                                        👤 {integration.total_riders_synced} riders
                                                    </span>
                                                )}
                                                {integration.sync_orders && (
                                                    <span className="text-gray-600">
                                                        📦 {integration.total_orders_synced} orders
                                                    </span>
                                                )}
                                                {integration.sync_customers && (
                                                    <span className="text-gray-600">
                                                        🏠 {integration.total_customers_synced} customers
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSync(integration.id)}
                                            disabled={syncing === integration.id}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Sync Now"
                                        >
                                            <RefreshCw
                                                className={`w-5 h-5 ${
                                                    syncing === integration.id ? "animate-spin" : ""
                                                }`}
                                            />
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(integration)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                integration.is_active
                                                    ? "text-green-600 hover:bg-green-50"
                                                    : "text-gray-400 hover:bg-gray-50"
                                            }`}
                                            title={integration.is_active ? "Disable" : "Enable"}
                                        >
                                            {integration.is_active ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <XCircle className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(integration.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Last Sync Status */}
                                {integration.last_sync_at && (
                                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
                                        {integration.last_sync_status === "success" ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : integration.last_sync_status === "failed" ? (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                                        )}
                                        <span className="text-gray-600">
                                            Last sync:{" "}
                                            {new Date(integration.last_sync_at).toLocaleString()}
                                        </span>
                                        {integration.last_sync_status && (
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs ${
                                                    integration.last_sync_status === "success"
                                                        ? "bg-green-100 text-green-700"
                                                        : integration.last_sync_status === "failed"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {integration.last_sync_status}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Integration Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                Add External Integration
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Connect your external platform to sync data automatically
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Integration Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Platform Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {integrationTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() =>
                                                    setFormData((f) => ({
                                                        ...f,
                                                        integration_type: type.id,
                                                    }))
                                                }
                                                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                                                    formData.integration_type === type.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}
                                                    >
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {type.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {type.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Integration Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((f) => ({ ...f, name: e.target.value }))
                                        }
                                        placeholder="My WordPress Store"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.api_url}
                                        onChange={(e) =>
                                            setFormData((f) => ({ ...f, api_url: e.target.value }))
                                        }
                                        placeholder="https://mystore.com"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* API Credentials */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.integration_type === "woocommerce"
                                            ? "Consumer Key"
                                            : "API Key"}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.api_key}
                                        onChange={(e) =>
                                            setFormData((f) => ({ ...f, api_key: e.target.value }))
                                        }
                                        placeholder="ck_xxxxxxxxxxxxxxxx"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {formData.integration_type === "woocommerce"
                                            ? "Consumer Secret"
                                            : "API Secret"}
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.api_secret}
                                        onChange={(e) =>
                                            setFormData((f) => ({
                                                ...f,
                                                api_secret: e.target.value,
                                            }))
                                        }
                                        placeholder="cs_xxxxxxxxxxxxxxxx"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Sync Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What to Sync
                                </label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.sync_riders}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    sync_riders: e.target.checked,
                                                }))
                                            }
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Riders/Drivers</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.sync_orders}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    sync_orders: e.target.checked,
                                                }))
                                            }
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Orders</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.sync_customers}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    sync_customers: e.target.checked,
                                                }))
                                            }
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Customers</span>
                                    </label>
                                </div>
                            </div>

                            {/* Custom Endpoints (for advanced users) */}
                            {formData.integration_type === "custom" && (
                                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm font-medium text-gray-700">
                                        Custom API Endpoints
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Riders Endpoint
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.riders_endpoint}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    riders_endpoint: e.target.value,
                                                }))
                                            }
                                            placeholder="/api/riders"
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Orders Endpoint
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.orders_endpoint}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    orders_endpoint: e.target.value,
                                                }))
                                            }
                                            placeholder="/api/orders"
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Customers Endpoint
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customers_endpoint}
                                            onChange={(e) =>
                                                setFormData((f) => ({
                                                    ...f,
                                                    customers_endpoint: e.target.value,
                                                }))
                                            }
                                            placeholder="/api/customers"
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* WooCommerce Instructions */}
                            {formData.integration_type === "woocommerce" && (
                                <div className="p-4 bg-purple-50 rounded-lg text-sm">
                                    <div className="font-medium text-purple-900 mb-2">
                                        📋 WooCommerce Setup Instructions
                                    </div>
                                    <ol className="list-decimal list-inside space-y-1 text-purple-800">
                                        <li>Go to WooCommerce → Settings → Advanced → REST API</li>
                                        <li>Click "Add key" and create a new API key</li>
                                        <li>Set permissions to "Read" or "Read/Write"</li>
                                        <li>Copy the Consumer Key and Consumer Secret here</li>
                                    </ol>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddIntegration}
                                disabled={!formData.name || !formData.api_url}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Add Integration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
