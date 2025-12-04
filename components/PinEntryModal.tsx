
import React, { useState, useEffect } from 'react';

interface PinEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PinEntryModal: React.FC<PinEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    
    // Explicitly set the requested PIN code
    const TARGET_PIN = "9810594455";

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
        }
    }, [isOpen]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 10) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleSubmit = () => {
        if (pin === TARGET_PIN) {
            onSuccess();
            onClose();
        } else {
            setError('Access Denied: Invalid PIN');
            setPin('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex justify-center items-center animate-fade-in">
            <div className="w-full max-w-sm p-6 flex flex-col items-center">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-orbitron font-bold text-white tracking-wider">SECURE ACCESS</h2>
                    <p className="text-gray-400 text-sm mt-1">Enter Official Private PIN</p>
                </div>

                {/* PIN Display */}
                <div className="w-full bg-gray-800/50 border border-gray-600 rounded-lg h-14 mb-6 flex items-center justify-center text-2xl font-mono text-white tracking-[0.5em] shadow-inner">
                    {pin.split('').map(() => '•').join('')}
                    {pin.length === 0 && <span className="text-gray-600 tracking-normal text-sm animate-pulse">Enter Code</span>}
                </div>

                {error && <p className="text-red-500 font-bold mb-4 animate-pulse">{error}</p>}

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="h-16 w-16 rounded-full bg-gray-800 text-white text-xl font-bold hover:bg-gray-700 active:bg-orange-500 transition-colors shadow-lg border border-gray-700 mx-auto"
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={onClose} className="h-16 w-16 rounded-full bg-red-900/50 text-red-400 font-bold hover:bg-red-900 flex items-center justify-center mx-auto">
                        ✕
                    </button>
                    <button
                        onClick={() => handleNumberClick('0')}
                        className="h-16 w-16 rounded-full bg-gray-800 text-white text-xl font-bold hover:bg-gray-700 active:bg-orange-500 transition-colors shadow-lg border border-gray-700 mx-auto"
                    >
                        0
                    </button>
                    <button onClick={handleBackspace} className="h-16 w-16 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700 flex items-center justify-center mx-auto">
                        ⌫
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full mt-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold font-orbitron rounded-lg shadow-lg hover:shadow-orange-500/30 transform transition-transform active:scale-95"
                >
                    AUTHENTICATE
                </button>
            </div>
        </div>
    );
};

export default PinEntryModal;
