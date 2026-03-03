import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tags, Wallet, Users } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const baseRoutes = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/expenses', name: 'Expenses', icon: Receipt },
    { path: '/categories', name: 'Categories', icon: Tags },
    { path: '/budgets', name: 'Budgets', icon: Wallet },
];

export const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();

    const routes = [...baseRoutes];
    if (user && (user.role === 'OWNER' || user.role === 'ADMIN')) {
        routes.push({ path: '/members', name: 'Members', icon: Users });
    }

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen hidden md:flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">MATO finance</h1>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
                {routes.map((route) => {
                    const isActive = location.pathname === route.path || (route.path !== '/' && location.pathname.startsWith(route.path));
                    const Icon = route.icon;
                    return (
                        <Link
                            key={route.path}
                            to={route.path}
                            className={clsx(
                                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                isActive
                                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                            )}
                        >
                            <Icon className={clsx('mr-3 h-5 w-5', isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500')} />
                            {route.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
