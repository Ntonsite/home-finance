import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Topbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="md:hidden ml-2 text-xl font-bold text-primary-600 dark:text-primary-400">
                    HomePortal
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                        {user?.username}
                    </span>
                    <button
                        onClick={logout}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <LogOut className="h-5 w-5 sm:mr-1" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
