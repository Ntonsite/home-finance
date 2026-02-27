import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { format } from 'date-fns';
import { Trash2, UserPlus, Shield, User, Copy, CheckCircle2 } from 'lucide-react';
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

interface Invite {
    id: number;
    email: string;
    role: string;
    token: string;
    expiresAt: string;
}

export const Members = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('MEMBER');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const isOwner = user?.role === 'OWNER';
    const isAdmin = user?.role === 'ADMIN';
    const canManageMembers = isOwner;
    const canInvite = isOwner || isAdmin;

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await apiClient('/households/members');
            setMembers(data.members || []);
            setInvites(data.invites || []);
        } catch (error) {
            console.error('Failed to fetch members data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await apiClient('/households/invite', {
                method: 'POST',
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });
            setInviteEmail('');
            setShowInviteForm(false);
            fetchData();

            // Auto copy to clipboard for convenience in this simple app
            const inviteUrl = data.inviteUrl;
            navigator.clipboard.writeText(inviteUrl);
            alert('Invite generated and URL copied to clipboard!');
        } catch (error: any) {
            alert(error.message || 'Failed to generate invite');
        }
    };

    const handleCopyInviteLink = (token: string) => {
        const url = `${window.location.origin}/accept-invite?token=${token}`;
        navigator.clipboard.writeText(url);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
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

    const handleDeleteInvite = async (id: number) => {
        if (!confirm('Cancel this pending invitation?')) return;
        try {
            await apiClient(`/households/invite/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error: any) {
            alert(error.message || 'Failed to cancel invitation');
        }
    };

    const RoleBadge = ({ role }: { role: string }) => {
        switch (role) {
            case 'OWNER':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"><Shield className="w-3 h-3 mr-1" /> Owner</span>;
            case 'ADMIN':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"><Shield className="w-3 h-3 mr-1" /> Admin</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"><User className="w-3 h-3 mr-1" /> Member</span>;
        }
    };

    if (loading) return <div className="p-8 text-center dark:text-gray-300">Loading members...</div>;

    if (!canInvite && !canManageMembers) {
        return <div className="p-8 text-center dark:text-gray-300">You do not have permission to view this page.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Household Members</h1>
                {canInvite && (
                    <button
                        onClick={() => setShowInviteForm(!showInviteForm)}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center shadow-sm transition-colors"
                    >
                        <UserPlus className="w-5 h-5 mr-2" /> Invite Member
                    </button>
                )}
            </div>

            {showInviteForm && canInvite && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4 dark:text-gray-200">Send New Invitation</h2>
                    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                <option value="MEMBER">Member</option>
                                {isOwner && <option value="ADMIN">Admin</option>}
                            </select>
                        </div>
                        <button type="submit" className="w-full sm:w-auto bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 shadow-sm whitespace-nowrap">
                            Generate Link
                        </button>
                    </form>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Generating an invite will create a unique, single-use registration link that expires in 7 days.
                    </p>
                </div>
            )}

            {invites.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pending Invitations</h2>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {invites.map((invite) => (
                            <li key={invite.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invite.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <RoleBadge role={invite.role} />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Expires: {format(new Date(invite.expiresAt), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleCopyInviteLink(invite.token)}
                                        className="flex-1 sm:flex-none flex justify-center items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                    >
                                        {copiedToken === invite.token ? (
                                            <><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Copied</>
                                        ) : (
                                            <><Copy className="w-4 h-4 mr-2" /> Copy Link</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteInvite(invite.id)}
                                        className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Cancel Invitation"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Members</h2>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {members.map((member) => (
                        <li key={member.id} className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                                    {(member.user.name || member.user.username).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {member.user.name || member.user.username}
                                        {member.user.id === user?.id && <span className="ml-2 text-xs font-normal text-gray-500">(You)</span>}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span>@{member.user.username}</span>
                                        <span>&bull;</span>
                                        <RoleBadge role={member.role} />
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Joined {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            {canManageMembers && member.user.id !== user?.id && (
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Remove from household"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
