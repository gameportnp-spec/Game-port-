
import React from 'react';
import type { User } from '../types';

interface BanScreenProps {
    user: User;
    onLogout: () => void;
}

const BanScreen: React.FC<BanScreenProps> = ({ user, onLogout }) => {
    return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                
                {/* Ban Icon */}
                <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-6 border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-bounce-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>

                <h1 className="text-4xl font-orbitron font-bold text-white mb-2 tracking-wider text-center">ACCESS DENIED</h1>
                <p className="text-red-500 font-bold tracking-widest uppercase mb-8">Account Suspended</p>

                {/* Notice Board Popup */}
                <div className="w-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl animate-slide-in-up transform transition-all hover:scale-[1.02]">
                    <div className="bg-gradient-to-r from-red-900 to-gray-900 p-4 border-b border-red-900/50 flex items-center space-x-2">
                        <span className="text-xl">📢</span>
                        <h2 className="text-lg font-bold font-orbitron text-white">ADMIN NOTICE</h2>
                    </div>
                    
                    <div className="p-6 bg-gray-800/50">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-2">Reason for Suspension:</p>
                        <div className="bg-black/40 p-4 rounded-lg border-l-2 border-red-500">
                            <p className="text-white text-sm leading-relaxed italic">
                                "{user.banReason || 'Violation of Community Guidelines. Please contact support for more details.'}"
                            </p>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-700/50 flex flex-col space-y-3">
                             <p className="text-xs text-center text-gray-500">If you believe this is a mistake, please contact support via email.</p>
                             <button 
                                onClick={onLogout}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-red-600/20"
                             >
                                LOGOUT
                             </button>
                        </div>
                    </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-8 font-mono">ID: {user.id}</p>
            </div>
        </div>
    );
};

export default BanScreen;
