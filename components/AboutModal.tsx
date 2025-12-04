
import React from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const buildDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-orbitron font-bold text-white">About Game-Port Np</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="text-center text-gray-300 space-y-6 py-4">
                    <img src="https://i.ibb.co/mV3yTq2J/Gemini-Generated-Image-5sfuuu5sfuuu5sfu-removebg-preview.png" alt="App Logo" className="w-24 h-24 mx-auto" />

                    <div className="space-y-2">
                         <div>
                            <p className="font-semibold text-gray-400">Version</p>
                            <p className="text-white font-mono">1.0.0</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-400">Build Date</p>
                            <p className="text-white font-mono">{buildDate}</p>
                        </div>
                    </div>
                   
                    <p className="text-sm text-gray-500 pt-4">
                        Made with ❤️ for the gaming community.
                    </p>
                </div>

                <div className="mt-6">
                    <button onClick={onClose} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;