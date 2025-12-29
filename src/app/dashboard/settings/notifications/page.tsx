"use client";

import { useState, useEffect } from "react";
import {
    MessageSquare,
    Mail,
    Webhook,
    Edit2,
    Loader2,
    Check,
    X,
    Bell,
} from "lucide-react";

interface NotificationSetting {
    event_type: string;
    sms_enabled: boolean;
    email_enabled: boolean;
    webhook_enabled: boolean;
    webhook_url: string | null;
}

// Event type display names
const eventLabels: Record<string, string> = {
    task_created: "Task Created",
    task_assigned: "Task Assigned",
    task_started: "Task Started",
    task_completed: "Task Completed",
    task_failed: "Task Failed",
    task_cancelled: "Task Cancelled",
    agent_on_duty: "Agent On Duty",
    agent_off_duty: "Agent Off Duty",
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const apiKey = localStorage.getItem("api_key");
            if (!apiKey) {
                setError("No API key found. Please log in first.");
                setLoading(false);
                return;
            }

            const response = await fetch("/api/v1/settings/notifications", {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (!response.ok) throw new Error("Failed to fetch notifications");

            const data = await response.json();
            setNotifications(data.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const toggleNotification = async (
        eventType: string,
        channel: 'sms_enabled' | 'email_enabled' | 'webhook_enabled'
    ) => {
        const notification = notifications.find(n => n.event_type === eventType);
        if (!notification) return;

        const newValue = !notification[channel];

        // Optimistic update
        setNotifications(prev =>
            prev.map(n =>
                n.event_type === eventType
                    ? { ...n, [channel]: newValue }
                    : n
            )
        );

        setSaving(eventType);

        try {
            const apiKey = localStorage.getItem("api_key");
            const response = await fetch("/api/v1/settings/notifications", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    event_type: eventType,
                    [channel]: newValue,
                    sms_enabled: channel === 'sms_enabled' ? newValue : notification.sms_enabled,
                    email_enabled: channel === 'email_enabled' ? newValue : notification.email_enabled,
                    webhook_enabled: channel === 'webhook_enabled' ? newValue : notification.webhook_enabled,
                }),
            });

            if (!response.ok) throw new Error("Failed to update");
        } catch {
            // Revert on error
            setNotifications(prev =>
                prev.map(n =>
                    n.event_type === eventType
                        ? { ...n, [channel]: !newValue }
                        : n
                )
            );
        } finally {
            setSaving(null);
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
                <h3 className="font-semibold mb-2">Error Loading Notifications</h3>
                <p className="text-sm">{error}</p>
                <button onClick={fetchNotifications} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-indigo-600" />
                    Notifications
                </h1>
                <p className="text-gray-500 mt-1">
                    Configure how you receive notifications for different events.
                </p>
            </div>

            {/* Notification Matrix */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Header Row */}
                <div className="grid grid-cols-[1fr,100px,100px,100px,60px] bg-gray-50 border-b border-gray-200">
                    <div className="p-4 font-medium text-gray-700">Event</div>
                    <div className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                            <MessageSquare className="w-5 h-5 text-emerald-600" />
                            <span className="text-xs font-medium text-gray-600">SMS</span>
                        </div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <span className="text-xs font-medium text-gray-600">Email</span>
                        </div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                            <Webhook className="w-5 h-5 text-purple-600" />
                            <span className="text-xs font-medium text-gray-600">Webhook</span>
                        </div>
                    </div>
                    <div className="p-4 text-center">
                        <span className="text-xs font-medium text-gray-600">Edit</span>
                    </div>
                </div>

                {/* Rows */}
                {notifications.map((notification, index) => (
                    <div
                        key={notification.event_type}
                        className={`grid grid-cols-[1fr,100px,100px,100px,60px] items-center ${index !== notifications.length - 1 ? 'border-b border-gray-100' : ''
                            } hover:bg-gray-50/50 transition-colors`}
                    >
                        {/* Event Name */}
                        <div className="p-4">
                            <span className="font-medium text-gray-900">
                                {eventLabels[notification.event_type] || notification.event_type}
                            </span>
                        </div>

                        {/* SMS Toggle */}
                        <div className="p-4 flex justify-center">
                            <button
                                onClick={() => toggleNotification(notification.event_type, 'sms_enabled')}
                                disabled={saving === notification.event_type}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${notification.sms_enabled
                                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                {notification.sms_enabled ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <X className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Email Toggle */}
                        <div className="p-4 flex justify-center">
                            <button
                                onClick={() => toggleNotification(notification.event_type, 'email_enabled')}
                                disabled={saving === notification.event_type}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${notification.email_enabled
                                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                {notification.email_enabled ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <X className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Webhook Toggle */}
                        <div className="p-4 flex justify-center">
                            <button
                                onClick={() => toggleNotification(notification.event_type, 'webhook_enabled')}
                                disabled={saving === notification.event_type}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${notification.webhook_enabled
                                        ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                            >
                                {notification.webhook_enabled ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <X className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Edit Button */}
                        <div className="p-4 flex justify-center">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center">
                        <X className="w-3 h-3 text-gray-400" />
                    </div>
                    <span>Disabled</span>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h3 className="font-medium text-indigo-900 mb-2">About Notifications</h3>
                <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• <strong>SMS</strong>: Send text messages to customers and agents</li>
                    <li>• <strong>Email</strong>: Send email notifications with tracking links</li>
                    <li>• <strong>Webhook</strong>: Send event data to your external systems</li>
                </ul>
            </div>
        </div>
    );
}
