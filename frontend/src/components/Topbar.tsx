import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bell, Search } from 'lucide-react';

export const Topbar = () => {
    const { logout, user } = useAuth();

    return (
        <header className="h-20 w-full bg-navy-950/80 backdrop-blur-xl border-b border-gray-800/50 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50">
            <div className="flex md:hidden items-center gap-2">
                <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                    <span className="text-white font-black text-xs italic">H</span>
                </div>
                <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">
                    Portal
                </h1>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="w-full bg-navy-900/50 border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-gray-300 focus:border-electric-blue transition-colors outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <Bell className="h-5 w-5" />
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-electric-blue rounded-full border-2 border-navy-950 shadow-[0_0_8px_#3b82f6]"></div>
                </button>

                <div className="h-8 w-px bg-gray-800 mx-1"></div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-red-400 rounded-xl px-3 py-2 transition-all uppercase tracking-widest hover:bg-red-400/5"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Secure Out</span>
                    </button>
                    <div className="md:hidden w-10 h-10 rounded-xl bg-electric-blue/20 flex items-center justify-center text-electric-blue font-black text-xs">
                        {user?.username.slice(0, 2).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
};
