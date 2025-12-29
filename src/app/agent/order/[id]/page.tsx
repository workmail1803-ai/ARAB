"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    Navigation,
    MapPin,
    Clock,
    Package,
    User,
    FileText,
    ChevronRight,
    CheckCircle,
    Truck,
    AlertCircle
} from "lucide-react";

interface Order {
    id: string;
    order_id: string;
    pickup_address: string;
    pickup_latitude: number;
    pickup_longitude: number;
    delivery_address: string;
    delivery_latitude: number;
    delivery_longitude: number;
    status: string;
    priority: string;
    created_at: string;
    scheduled_time?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    pickup_contact_name?: string;
    pickup_contact_phone?: string;
    description?: string;
    special_instructions?: string;
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    const fetchOrder = useCallback(async () => {
        try {
            const token = localStorage.getItem("agent_token");
            if (!token) return;

            const response = await fetch(`/api/agent/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setOrder(data.data);
            } else {
                setError("Failed to load order");
            }
        } catch (error) {
            console.error(error);
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const updateStatus = async (newStatus: string) => {
        if (!order) return;
        if (!confirm(`Update status to "${newStatus.replace("_", " ")}"?`)) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem("agent_token");
            const response = await fetch(`/api/agent/orders/${order.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: `Status updated to ${newStatus} by agent`
                })
            });

            if (response.ok) {
                setOrder({ ...order, status: newStatus });
                
                // If delivered, go back to dashboard
                if (newStatus === "delivered") {
                    setTimeout(() => router.push("/agent"), 1500);
                }
            } else {
                const data = await response.json();
                alert(data.error || "Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const getNextStatus = (currentStatus: string) => {
        const flow: Record<string, { next: string; label: string; color: string }> = {
            assigned: { next: "picked_up", label: "Pick Up", color: "from-purple-500 to-purple-600" },
            picked_up: { next: "in_transit", label: "Start Delivery", color: "from-amber-500 to-amber-600" },
            in_transit: { next: "delivered", label: "Complete Delivery", color: "from-green-500 to-green-600" }
        };
        return flow[currentStatus];
    };

    const getStatusSteps = (currentStatus: string) => {
        const steps = [
            { key: "assigned", label: "Assigned", icon: <Clock className="w-5 h-5" /> },
            { key: "picked_up", label: "Picked Up", icon: <Package className="w-5 h-5" /> },
            { key: "in_transit", label: "In Transit", icon: <Truck className="w-5 h-5" /> },
            { key: "delivered", label: "Delivered", icon: <CheckCircle className="w-5 h-5" /> }
        ];

        const currentIndex = steps.findIndex(s => s.key === currentStatus);
        return steps.map((step, idx) => ({
            ...step,
            completed: idx < currentIndex,
            current: idx === currentIndex,
            upcoming: idx > currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <p className="text-white text-lg mb-2">Order Not Found</p>
                <p className="text-slate-400 text-sm mb-6">{error || "The order may have been removed"}</p>
                <button
                    onClick={() => router.push("/agent")}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const nextAction = getNextStatus(order.status);
    const statusSteps = getStatusSteps(order.status);

    return (
        <div className="min-h-screen bg-slate-900 pb-32">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="flex items-center gap-3 p-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white font-semibold">Order #{order.order_id}</h1>
                        <p className="text-slate-400 text-sm capitalize">{order.status.replace("_", " ")}</p>
                    </div>
                    {order.priority === "urgent" && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                            URGENT
                        </span>
                    )}
                </div>
            </div>

            {/* Status Progress */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center justify-between">
                    {statusSteps.map((step, idx) => (
                        <div key={step.key} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        step.completed
                                            ? "bg-green-500 text-white"
                                            : step.current
                                            ? "bg-teal-500 text-white"
                                            : "bg-slate-700 text-slate-500"
                                    }`}
                                >
                                    {step.icon}
                                </div>
                                <p className={`text-xs mt-1 ${step.current ? "text-teal-400" : "text-slate-500"}`}>
                                    {step.label}
                                </p>
                            </div>
                            {idx < statusSteps.length - 1 && (
                                <div className={`w-6 h-0.5 mx-1 ${step.completed ? "bg-green-500" : "bg-slate-700"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pickup Location */}
            <div className="p-4">
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            PICKUP LOCATION
                        </div>
                        <p className="text-white">{order.pickup_address}</p>
                        {order.pickup_contact_name && (
                            <p className="text-slate-400 text-sm mt-1">
                                {order.pickup_contact_name}
                            </p>
                        )}
                    </div>
                    <div className="flex divide-x divide-slate-700">
                        {order.pickup_contact_phone && (
                            <a
                                href={`tel:${order.pickup_contact_phone}`}
                                className="flex-1 py-3 flex items-center justify-center gap-2 text-teal-400"
                            >
                                <Phone className="w-5 h-5" />
                                Call
                            </a>
                        )}
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.pickup_latitude},${order.pickup_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 flex items-center justify-center gap-2 text-teal-400"
                        >
                            <Navigation className="w-5 h-5" />
                            Navigate
                        </a>
                    </div>
                </div>
            </div>

            {/* Delivery Location */}
            <div className="px-4">
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                            <MapPin className="w-4 h-4" />
                            DELIVERY LOCATION
                        </div>
                        <p className="text-white">{order.delivery_address}</p>
                        {order.customer_name && (
                            <p className="text-slate-400 text-sm mt-1">
                                <User className="w-4 h-4 inline mr-1" />
                                {order.customer_name}
                            </p>
                        )}
                    </div>
                    <div className="flex divide-x divide-slate-700">
                        {order.customer_phone && (
                            <>
                                <a
                                    href={`tel:${order.customer_phone}`}
                                    className="flex-1 py-3 flex items-center justify-center gap-2 text-teal-400"
                                >
                                    <Phone className="w-5 h-5" />
                                    Call
                                </a>
                                <a
                                    href={`sms:${order.customer_phone}`}
                                    className="flex-1 py-3 flex items-center justify-center gap-2 text-teal-400"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    SMS
                                </a>
                            </>
                        )}
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 flex items-center justify-center gap-2 text-teal-400"
                        >
                            <Navigation className="w-5 h-5" />
                            Navigate
                        </a>
                    </div>
                </div>
            </div>

            {/* Order Details */}
            {(order.description || order.special_instructions) && (
                <div className="p-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-3">
                            <FileText className="w-4 h-4" />
                            ORDER DETAILS
                        </div>
                        {order.description && (
                            <p className="text-white mb-2">{order.description}</p>
                        )}
                        {order.special_instructions && (
                            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <p className="text-amber-300 text-sm font-medium">Special Instructions</p>
                                <p className="text-amber-200 text-sm mt-1">{order.special_instructions}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Option */}
            {order.status !== "delivered" && order.status !== "cancelled" && (
                <div className="px-4">
                    <button
                        onClick={() => {
                            if (confirm("Report an issue with this order?")) {
                                // TODO: Implement issue reporting
                                alert("Feature coming soon. Contact support for urgent issues.");
                            }
                        }}
                        className="w-full py-3 text-red-400 text-sm flex items-center justify-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        Report Issue
                    </button>
                </div>
            )}

            {/* Action Button */}
            {nextAction && order.status !== "delivered" && order.status !== "cancelled" && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800">
                    <button
                        onClick={() => updateStatus(nextAction.next)}
                        disabled={updating}
                        className={`w-full py-4 bg-gradient-to-r ${nextAction.color} text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                        {updating ? (
                            <>
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                Updating...
                            </>
                        ) : (
                            <>
                                {nextAction.label}
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Completed State */}
            {order.status === "delivered" && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800">
                    <div className="text-center py-4">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-semibold">Delivery Completed!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
