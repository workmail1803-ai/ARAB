"use client";

import { useState } from "react";
import {
    UserCog,
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Mail,
    Phone,
    Shield,
    X,
} from "lucide-react";

interface Manager {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    teams: string[];
    status: 'active' | 'inactive';
}

const mockManagers: Manager[] = [
    {
        id: "1",
        name: "John Smith",
        email: "john@company.com",
        phone: "+1 555-0123",
        role: "Admin",
        teams: ["Downtown Delivery", "Airport Zone"],
        status: "active"
    },
    {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@company.com",
        phone: "+1 555-0124",
        role: "Manager",
        teams: ["Suburban Fleet"],
        status: "active"
    },
];

const roles = ["Admin", "Manager", "Supervisor", "Dispatcher"];

export default function ManagerPage() {
    const [managers, setManagers] = useState<Manager[]>(mockManagers);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "Manager",
    });

    const filteredManagers = managers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addManager = () => {
        if (!formData.name || !formData.email) return;

        const newManager: Manager = {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            teams: [],
            status: "active",
        };

        setManagers([...managers, newManager]);
        setFormData({ name: "", email: "", phone: "", role: "Manager" });
        setShowModal(false);
    };

    const deleteManager = (id: string) => {
        setManagers(managers.filter(m => m.id !== id));
        setMenuOpen(null);
    };

    return (
        <div className="max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserCog className="w-6 h-6 text-indigo-600" />
                        Managers
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage users who can access and operate the dashboard.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Manager
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search managers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Managers Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="grid grid-cols-[1fr,180px,140px,100px,80px,60px] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div></div>
                </div>

                {/* Rows */}
                {filteredManagers.length === 0 ? (
                    <div className="p-12 text-center">
                        <UserCog className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No managers yet</h3>
                        <p className="text-gray-500 mb-4">Add managers to help operate your fleet.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add Manager
                        </button>
                    </div>
                ) : (
                    filteredManagers.map((manager, index) => (
                        <div
                            key={manager.id}
                            className={`grid grid-cols-[1fr,180px,140px,100px,80px,60px] gap-4 px-4 py-4 items-center hover:bg-gray-50 ${index !== filteredManagers.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            {/* Name */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {manager.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{manager.name}</div>
                                    <div className="text-xs text-gray-500">{manager.teams.length} teams</div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {manager.email}
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {manager.phone}
                            </div>

                            {/* Role */}
                            <div>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${manager.role === 'Admin'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    <Shield className="w-3 h-3" />
                                    {manager.role}
                                </span>
                            </div>

                            {/* Status */}
                            <div>
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${manager.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                                    }`} />
                                <span className="text-sm text-gray-600 capitalize">{manager.status}</span>
                            </div>

                            {/* Actions */}
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(menuOpen === manager.id ? null : manager.id)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                </button>

                                {menuOpen === manager.id && (
                                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteManager(manager.id)}
                                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Manager Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add New Manager</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg"
                                    placeholder="John Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg"
                                    placeholder="john@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg"
                                    placeholder="+1 555-0123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={addManager}
                                disabled={!formData.name || !formData.email}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Add Manager
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
