import React, { useState, useEffect } from 'react';

const MarketStatus: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [nepalTime, setNepalTime] = useState('');

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            
            // Nepal is UTC+5:45
            const utcOffset = now.getTimezoneOffset() * 60000; // local offset in milliseconds
            const utc = now.getTime() + utcOffset;
            const nepalOffset = (5 * 3600 + 45 * 60) * 1000;
            const nepalDate = new Date(utc + nepalOffset);

            const hours = nepalDate.getHours();
            const minutes = nepalDate.getMinutes();
            
            // Format time for display (e.g., 03:45 PM)
            const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedTime = `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm} NPT`;
            setNepalTime(formattedTime);
            
            // Check if between 10 AM and 5 PM (17:00)
            const isMarketOpen = hours >= 10 && hours < 17;
            setIsOpen(isMarketOpen);
        };

        checkStatus(); // Initial check
        const intervalId = setInterval(checkStatus, 60000); // Check every minute

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const statusColor = isOpen ? 'bg-green-500' : 'bg-red-500';
    const statusText = isOpen ? "We're Open" : "We're Closed";

    return (
        <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2.5 h-2.5 rounded-full ${statusColor} animate-pulse`}></div>
            <div className="text-xs">
                <span className={`font-bold ${isOpen ? 'text-green-400' : 'text-red-400'}`}>{statusText}</span>
                <span className="text-gray-400 ml-2">({nepalTime})</span>
            </div>
        </div>
    );
};

export default MarketStatus;
