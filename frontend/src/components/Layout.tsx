import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100 relative">
            {/* Desktop Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen relative">
                <div className="sticky top-0 z-50">
                    <Topbar />
                </div>

                <main className="flex-1 w-full max-w-4xl mx-auto pt-6 pb-24 px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <BottomNavigation />
                </div>
            </div>
        </div>
    );
};
