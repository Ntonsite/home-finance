import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { format } from 'date-fns';
import { Trash2, Shield, User, Link as LinkIcon, Copy, CheckCircle2, Clock, X, Globe, Plus } from 'lucide-react';
import clsx from 'clsx';
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

interface Household {
    id: string;
    name: string;
    createdAt: string;
}

export const Members = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);
    const [usernameInput, setUsernameInput] = useState('');
    const [roleInput, setRoleInput] = useState('MEMBER');
    const [showAddForm, setShowAddForm] = useState(false);
    const [targetHouseholdId, setTargetHouseholdId] = useState<string>('');

    // Invitation states
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const [inviteExpires, setInviteExpires] = useState(7);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const isOwner = user?.role === 'OWNER';
    const isAdmin = user?.role === 'ADMIN';
    const isSuperAdmin = user?.isSuperAdmin;
    const canManageMembers = isOwner || isSuperAdmin;
    const canAdd = isOwner || isAdmin || isSuperAdmin;

    const fetchData = async () => {
        try {
            setLoading(true);
            const calls: Promise<any>[] = [
                apiClient('/households/members'),
                isAdmin || isOwner || isSuperAdmin ? apiClient('/invitations') : Promise.resolve([])
            ];
            
            if (isSuperAdmin) {
                calls.push(apiClient('/households/all'));
            }

            const [membersData, invitesData, householdsData] = await Promise.all(calls);
            setMembers(membersData.members || []);
            setInvitations(invitesData || []);
            if (householdsData) setHouseholds(householdsData);
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
                body: JSON.stringify({ 
                    username: usernameInput, 
                    role: roleInput,
                    targetHouseholdId: isSuperAdmin ? targetHouseholdId : undefined
                })
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
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"><Shield className="w-3 h-3 mr-1" /> Owner</span>;
            case 'ADMIN':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-electric-blue/10 text-electric-blue border border-electric-blue/20"><Shield className="w-3 h-3 mr-1" /> Admin</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-gray-800 text-gray-400 border border-gray-700"><User className="w-3 h-3 mr-1" /> Member</span>;
        }
    };

    return (
        <div className="space-y-8 pb-24 px-4 max-w-4xl mx-auto relative">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold premium-gradient-text uppercase tracking-tight">Household</h1>
                    <p className="text-gray-400 text-sm">Collective management & access control</p>
                </div>
                {isSuperAdmin && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-electric-blue/10 rounded-xl border border-electric-blue/20">
                        <Globe size={14} className="text-electric-blue" />
                        <span className="text-[10px] font-black text-electric-blue uppercase tracking-widest">Global Admin Access</span>
                    </div>
                )}
            </div>

            {/* Invitations Section */}
            {canAdd && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                            <LinkIcon className="w-3 h-3" /> External Access Link
                        </h2>
                        <button
                            onClick={() => setShowInviteForm(!showInviteForm)}
                            className="p-2 bg-navy-900 border border-gray-800 rounded-lg text-electric-blue hover:text-white transition-colors"
                        >
                            {showInviteForm ? <X size={16} /> : <Plus size={16} />}
                        </button>
                    </div>

                    {showInviteForm && (
                        <div className="premium-card p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleGenerateInvite} className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Role Assignment</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full"
                                    >
                                        <option value="MEMBER">Member</option>
                                        {(isOwner || isSuperAdmin) && <option value="ADMIN">Admin</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Validity Period</label>
                                    <select
                                        value={inviteExpires}
                                        onChange={(e) => setInviteExpires(Number(e.target.value))}
                                        className="w-full"
                                    >
                                        <option value={1}>24 Hours</option>
                                        <option value={7}>7 Days</option>
                                        <option value={30}>30 Days</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="w-full bg-electric-blue text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all">
                                        Generate
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        {invitations.map((invite) => (
                            <div key={invite.id} className="premium-card p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <RoleBadge role={invite.role} />
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter flex items-center gap-1">
                                            <Clock size={10} /> {format(new Date(invite.expiresAt), 'MMM dd')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeInvite(invite.id)}
                                        className="text-gray-600 hover:text-red-400 p-1 rounded transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={`${window.location.origin}/accept-invite?token=${invite.id}`}
                                        className="flex-1 bg-navy-950 border border-gray-800 rounded-lg px-3 py-1.5 text-[10px] text-gray-500 focus:outline-none"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(invite.id)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg flex items-center justify-center transition-all",
                                            copiedId === invite.id ? 'bg-emerald-500 text-white' : 'bg-navy-900 text-gray-400 hover:text-white'
                                        )}
                                    >
                                        {copiedId === invite.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Members Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Active Members</h2>
                    {canAdd && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-[10px] font-black text-electric-blue uppercase tracking-widest px-3 py-1 rounded-full border border-electric-blue/20 hover:bg-electric-blue/10 transition-all"
                        >
                            Add New +
                        </button>
                    )}
                </div>

                {showAddForm && (
                    <div className="premium-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Internal Assignment</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Identity Handle</label>
                                    <input
                                        type="text"
                                        required
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        placeholder="e.g. ntonsite"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Role Authority</label>
                                    <select
                                        value={roleInput}
                                        onChange={(e) => setRoleInput(e.target.value)}
                                        className="w-full"
                                    >
                                        <option value="MEMBER">Member</option>
                                        {(isOwner || isSuperAdmin) && <option value="ADMIN">Admin</option>}
                                    </select>
                                </div>
                            </div>
                            
                            {isSuperAdmin && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Target Unit (SuperAdmin Only)</label>
                                    <select
                                        value={targetHouseholdId}
                                        onChange={(e) => setTargetHouseholdId(e.target.value)}
                                        className="w-full border-electric-blue/30"
                                        required
                                    >
                                        <option value="">Current Household</option>
                                        {households.map(h => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button type="submit" className="w-full bg-electric-blue text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all">
                                Execute Member Addition
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid gap-3">
                    {members.map((member) => (
                        <div key={member.id} className="premium-card p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-navy-950 flex items-center justify-center text-electric-blue font-black text-xl border border-gray-800 shadow-inner group-hover:scale-105 transition-transform">
                                    {(member.user.name || member.user.username).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-gray-100 uppercase tracking-tight">
                                            {member.user.name || member.user.username}
                                        </p>
                                        {member.user.id === user?.id && <span className="text-[9px] font-black uppercase tracking-tighter text-electric-blue bg-electric-blue/10 px-1.5 py-0.5 rounded border border-electric-blue/20">Self</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">@{member.user.username}</span>
                                        <RoleBadge role={member.role} />
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter mt-1.5">
                                        Operational Since {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            {(canManageMembers || isSuperAdmin) && member.user.id !== user?.id && (
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                    title="Revoke Membership"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="premium-card h-24 animate-pulse"></div>
                    ))}
                </div>
            )}
        </div>
    );
};
