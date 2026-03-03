import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, PieChart, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Transactions', path: '/expenses', icon: Receipt },
    { name: 'Reports', path: '/budgets', icon: PieChart },
];

export const BottomNavigation = () => {
    const location = useLocation();
    const { user } = useAuth();

    const tabs = [...navigation];
    if (user && (user.role === 'OWNER' || user.role === 'ADMIN')) {
        tabs.push({ name: 'Profile', path: '/members', icon: User });
    } else {
        // As a fallback for regular members, maybe we route to a read-only profile view,
        // but for now, we just skip it or add a dummy link for layout balance.
        tabs.push({ name: 'Profile', path: '/', icon: User });
    }

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-gray-800 border-t border-gray-700 shadow-lg">
            <div className="grid h-full w-full mx-auto" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.name + tab.path}
                            to={tab.path}
                            className="inline-flex flex-col items-center justify-center px-2 group active:scale-95 transition-transform"
                        >
                            <div className={clsx(
                                "p-1.5 rounded-full mb-1 transition-colors",
                                isActive ? "bg-primary-500/20 text-primary-400" : "text-gray-400 group-hover:text-gray-300"
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={clsx(
                                "text-[10px] font-medium transition-colors",
                                isActive ? "text-primary-400" : "text-gray-400 group-hover:text-gray-300"
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
