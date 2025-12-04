import React from 'react';
import type { Page } from '../App';

interface BottomNavProps {
    activeTab: Page;
    onNavigate: (page: Page) => void;
}

type NavItemLabel = 'Home' | 'Tournaments' | 'Teams' | 'Profile';

const NavItem: React.FC<{ icon: React.ReactNode; label: NavItemLabel; active?: boolean; onClick: () => void; }> = React.memo(({ icon, label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="flex-1 flex flex-col items-center justify-center text-xs transition-colors duration-300 group pt-2"
        >
            <div className={`relative transition-transform duration-300 group-hover:scale-110 ${active ? 'text-orange-400' : 'text-gray-400 group-hover:text-white'}`}>
                {icon}
            </div>
            <span className={`mt-1 font-semibold ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{label}</span>
            <div className={`mt-1 w-1/2 h-1 rounded-t-full ${active ? 'bg-orange-500' : 'bg-transparent'}`}></div>
        </button>
    );
});

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {

    const navItems: { label: NavItemLabel; icon: React.ReactNode; page: Page }[] = [
        { label: 'Home', icon: <HomeIcon />, page: 'home' },
        { label: 'Tournaments', icon: <TrophyIcon />, page: 'tournaments' },
        { label: 'Teams', icon: <UsersIcon />, page: 'teams' },
        { label: 'Profile', icon: <UserCircleIcon />, page: 'profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900/80 backdrop-blur-lg border-t border-gray-700/50 z-50">
            <div className="flex justify-around items-stretch h-full max-w-lg mx-auto">
                {navItems.map(item => (
                    <NavItem 
                        key={item.label} 
                        icon={item.icon} 
                        label={item.label} 
                        active={activeTab === item.page} 
                        onClick={() => onNavigate(item.page)}
                    />
                ))}
            </div>
        </div>
    );
};

// SVG Icons
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278C12 6.25278 10.8706 5 8.5 5C6.12944 5 5 6.25278 5 6.25278V10C5 17 8.5 19 8.5 19H15.5C15.5 19 19 17 19 10V6.25278C19 6.25278 17.8706 5 15.5 5C13.1294 5 12 6.25278 12 6.25278Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 21H15.5" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-6-6h6z" />
    </svg>
);

const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

export default BottomNav;