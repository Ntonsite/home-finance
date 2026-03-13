import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Tags, Wallet, Users, Settings } from 'lucide-react';
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
        routes.push({ path: '/members', name: 'Households', icon: Users });
    }
    
    if (user?.isSuperAdmin) {
        routes.push({ path: '/admin/households', name: 'SuperAdmin', icon: Settings });
    }

    return (
        <div className="w-68 bg-navy-900 border-r border-gray-800 h-screen hidden md:flex flex-col sticky top-0">
            <div className="h-20 flex items-center px-8">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
                        <Wallet className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
                        Home<span className="text-electric-blue">Portal</span>
                    </h1>
                </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-4">Management</p>
                {routes.map((route) => {
                    const isActive = location.pathname === route.path || (route.path !== '/' && location.pathname.startsWith(route.path));
                    const Icon = route.icon;
                    return (
                        <Link
                            key={route.path}
                            to={route.path}
                            className={clsx(
                                'flex items-center px-4 py-3 text-xs font-bold rounded-xl transition-all group duration-300',
                                isActive
                                    ? 'bg-electric-blue/10 text-white shadow-inner border border-electric-blue/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <Icon className={clsx('mr-3 h-5 w-5 transition-colors', isActive ? 'text-electric-blue' : 'text-gray-500 group-hover:text-gray-300')} />
                            <span className="uppercase tracking-widest">{route.name}</span>
                            {isActive && <div className="ml-auto w-1 h-4 bg-electric-blue rounded-full shadow-[0_0_8px_#3b82f6]"></div>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <div className="premium-card p-4 bg-navy-950/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-electric-blue/20 border border-electric-blue/30 flex items-center justify-center text-electric-blue font-black uppercase text-xs">
                            {user?.username.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate uppercase">{user?.username}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
