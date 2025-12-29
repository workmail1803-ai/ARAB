"use client";

import { useState } from "react";
import {
    X,
    MapPin,
    Phone,
    Mail,
    User,
    Clock,
    ChevronDown,
    ChevronUp,
    Package,
    Truck,
    Loader2,
    Plus,
} from "lucide-react";
import { useRiders, Rider } from "@/hooks/useRiders";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    // Pickup Info
    pickupName: string;
    pickupPhone: string;
    pickupEmail: string;
    pickupAddress: string;
    pickupBefore: string;
    // Delivery Info
    deliveryName: string;
    deliveryPhone: string;
    deliveryEmail: string;
    deliveryAddress: string;
    deliveryBefore: string;
    // Order Info
    orderId: string;
    items: string;
    total: string;
    notes: string;
    // Assignment
    riderId: string;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
    const [showPickup, setShowPickup] = useState(true);
    const [showDelivery, setShowDelivery] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { riders } = useRiders();
    const availableRiders = riders.filter(r => r.status !== "offline");

    const [formData, setFormData] = useState<FormData>({
        pickupName: "",
        pickupPhone: "",
        pickupEmail: "",
        pickupAddress: "",
        pickupBefore: "",
        deliveryName: "",
        deliveryPhone: "",
        deliveryEmail: "",
        deliveryAddress: "",
        deliveryBefore: "",
        orderId: "",
        items: "",
        total: "",
        notes: "",
        riderId: "",
    });

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                throw new Error("No API key found. Please login first.");
            }

            // Parse items
            const itemsList = formData.items.split(",").map(item => ({
                name: item.trim(),
                quantity: 1,
            })).filter(item => item.name);

            const orderData = {
                customer_name: formData.deliveryName || formData.pickupName,
                customer_phone: formData.deliveryPhone || formData.pickupPhone,
                customer_email: formData.deliveryEmail || formData.pickupEmail || undefined,
                delivery_address: formData.deliveryAddress,
                pickup_address: formData.pickupAddress || undefined,
                items: itemsList.length > 0 ? itemsList : [{ name: "Delivery", quantity: 1 }],
                total: parseFloat(formData.total) || 0,
                notes: formData.notes || undefined,
                scheduled_time: formData.deliveryBefore || undefined,
                rider_id: formData.riderId || undefined,
                external_id: formData.orderId || undefined,
            };

            const response = await fetch("/api/v1/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create task");
            }

            // Success!
            onSuccess();
            onClose();

            // Reset form
            setFormData({
                pickupName: "",
                pickupPhone: "",
                pickupEmail: "",
                pickupAddress: "",
                pickupBefore: "",
                deliveryName: "",
                deliveryPhone: "",
                deliveryEmail: "",
                deliveryAddress: "",
                deliveryBefore: "",
                orderId: "",
                items: "",
                total: "",
                notes: "",
                riderId: "",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 md:inset-10 lg:inset-20 bg-white rounded-lg shadow-2xl z-50 flex overflow-hidden">
                {/* Left Side: Form */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#1e2a3a]">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            New Task
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Pickup Section */}
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setShowPickup(!showPickup)}
                                className="flex items-center justify-between w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">Pickup Details</span>
                                </div>
                                {showPickup ? (
                                    <ChevronUp className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-blue-600" />
                                )}
                            </button>

                            {showPickup && (
                                <div className="mt-3 space-y-3 pl-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField
                                            icon={<User className="w-4 h-4" />}
                                            placeholder="Customer Name"
                                            value={formData.pickupName}
                                            onChange={(v) => handleChange("pickupName", v)}
                                        />
                                        <InputField
                                            icon={<Phone className="w-4 h-4" />}
                                            placeholder="Phone Number"
                                            value={formData.pickupPhone}
                                            onChange={(v) => handleChange("pickupPhone", v)}
                                        />
                                    </div>
                                    <InputField
                                        icon={<Mail className="w-4 h-4" />}
                                        placeholder="Email (optional)"
                                        value={formData.pickupEmail}
                                        onChange={(v) => handleChange("pickupEmail", v)}
                                    />
                                    <InputField
                                        icon={<MapPin className="w-4 h-4" />}
                                        placeholder="Pickup Address"
                                        value={formData.pickupAddress}
                                        onChange={(v) => handleChange("pickupAddress", v)}
                                    />
                                    <InputField
                                        icon={<Clock className="w-4 h-4" />}
                                        type="datetime-local"
                                        placeholder="Pickup Before"
                                        value={formData.pickupBefore}
                                        onChange={(v) => handleChange("pickupBefore", v)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Delivery Section */}
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setShowDelivery(!showDelivery)}
                                className="flex items-center justify-between w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-green-900">Delivery Details</span>
                                    <span className="text-xs text-red-500">*Required</span>
                                </div>
                                {showDelivery ? (
                                    <ChevronUp className="w-5 h-5 text-green-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-green-600" />
                                )}
                            </button>

                            {showDelivery && (
                                <div className="mt-3 space-y-3 pl-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField
                                            icon={<User className="w-4 h-4" />}
                                            placeholder="Customer Name *"
                                            value={formData.deliveryName}
                                            onChange={(v) => handleChange("deliveryName", v)}
                                            required
                                        />
                                        <InputField
                                            icon={<Phone className="w-4 h-4" />}
                                            placeholder="Phone Number *"
                                            value={formData.deliveryPhone}
                                            onChange={(v) => handleChange("deliveryPhone", v)}
                                            required
                                        />
                                    </div>
                                    <InputField
                                        icon={<Mail className="w-4 h-4" />}
                                        placeholder="Email (optional)"
                                        value={formData.deliveryEmail}
                                        onChange={(v) => handleChange("deliveryEmail", v)}
                                    />
                                    <InputField
                                        icon={<MapPin className="w-4 h-4" />}
                                        placeholder="Delivery Address *"
                                        value={formData.deliveryAddress}
                                        onChange={(v) => handleChange("deliveryAddress", v)}
                                        required
                                    />
                                    <InputField
                                        icon={<Clock className="w-4 h-4" />}
                                        type="datetime-local"
                                        placeholder="Delivery Before"
                                        value={formData.deliveryBefore}
                                        onChange={(v) => handleChange("deliveryBefore", v)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Order Details Section */}
                        <div className="mb-6 space-y-3">
                            <h3 className="font-medium text-gray-700">Order Details</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    placeholder="Order ID (optional)"
                                    value={formData.orderId}
                                    onChange={(v) => handleChange("orderId", v)}
                                />
                                <InputField
                                    placeholder="Total Amount"
                                    type="number"
                                    value={formData.total}
                                    onChange={(v) => handleChange("total", v)}
                                />
                            </div>
                            <InputField
                                placeholder="Items (comma separated)"
                                value={formData.items}
                                onChange={(v) => handleChange("items", v)}
                            />
                            <textarea
                                placeholder="Notes..."
                                value={formData.notes}
                                onChange={(e) => handleChange("notes", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Agent Assignment */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Assign Agent (optional)</h3>
                            <select
                                value={formData.riderId}
                                onChange={(e) => handleChange("riderId", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Auto-assign later</option>
                                {availableRiders.map((rider) => (
                                    <option key={rider.id} value={rider.id}>
                                        {rider.name} ({rider.status === "online" ? "Free" : "Busy"})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {/* Submit Button */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Task...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Create Task
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Side: Map Preview */}
                <div className="hidden lg:block w-80 bg-gray-100 border-l border-gray-200">
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-white">
                            <h3 className="font-medium text-gray-700">Location Preview</h3>
                        </div>
                        <div className="flex-1 relative bg-[#e8d5b0]">
                            {/* Simple map placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Map preview</p>
                                    <p className="text-xs opacity-70">
                                        {formData.deliveryAddress || "Enter delivery address"}
                                    </p>
                                </div>
                            </div>

                            {/* Markers */}
                            {formData.pickupAddress && (
                                <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Package className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}
                            {formData.deliveryAddress && (
                                <div className="absolute bottom-1/3 right-1/3 transform translate-x-1/2 translate-y-1/2">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Truck className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Reusable Input Field Component
function InputField({
    icon,
    placeholder,
    value,
    onChange,
    type = "text",
    required = false,
}: {
    icon?: React.ReactNode;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
            {icon && <span className="text-gray-400">{icon}</span>}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
            />
        </div>
    );
}
