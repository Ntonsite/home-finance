import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { Lock, Shield, CheckCircle2, AlertCircle, ChevronRight, LogOut } from 'lucide-react';

export const Settings = () => {
    const { user, logout } = useAuth();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            await apiClient('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            setSuccess('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-24 px-4 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold premium-gradient-text">Configuration</h1>
                <p className="text-gray-400 text-sm">Manage your account and preferences</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="md:col-span-1 space-y-4">
                    <div className="premium-card p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-electric-blue/20 border border-electric-blue/30 flex items-center justify-center text-electric-blue font-black text-2xl mb-4 shadow-inner">
                            {user?.username.slice(0, 2).toUpperCase()}
                        </div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">{user?.username}</h2>
                        <span className="px-3 py-1 bg-navy-900 border border-gray-800 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">
                            {user?.role}
                        </span>
                    </div>

                    <button 
                        onClick={logout}
                        className="w-full premium-card p-4 flex items-center justify-between text-red-400 group hover:border-red-400/30 transition-all font-black uppercase tracking-widest text-xs"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Security Settings */}
                <div className="md:col-span-2 space-y-6">
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-navy-950 rounded-xl border border-gray-800 text-electric-blue">
                                <Lock size={20} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Security Credentials</h3>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center gap-3 text-green-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle2 size={16} />
                                    {success}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-electric-blue text-white px-6 py-4 rounded-xl shadow-xl font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all mt-4 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Secure & Update Password'}
                            </button>
                        </form>
                    </div>

                    <div className="premium-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-navy-950 rounded-xl border border-gray-800 text-gray-400">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">System Role</h3>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-navy-950 rounded-xl border border-gray-800">
                            <div>
                                <p className="text-xs font-black text-gray-300 uppercase tracking-tight">
                                    {user?.isSuperAdmin ? 'Global Overseer Status' : 'Household Member Status'}
                                </p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                                    {user?.isSuperAdmin ? 'Full access to all household data and management' : 'Standard operational access'}
                                </p>
                            </div>
                            <div className={user?.isSuperAdmin ? 'text-electric-blue' : 'text-gray-600'}>
                                <CheckCircle2 size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
