
import React, { useState, useEffect } from 'react';

interface OrganizeTournamentDetails {
    gameName: string;
    name: string;
    contact: string;
    description: string;
    prizePool: number;
    entryFee: number;
    startDate: string;
}

interface OrganizeTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (details: OrganizeTournamentDetails) => void;
}

const OrganizeTournamentModal: React.FC<OrganizeTournamentModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [gameName, setGameName] = useState('Free Fire');
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [description, setDescription] = useState('');
    const [prizePool, setPrizePool] = useState('');
    const [entryFee, setEntryFee] = useState('');
    const [startDate, setStartDate] = useState('');
    
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setGameName('Free Fire');
            setName('');
            setContact('');
            setDescription('');
            setPrizePool('');
            setEntryFee('');
            setStartDate('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setError('');
        if (!gameName.trim()) {
             setError('Please enter the Game Name.');
             return;
        }
        if (name.trim().length < 5) {
            setError('Tournament name must be at least 5 characters.');
            return;
        }
        if (contact.trim().length < 10) {
            setError('Please provide valid contact info.');
            return;
        }
        if (!prizePool || parseInt(prizePool) <= 0) {
             setError('Please enter a valid Prize Pool.');
             return;
        }
        if (!startDate) {
             setError('Please select a start date.');
             return;
        }

        onConfirm({ 
            gameName,
            name, 
            contact, 
            description,
            prizePool: parseInt(prizePool),
            entryFee: parseInt(entryFee) || 0,
            startDate: new Date(startDate).toISOString()
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border-2 border-yellow-500/50 rounded-2xl w-full max-w-lg m-4 p-0 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-slide-in-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-800 to-gray-900 p-6 border-b border-yellow-600/30">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-orbitron font-bold text-white uppercase tracking-wider">
                                Organize Tournament
                            </h2>
                            <p className="text-xs text-yellow-500 font-semibold mt-1">HOST YOUR OWN BATTLE</p>
                        </div>
                        <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 flex items-start space-x-3">
                        <span className="text-2xl">ℹ️</span>
                        <p className="text-sm text-blue-200">
                            Submit your tournament details below. Our Admin will review it and set a <strong>Hosting Fee</strong>. Once approved & paid, your tournament goes LIVE!
                        </p>
                    </div>

                    {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold border border-red-500/30 animate-fade-in">{error}</div>}

                    <div className="space-y-4">
                        {/* Game Selection */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Game Name</label>
                            <input
                                type="text"
                                value={gameName}
                                onChange={(e) => setGameName(e.target.value)}
                                placeholder="e.g. Free Fire, PUBG Mobile"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                            />
                        </div>

                        {/* Tournament Name */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Tournament Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Weekend Warrior Championship"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                            />
                        </div>
                        
                        {/* Financials */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Prize Pool (Rs)</label>
                                <input
                                    type="number"
                                    value={prizePool}
                                    onChange={(e) => setPrizePool(e.target.value)}
                                    placeholder="5000"
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                 <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Entry Fee (Rs)</label>
                                 <input
                                    type="number"
                                    value={entryFee}
                                    onChange={(e) => setEntryFee(e.target.value)}
                                    placeholder="100"
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                                 />
                            </div>
                        </div>

                        {/* Schedule */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Start Date & Time</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                            />
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Organizer Contact</label>
                            <input
                                type="text"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                placeholder="Phone / WhatsApp / Email"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Additional Info (Rules/Map)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Bermuda Map, Squad Mode, No Emotes allowed..."
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-900 border-t border-gray-800 flex space-x-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-800 text-gray-300 font-bold rounded-lg hover:bg-gray-700 transition-colors">
                        CANCEL
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:shadow-yellow-500/20 transform transition-transform hover:scale-105 active:scale-95"
                    >
                        SUBMIT REQUEST
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizeTournamentModal;
