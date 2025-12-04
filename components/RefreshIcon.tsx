
import React from 'react';

const RefreshIcon: React.FC<{ spinning: boolean, pullProgress: number }> = ({ spinning, pullProgress }) => {
    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Spinning border */}
            <div 
                className={`absolute inset-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent ${spinning ? 'animate-spin-logo' : ''}`}
                style={{ transform: `rotate(${pullProgress * 360}deg)`}}
            />
            {/* Inner Logo */}
            <div className="relative z-10 text-center w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full">
                 <img src="https://i.ibb.co/mV3yTq2J/Gemini-Generated-Image-5sfuuu5sfuuu5sfu-removebg-preview.png" alt="App Logo" className="w-8 h-8" />
            </div>
        </div>
    );
};

export default RefreshIcon;
