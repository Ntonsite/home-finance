import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states for new user
    const [isNewUser, setIsNewUser] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing invitation token.');
        }
    }, [token]);

    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // If they are not authenticated, they need an account
            // We'll create one for them and then accept the invite in one go
            // Or log them in if they chose "existing user"

            let authToken = null;

            if (!isAuthenticated) {
                if (isNewUser) {
                    const regRes = await apiClient('/auth/register', {
                        method: 'POST',
                        body: JSON.stringify({ username, password, name })
                    });
                    authToken = regRes.token;
                    login(authToken);
                } else {
                    const loginRes = await apiClient('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ username, password })
                    });
                    authToken = loginRes.token;
                    login(authToken);
                }
            }

            // Now accept the invite
            // Use the newly acquired token if just registered/logged in
            const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

            await apiClient('/households/accept-invite', {
                method: 'POST',
                headers,
                body: JSON.stringify({ token })
            });

            setSuccess('Invitation accepted successfully! Redirecting...');
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Failed to accept invitation. Please verify your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (error && !token) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Invite Link</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400" />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    You've Been Invited!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Join the household on HomePortal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">

                    {success ? (
                        <div className="text-center text-green-600 dark:text-green-400 font-medium p-4 bg-green-50 dark:bg-green-900/30 rounded-md">
                            {success}
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleAccept}>
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4">
                                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            {!isAuthenticated && (
                                <>
                                    <div className="flex justify-center space-x-4 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsNewUser(true)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md ${isNewUser ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                        >
                                            New User
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsNewUser(false)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md ${!isNewUser ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                        >
                                            Existing User
                                        </button>
                                    </div>

                                    {isNewUser && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                                            placeholder="johndoe123"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </>
                            )}

                            {isAuthenticated && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 p-4">
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        You are already logged in. Click below to accept the invitation and join the household.
                                    </p>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors gap-2"
                                >
                                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {loading ? 'Processing...' : 'Accept Invitation'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
