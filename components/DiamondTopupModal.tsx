

import React, { useState, useEffect } from 'react';
import type { Server } from '../types';

interface DiamondTopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (playerId: string, selectedPackage: { diamonds: number; price: number; }, server: Server) => void;
    balance: number;
}

const DIAMOND_PACKAGES = [
    { diamonds: 100, price: 100 },
    { diamonds: 310, price: 280 },
    { diamonds: 520, price: 450 },
    { diamonds: 1060, price: 880 },
    { diamonds: 2180, price: 1750 },
    { diamonds: 5600, price: 4400 },
];

const DiamondTopupModal: React.FC<DiamondTopupModalProps> = ({ isOpen, onClose, onConfirm, balance }) => {
    const [playerId, setPlayerId] = useState('');
    const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPlayerId('');
            setSelectedPackageIndex(null);
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setError('');
        if (selectedPackageIndex === null) {
            setError('Please select a diamond package.');
            return;
        }
        if (!playerId.trim() || !/^\d{5,}$/.test(playerId.trim())) {
            setError('Please enter a valid numeric Player ID.');
            return;
        }

        const selectedPackage = DIAMOND_PACKAGES[selectedPackageIndex];
        if (balance < selectedPackage.price) {
            setError('Insufficient balance for this package.');
            return;
        }

        onConfirm(playerId, selectedPackage, 'BD');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 w-full rounded-2xl m-4 max-w-md shadow-2xl animate-slide-in-up flex flex-col max-h-[90vh]" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 pb-4 flex-shrink-0 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-orbitron font-bold text-white">Garena Instant Top-up</h2>
                        <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Connected to Garena Top-up Center Nepal for secure, instant transactions.</p>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <p className="text-sm text-gray-400 mb-4">Your Balance: <span className="font-bold text-yellow-400">रू{balance.toLocaleString()}</span></p>

                    {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold animate-fade-in">{error}</div>}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="player-id" className="text-sm font-semibold text-gray-300 mb-1 block">Bangladesh Server Player ID</label>
                            <input
                                id="player-id"
                                type="text"
                                value={playerId}
                                onChange={(e) => setPlayerId(e.target.value)}
                                placeholder="Enter numeric game ID"
                                className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                        </div>

                        <div>
                             <label className="text-sm font-semibold text-gray-300 mb-2 block">Select Package</label>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {DIAMOND_PACKAGES.map((pkg, index) => {
                                    const isSelected = selectedPackageIndex === index;
                                    const canAfford = balance >= pkg.price;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedPackageIndex(index)}
                                            disabled={!canAfford}
                                            className={`p-3 text-center rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-700 disabled:scale-100 ${isSelected ? 'border-orange-500 bg-orange-500/20 scale-105' : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'}`}
                                        >
                                            <p className="font-bold text-white flex items-center justify-center space-x-1">
                                                <DiamondIcon />
                                                <span>{pkg.diamonds}</span>
                                            </p>
                                            <p className={`text-xs font-semibold mt-1 ${canAfford ? 'text-yellow-400' : 'text-gray-500'}`}>रू{pkg.price}</p>
                                        </button>
                                    );
                                })}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 flex-shrink-0 border-t border-gray-700 bg-gray-800/90 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={onClose} className="w-full py-3 bg-transparent border border-gray-600 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 hover:bg-gray-700 active:scale-95">
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
                        >
                            Confirm Top-up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DiamondIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 9.5l10 12.5L22 9.5 12 2z" /></svg>;

export default DiamondTopupModal;