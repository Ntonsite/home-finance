import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { Topbar } from './Topbar';

export const Layout = () => {
    return (
        <div className="flex flex-col h-[100dvh] bg-gray-900 text-gray-100 overflow-hidden relative">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Topbar />
            </div>

            <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative pt-16 pb-20 px-4 sm:px-6">
                <Outlet />
            </main>

            <BottomNavigation />
        </div>
    );
};
