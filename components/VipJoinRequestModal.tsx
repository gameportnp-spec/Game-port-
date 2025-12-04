
import React, { useState, useEffect } from 'react';
import type { TournamentMode } from '../types';
import FileUploader from './FileUploader';

interface VipJoinRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    tournamentName: string;
    tournamentMode: TournamentMode;
    onSubmit: (data: any) => void;
}

const VipJoinRequestModal: React.FC<VipJoinRequestModalProps> = ({ isOpen, onClose, tournamentName, tournamentMode, onSubmit }) => {
    // Personal Details
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');

    // Game Details
    const [gameId, setGameId] = useState('');
    const [partnerIds, setPartnerIds] = useState<string[]>([]);

    // Proofs
    const [selfieUrl, setSelfieUrl] = useState('');
    const [profileScreenshotUrl, setProfileScreenshotUrl] = useState('');
    
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFullName('');
            setPhone('');
            setCity('');
            setGameId('');
            setPartnerIds(tournamentMode === 'Duo' ? [''] : tournamentMode === 'Squad' ? ['', '', ''] : []);
            setSelfieUrl('');
            setProfileScreenshotUrl('');
            setError('');
        }
    }, [isOpen, tournamentMode]);

    const handlePartnerIdChange = (index: number, value: string) => {
        const newIds = [...partnerIds];
        newIds[index] = value;
        setPartnerIds(newIds);
    };

    const handleSubmit = () => {
        setError('');
        if (!fullName || !phone || !city || !gameId) {
            setError('Please fill in all personal and game details.');
            return;
        }
        if (partnerIds.some(id => !id.trim())) {
            setError('Please provide Game IDs for all team members.');
            return;
        }
        if (!selfieUrl) {
            setError('Please take/upload a selfie.');
            return;
        }
        if (!profileScreenshotUrl) {
            setError('Please upload your Game Profile screenshot.');
            return;
        }

        onSubmit({
            personalDetails: { fullName, phone, city },
            gameDetails: { gameId, type: tournamentMode, teamMemberIds: partnerIds },
            proofs: { selfieUrl, profileScreenshotUrl }
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border-2 border-yellow-500 rounded-2xl w-full max-w-lg m-4 p-0 shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-slide-in-up max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4 border-b border-yellow-500">
                    <h2 className="text-xl font-orbitron font-bold text-white uppercase tracking-wider text-center">
                        VIP Big Match Entry
                    </h2>
                    <p className="text-xs text-yellow-200 text-center mt-1">Request for: {tournamentName}</p>
                </div>

                <div className="p-6 space-y-6">
                     {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm font-semibold border border-red-500/50">{error}</div>}

                    {/* Section 1: Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-orange-400 font-bold text-sm uppercase border-l-4 border-orange-500 pl-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-yellow-500 outline-none" />
                            <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-yellow-500 outline-none" />
                        </div>
                        <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-yellow-500 outline-none" />
                    </div>

                    {/* Section 2: Game Info */}
                    <div className="space-y-4">
                        <h3 className="text-blue-400 font-bold text-sm uppercase border-l-4 border-blue-500 pl-2">Game Details ({tournamentMode})</h3>
                        <input type="text" placeholder="Your Game ID" value={gameId} onChange={e => setGameId(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none" />
                        
                        {partnerIds.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-400">Teammate Game IDs:</p>
                                {partnerIds.map((pid, idx) => (
                                    <input 
                                        key={idx}
                                        type="text" 
                                        placeholder={`Player ${idx + 2} ID`} 
                                        value={pid} 
                                        onChange={e => handlePartnerIdChange(idx, e.target.value)} 
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 outline-none" 
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section 3: Proofs */}
                    <div className="space-y-4">
                        <h3 className="text-green-400 font-bold text-sm uppercase border-l-4 border-green-500 pl-2">Verification Proofs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FileUploader label="Take Selfie (Required)" onFileSelect={setSelfieUrl} placeholder="Upload Selfie" />
                            <FileUploader label="Game Profile Screenshot" onFileSelect={setProfileScreenshotUrl} placeholder="Upload Profile" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-900 border-t border-gray-700 flex space-x-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-700 text-white font-bold rounded hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded shadow-lg hover:scale-105 transform transition-transform">
                        SEND REQUEST
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VipJoinRequestModal;
