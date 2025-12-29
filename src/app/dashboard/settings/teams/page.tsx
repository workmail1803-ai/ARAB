"use client";

import { useState } from "react";
import {
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    UserPlus,
    X,
} from "lucide-react";

interface Team {
    id: string;
    name: string;
    members: number;
    color: string;
    created: string;
}

const mockTeams: Team[] = [
    { id: "1", name: "Downtown Delivery", members: 8, color: "#4F46E5", created: "2024-01-15" },
    { id: "2", name: "Airport Zone", members: 5, color: "#059669", created: "2024-02-20" },
    { id: "3", name: "Suburban Fleet", members: 12, color: "#DC2626", created: "2024-03-10" },
];

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>(mockTeams);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamColor, setNewTeamColor] = useState("#4F46E5");
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addTeam = () => {
        if (!newTeamName.trim()) return;

        const newTeam: Team = {
            id: Date.now().toString(),
            name: newTeamName,
            members: 0,
            color: newTeamColor,
            created: new Date().toISOString().split('T')[0],
        };

        setTeams([...teams, newTeam]);
        setNewTeamName("");
        setShowModal(false);
    };

    const deleteTeam = (id: string) => {
        setTeams(teams.filter(t => t.id !== id));
        setMenuOpen(null);
    };

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Teams
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Organize your agents into teams for better management.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Team
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* Teams Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="grid grid-cols-[auto,1fr,100px,120px,60px] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                    <div className="w-10"></div>
                    <div>Team Name</div>
                    <div className="text-center">Members</div>
                    <div>Created</div>
                    <div></div>
                </div>

                {/* Rows */}
                {filteredTeams.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No teams yet</h3>
                        <p className="text-gray-500 mb-4">Create your first team to organize agents.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <UserPlus className="w-4 h-4" />
                            Create Team
                        </button>
                    </div>
                ) : (
                    filteredTeams.map((team, index) => (
                        <div
                            key={team.id}
                            className={`grid grid-cols-[auto,1fr,100px,120px,60px] gap-4 px-4 py-4 items-center hover:bg-gray-50 ${index !== filteredTeams.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            {/* Color Indicator */}
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: team.color + '20' }}
                            >
                                <Users className="w-5 h-5" style={{ color: team.color }} />
                            </div>

                            {/* Team Name */}
                            <div>
                                <div className="font-medium text-gray-900">{team.name}</div>
                            </div>

                            {/* Members */}
                            <div className="text-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                    {team.members}
                                </span>
                            </div>

                            {/* Created */}
                            <div className="text-sm text-gray-500">{team.created}</div>

                            {/* Actions */}
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(menuOpen === team.id ? null : team.id)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                </button>

                                {menuOpen === team.id && (
                                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteTeam(team.id)}
                                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Team Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Team</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter team name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Team Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden"
                                        style={{ backgroundColor: newTeamColor }}
                                    >
                                        <input
                                            type="color"
                                            value={newTeamColor}
                                            onChange={(e) => setNewTeamColor(e.target.value)}
                                            className="w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={newTeamColor}
                                        onChange={(e) => setNewTeamColor(e.target.value)}
                                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg font-mono uppercase text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addTeam}
                                disabled={!newTeamName.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Create Team
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
