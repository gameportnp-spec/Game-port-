
import React from 'react';
import type { User } from '../types';

interface PublicProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    targetUser: User | null;
    onSendFriendRequest: (toId: string) => void;
    onAcceptFriendRequest: (fromId: string) => void;
    onUnfriend: (friendId: string) => void;
}

const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ isOpen, onClose, currentUser, targetUser, onSendFriendRequest, onAcceptFriendRequest, onUnfriend }) => {
    if (!isOpen || !targetUser) return null;

    const isMe = currentUser.id === targetUser.id;
    const isFriend = currentUser.friends?.includes(targetUser.id);
    const hasIncomingRequest = currentUser.friendRequests?.some(r => r.fromId === targetUser.id);
    const hasSentRequest = targetUser.friendRequests?.some(r => r.fromId === currentUser.id);

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border-2 border-gray-600 rounded-2xl w-full max-w-sm m-4 p-0 shadow-2xl relative overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
                
                {/* Banner/Header */}
                <div className="h-24 bg-gradient-to-r from-blue-900 to-purple-900 relative">
                    <button onClick={onClose} className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-20">&times;</button>
                </div>

                {/* Avatar & Basic Info */}
                <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
                    <div className="relative">
                        <img src={targetUser.avatar} alt={targetUser.name} className="w-24 h-24 rounded-full border-4 border-gray-800 object-cover shadow-lg bg-gray-700" />
                        <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-gray-800" title="Online"></div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mt-3 font-orbitron">{targetUser.name}</h2>
                    <p className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded font-mono mt-1">ID: {targetUser.id}</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">LVL {targetUser.level}</span>
                        {targetUser.kycStatus === 'verified' && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center">✓ VERIFIED</span>}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 w-full mt-6 text-center">
                        <div className="bg-gray-700/50 p-2 rounded border border-gray-600">
                            <p className="text-xs text-gray-400 uppercase">Matches</p>
                            <p className="font-bold text-white">{targetUser.joinedTournaments.length}</p>
                        </div>
                        <div className="bg-gray-700/50 p-2 rounded border border-gray-600">
                            <p className="text-xs text-gray-400 uppercase">Wins</p>
                            <p className="font-bold text-yellow-400">{targetUser.joinedTournaments.filter(t => t.status === 'claimed').length}</p>
                        </div>
                        <div className="bg-gray-700/50 p-2 rounded border border-gray-600">
                            <p className="text-xs text-gray-400 uppercase">XP</p>
                            <p className="font-bold text-orange-400">{targetUser.coins}</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {!isMe && (
                        <div className="mt-6 w-full">
                            {isFriend ? (
                                <button onClick={() => onUnfriend(targetUser.id)} className="w-full py-2 bg-gray-700 hover:bg-red-600 text-white font-bold rounded transition-colors text-sm flex items-center justify-center gap-2 group">
                                    <span className="group-hover:hidden">Already Friends</span>
                                    <span className="hidden group-hover:inline">Unfriend</span>
                                </button>
                            ) : hasIncomingRequest ? (
                                <button onClick={() => onAcceptFriendRequest(targetUser.id)} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors text-sm">
                                    Accept Request
                                </button>
                            ) : hasSentRequest ? (
                                <button disabled className="w-full py-2 bg-gray-600 text-gray-300 font-bold rounded cursor-not-allowed text-sm">
                                    Request Sent
                                </button>
                            ) : (
                                <button onClick={() => onSendFriendRequest(targetUser.id)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors text-sm flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                    Add Friend
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfileModal;
