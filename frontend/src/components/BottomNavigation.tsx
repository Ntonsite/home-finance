import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, PieChart, Users, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
    { name: 'Index', path: '/', icon: Home },
    { name: 'Trans', path: '/expenses', icon: Receipt },
    { name: 'Visual', path: '/categories', icon: PieChart },
];

export const BottomNavigation = () => {
    const location = useLocation();
    const { user } = useAuth();

    const tabs = [...navigation];
    if (user && (user.role === 'OWNER' || user.role === 'ADMIN')) {
        tabs.push({ name: 'Groups', path: '/members', icon: Users });
    }
    
    // Always add settings for mobile
    tabs.push({ name: 'Config', path: '/settings', icon: Settings });

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-20 bg-navy-950/90 backdrop-blur-xl border-t border-gray-800/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] safe-area-pb">
            <div className="flex h-full w-full max-w-md mx-auto justify-around items-center px-4">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.name + tab.path}
                            to={tab.path}
                            className="flex flex-col items-center justify-center group relative py-2 min-w-[64px]"
                        >
                            {isActive && (
                                <div className="absolute -top-1 w-8 h-1 bg-electric-blue rounded-full shadow-[0_0_10px_#3b82f6] animate-in fade-in duration-500"></div>
                            )}
                            <div className={clsx(
                                "p-2 rounded-xl transition-all duration-300",
                                isActive ? "bg-electric-blue/10 text-electric-blue scale-110 shadow-inner" : "text-gray-500 group-hover:text-gray-300"
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={clsx(
                                "text-[9px] font-black uppercase tracking-widest mt-1 transition-colors",
                                isActive ? "text-white" : "text-gray-600 group-hover:text-gray-400"
                            )}>
                                {tab.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};
