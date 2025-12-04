
import React from 'react';
import type { User } from '../types';

interface FriendsModalProps {
    isOpen: boolean;
    onClose: () => void;
    friends: string[]; // List of IDs
    allUsers: User[]; // To lookup details
    onUserClick: (id: string) => void;
    onChat: (friend: User) => void;
}

const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose, friends, allUsers, onUserClick, onChat }) => {
    if (!isOpen) return null;
    
    // Filter out valid friend users and sort: Online first, then Offline
    const friendList = allUsers
        .filter(u => friends.includes(u.id))
        .sort((a, b) => {
            if (a.isOnline === b.isOnline) return 0;
            return a.isOnline ? -1 : 1;
        });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-gray-700 animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-white font-bold font-orbitron text-lg">My Friends ({friendList.length})</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2 custom-scrollbar">
                    {friendList.length > 0 ? friendList.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600/50">
                            <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => onUserClick(f.id)}>
                                <div className="relative">
                                     <img src={f.avatar} className="w-12 h-12 rounded-full border border-gray-600 object-cover" />
                                     <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${f.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{f.name}</p>
                                    <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
                                        ID: {f.id}
                                        {f.isOnline && <span className="text-[10px] text-green-400 font-bold ml-1">• Online</span>}
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onChat(f)}
                                className={`ml-2 px-3 py-2 rounded-lg font-bold text-xs flex items-center space-x-1 shadow-lg transform transition-transform active:scale-95 ${f.isOnline ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Message</span>
                            </button>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="bg-gray-700/50 p-4 rounded-full mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-6-6h6z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 font-semibold">No friends added yet.</p>
                            <p className="text-xs text-gray-500 mt-1">Add friends using their Player ID to see them here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendsModal;
