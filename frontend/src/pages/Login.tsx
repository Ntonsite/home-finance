import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Lock } from 'lucide-react';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiClient('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            login(data.token);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gray-900 flex flex-col justify-center px-6 py-12 lg:px-8 text-gray-100 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary-400/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-6">
                        <Lock className="w-8 h-8 text-white rotate-6" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                    MATO<span className="text-primary-400">finance</span>
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Household Consumption & Cost Intelligence
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-gray-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-gray-700/50">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-in shake">
                                <p className="text-sm text-red-400 text-center font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full p-3.5 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full p-3.5 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 disabled:opacity-50 transition-all"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : 'Sign In'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
