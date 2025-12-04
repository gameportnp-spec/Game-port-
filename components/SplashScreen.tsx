
import React, { useState, useEffect } from 'react';

const SplashScreen: React.FC = () => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`w-full h-screen flex flex-col justify-center items-center bg-gray-900 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
            <div className="animate-bounce-in">
                 <img src="https://i.ibb.co/mV3yTq2J/Gemini-Generated-Image-5sfuuu5sfuuu5sfu-removebg-preview.png" alt="App Logo" className="w-48 h-48" />
            </div>
            <div className="mt-4 text-center overflow-hidden">
                <p className="text-3xl text-white font-orbitron animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
                    Game-port Np
                </p>
            </div>
            <div className="absolute bottom-16 flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 <p className="text-sm text-gray-400 mt-4 animate-fade-in" style={{ animationDelay: '1s'}}>Loading assets...</p>
            </div>
        </div>
    );
};

export default SplashScreen;