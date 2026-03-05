import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { format } from 'date-fns';
import { Trash2, UserPlus, Shield, User, Link as LinkIcon, Copy, CheckCircle2, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Member {
    id: number;
    role: string;
    joinedAt: string;
    user: {
        id: number;
        name: string | null;
        username: string;
        email: string | null;
    };
}

interface Invitation {
    id: string;
    role: string;
    email: string | null;
    expiresAt: string;
    createdAt: string;
}

export const Members = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [usernameInput, setUsernameInput] = useState('');
    const [roleInput, setRoleInput] = useState('MEMBER');
    const [showAddForm, setShowAddForm] = useState(false);

    // Invitation states
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const [inviteExpires, setInviteExpires] = useState(7);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const isOwner = user?.role === 'OWNER';
    const isAdmin = user?.role === 'ADMIN';
    const canManageMembers = isOwner;
    const canAdd = isOwner || isAdmin;

    const fetchData = async () => {
        try {
            setLoading(true);
            const [membersData, invitesData] = await Promise.all([
                apiClient('/households/members'),
                isAdmin || isOwner ? apiClient('/invitations') : Promise.resolve([])
            ]);
            setMembers(membersData.members || []);
            setInvitations(invitesData || []);
        } catch (error) {
            console.error('Failed to fetch members data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient('/households/members', {
                method: 'POST',
                body: JSON.stringify({ username: usernameInput, role: roleInput })
            });
            setUsernameInput('');
            setShowAddForm(false);
            fetchData();
            alert('Member added successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to add member');
        }
    };

    const handleGenerateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient('/invitations', {
                method: 'POST',
                body: JSON.stringify({ role: inviteRole, expiresInDays: inviteExpires })
            });
            setShowInviteForm(false);
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to generate invitation');
        }
    };

    const handleRevokeInvite = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this invitation link?')) return;
        try {
            await apiClient(`/invitations/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to revoke invitation');
        }
    };

    const copyToClipboard = (id: string) => {
        const url = `${window.location.origin}/accept-invite?token=${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await apiClient(`/households/members/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to remove member');
        }
    };

    const RoleBadge = ({ role }: { role: string }) => {
        switch (role) {
            case 'OWNER':
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary-900/40 text-primary-300 border border-primary-500/20"><Shield className="w-3 h-3 mr-1" /> Owner</span>;
            case 'ADMIN':
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-900/40 text-blue-300 border border-blue-500/20"><Shield className="w-3 h-3 mr-1" /> Admin</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-700 text-gray-300 border border-gray-600"><User className="w-3 h-3 mr-1" /> Member</span>;
        }
    };

    if (loading) return (
        <div className="space-y-4 pb-24">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">Profile & Members</h1>
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800 rounded-2xl h-24 animate-pulse border border-gray-800/50"></div>
            ))}
        </div>
    );

    if (!canAdd && !canManageMembers) {
        return (
            <div className="pb-24">
                <h1 className="text-2xl font-bold text-gray-100 mb-6">Profile</h1>
                <div className="bg-gray-800 rounded-2xl p-6 text-center border border-gray-700 shadow-md">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-200">{user?.username}</h3>
                    <p className="text-sm text-gray-500 mt-1">Role: {user?.role}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 relative px-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-100 mb-2">Household</h1>
                <p className="text-sm text-gray-400">Manage members and invitations</p>
            </div>

            {/* Invitation Section */}
            {canAdd && (
                <section className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> Invitation Links
                        </h2>
                        <button
                            onClick={() => setShowInviteForm(!showInviteForm)}
                            className="text-xs font-bold text-primary-500 hover:text-primary-400 px-2 py-1 rounded-md bg-primary-500/10"
                        >
                            {showInviteForm ? 'Close' : 'Generate Link'}
                        </button>
                    </div>

                    {showInviteForm && (
                        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleGenerateInvite} className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                            className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3 text-sm"
                                        >
                                            <option value="MEMBER">Member</option>
                                            {isOwner && <option value="ADMIN">Admin</option>}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Expires In</label>
                                        <select
                                            value={inviteExpires}
                                            onChange={(e) => setInviteExpires(Number(e.target.value))}
                                            className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3 text-sm"
                                        >
                                            <option value={1}>1 Day</option>
                                            <option value={7}>7 Days</option>
                                            <option value={30}>30 Days</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Create Link
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="space-y-2">
                        {invitations.map((invite) => (
                            <div key={invite.id} className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <RoleBadge role={invite.role} />
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Exp: {format(new Date(invite.expiresAt), 'MMM dd')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeInvite(invite.id)}
                                        className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-red-400/10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={`${window.location.origin}/accept-invite?token=${invite.id}`}
                                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(invite.id)}
                                        className={`px-3 py-2 rounded-lg flex items-center justify-center transition-all ${copiedId === invite.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                    >
                                        {copiedId === invite.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {invitations.length === 0 && !showInviteForm && (
                            <div className="bg-gray-800/20 rounded-2xl p-4 border border-dashed border-gray-700 text-center">
                                <p className="text-xs text-gray-500 italic">No active invitation links.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Current Members Section */}
            <section className="space-y-3">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Members</h2>

                {showAddForm && canAdd && (
                    <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-100">Add Directly</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-200 text-sm">
                                Cancel
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    placeholder="e.g. johndoe"
                                    className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                                <select
                                    value={roleInput}
                                    onChange={(e) => setRoleInput(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-700 bg-gray-900 text-white shadow-sm focus:border-primary-500 p-3"
                                >
                                    <option value="MEMBER">Member</option>
                                    {isOwner && <option value="ADMIN">Admin</option>}
                                </select>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed italic">
                                * Use this to add someone who already has an account.
                            </p>
                            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform mt-2">
                                Add User
                            </button>
                        </form>
                    </div>
                )}

                <div className="space-y-3">
                    {members.map((member) => (
                        <div key={member.id} className="bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center text-primary-400 font-bold text-xl border border-gray-700">
                                    {(member.user.name || member.user.username).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-base font-bold text-gray-100">
                                            {member.user.name || member.user.username}
                                        </p>
                                        {member.user.id === user?.id && <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500 bg-primary-900/20 px-1.5 py-0.5 rounded-md">You</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-medium text-gray-400">@{member.user.username}</span>
                                        <RoleBadge role={member.role} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Joined {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            {canManageMembers && member.user.id !== user?.id && (
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-2.5 text-gray-500 hover:text-red-400 bg-gray-900/50 hover:bg-red-400/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                                    title="Remove from household"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {canAdd && !showAddForm && !showInviteForm && (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="fixed bottom-20 right-6 w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_0_rgba(60,130,107,0.39)] hover:bg-primary-500 active:scale-90 transition-all z-40"
                    title="Add Member Directly"
                >
                    <UserPlus className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};
