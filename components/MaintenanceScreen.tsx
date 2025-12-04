
import React, { useState, useEffect } from 'react';
import PinEntryModal from './PinEntryModal';

interface MaintenanceScreenProps {
    onAdminLogin: () => void;
    message?: string;
    targetDate?: Date; // New prop for countdown target
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onAdminLogin, message, targetDate }) => {
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

    // Calculate time left
    useEffect(() => {
        if (!targetDate) return;

        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            if (difference > 0) {
                return {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null; // Time reached
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const tl = calculateTimeLeft();
            setTimeLeft(tl);
            if (!tl) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // Format Opening Text (e.g., "Opening Tomorrow at 10 AM")
    const getOpeningText = () => {
        if (!targetDate) return "";
        const now = new Date();
        const isTomorrow = targetDate.getDate() !== now.getDate();
        return `Opening ${isTomorrow ? 'Tomorrow' : 'Today'} at 10:00 AM NPT`;
    };

    return (
        <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden text-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/40 via-black to-black"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-lg">
                {/* App Logo with Pulse */}
                <div className="w-32 h-32 relative mb-8">
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <img 
                        src="https://i.ibb.co/mV3yTq2J/Gemini-Generated-Image-5sfuuu5sfuuu5sfu-removebg-preview.png" 
                        alt="App Logo" 
                        className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                    />
                </div>

                <h1 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-4 tracking-wider">
                    SYSTEM <span className="text-red-600">OFFLINE</span>
                </h1>
                
                <div className="h-1 w-24 bg-red-600 rounded-full mb-6"></div>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed font-medium">
                    {message || "We are currently improving the system. Please check back later."}
                </p>

                {/* Countdown Section */}
                {timeLeft ? (
                    <div className="bg-gray-900/90 border border-red-500/30 p-6 rounded-xl flex flex-col items-center mb-8 shadow-2xl animate-fade-in">
                        <p className="text-red-400 font-bold uppercase tracking-widest text-xs mb-2">System Reopening In</p>
                        <div className="flex items-end space-x-2 font-mono text-white">
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Hrs</span>
                            </div>
                            <span className="text-2xl text-gray-600 mb-2">:</span>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Min</span>
                            </div>
                            <span className="text-2xl text-gray-600 mb-2">:</span>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-bold text-red-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Sec</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-3 font-semibold border-t border-gray-800 pt-2 w-full text-center">
                            {getOpeningText()}
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-900/80 border border-gray-700 p-4 rounded-lg flex items-center space-x-3 mb-12">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                        <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Status: Maintenance Mode</span>
                    </div>
                )}

                {/* Admin Access */}
                <button 
                    onClick={() => setIsPinModalOpen(true)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors group border border-gray-800 hover:border-gray-600 px-4 py-2 rounded-full"
                >
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-xs uppercase tracking-[0.2em] font-orbitron group-hover:underline">Admin Access</span>
                </button>
            </div>

            <PinEntryModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                onSuccess={onAdminLogin}
            />
        </div>
    );
};

export default MaintenanceScreen;
