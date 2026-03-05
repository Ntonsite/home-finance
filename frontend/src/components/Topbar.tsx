import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bell } from 'lucide-react';

export const Topbar = () => {
    const { logout } = useAuth();

    return (
        <header className="h-16 w-full bg-gray-900/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
                <div className="text-xl font-bold text-primary-400 tracking-tight">
                    MATO<span className="text-gray-100 font-medium">finance</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    className="p-2 text-gray-400 hover:text-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                >
                    <Bell className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={logout}
                        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-200 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
