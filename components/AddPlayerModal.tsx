
import React, { useState, useEffect } from 'react';

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPlayer: (playerId: string) => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose, onAddPlayer }) => {
    const [playerId, setPlayerId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPlayerId('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setError('');
        if (!playerId.trim()) {
            setError('Please enter a Player ID.');
            return;
        }
        onAddPlayer(playerId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Add Player</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold animate-fade-in">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="playerId" className="text-sm font-semibold text-gray-300 mb-1 block">Player ID</label>
                        <input
                            id="playerId"
                            type="text"
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value)}
                            placeholder="Enter the ID of the player to invite"
                            className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="flex space-x-4 mt-6">
                    <button onClick={onClose} className="w-full py-3 bg-gray-700/80 text-white font-semibold rounded-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gray-600">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
                    >
                        Send Invite
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPlayerModal;