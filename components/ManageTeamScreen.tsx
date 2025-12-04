
import React, { useState } from 'react';
import type { Team, User } from '../types';
import PullToRefreshContainer from './PullToRefreshContainer';
import AddPlayerModal from './AddPlayerModal';
import ConfirmationModal from './ConfirmationModal';

interface ManageTeamScreenProps {
    team: Team;
    user: User;
    onBack: () => void;
    onLeaveTeam: () => void;
    onAddPlayer: (playerId: string) => void;
    onUserClick: (userId: string) => void;
}

const ManageTeamScreen: React.FC<ManageTeamScreenProps> = ({ team, user, onBack, onLeaveTeam, onAddPlayer, onUserClick }) => {
    const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
    const [isLeaveConfirmModalOpen, setIsLeaveConfirmModalOpen] = useState(false);

    const handleRefresh = () => {
        return new Promise(resolve => setTimeout(resolve, 1500));
    };

    const isCaptain = user.id === team.captain.id;

    return (
        <>
            <div className="w-full h-screen flex flex-col bg-gray-900">
                 <header className="px-4 pt-6 pb-4 z-10 bg-gray-900/80 backdrop-blur-sm sticky top-0 flex items-center space-x-4 border-b border-gray-800">
                    <button onClick={onBack} aria-label="Go back" className="bg-gray-800 p-2 rounded-full text-white hover:bg-orange-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white font-orbitron uppercase tracking-wide">{team.name}</h1>
                        <p className="text-xs text-green-400 font-bold">● Active Squad</p>
                    </div>
                </header>

                <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1 pb-24">
                    <main className="p-4">
                         {/* Team Header Card */}
                         <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-xl flex flex-col items-center mb-8 border border-gray-700 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                            <img src={team.avatar} alt={team.name} className="w-24 h-24 rounded-full border-4 border-gray-700 shadow-lg mb-3 object-cover" />
                            <h2 className="text-2xl font-bold font-orbitron text-white">{team.name}</h2>
                            <div className="flex items-center mt-2 space-x-2 bg-gray-800 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => onUserClick(team.captain.id)}>
                                <span className="text-xs text-gray-400 uppercase font-bold">Captain:</span>
                                <span className="text-sm text-yellow-400 font-bold">{team.captain.name}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Squad Members</h3>
                            <span className="text-xs font-mono bg-gray-800 text-white px-2 py-1 rounded">{team.members.length}/4</span>
                        </div>

                        <div className="space-y-3">
                            {team.members.map((member, index) => (
                                <div key={member.id} onClick={() => onUserClick(member.id)} className="bg-gray-800/60 p-3 rounded-xl flex items-center justify-between animate-slide-in-up border border-gray-700/50 cursor-pointer hover:bg-gray-700 transition-colors" style={{ animationDelay: `${index * 100}ms`, opacity: 0}}>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-gray-600"/>
                                            <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
                                                <div className={`w-3 h-3 rounded-full ${member.id === team.captain.id ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${member.id === user.id ? 'text-orange-400' : 'text-white'}`}>
                                                {member.name} {member.id === user.id && '(You)'}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-mono">ID: {member.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                    {member.id === team.captain.id && (
                                        <div className="flex flex-col items-center">
                                            <span className="text-lg">👑</span>
                                            <span className="text-[8px] font-bold text-yellow-500 uppercase">Leader</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {/* Empty Slots */}
                            {[...Array(4 - team.members.length)].map((_, i) => (
                                <div key={`empty-${i}`} className="bg-gray-800/30 p-3 rounded-xl flex items-center space-x-4 border border-dashed border-gray-700 opacity-50">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                        <span className="text-gray-600 text-xl">+</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-600">Empty Slot</p>
                                </div>
                            ))}
                        </div>
                    </main>
                </PullToRefreshContainer>

                <div className="sticky bottom-0 left-0 right-0 p-4 bg-gray-900/90 backdrop-blur-md border-t border-gray-700 flex space-x-4">
                    <button
                        onClick={() => setIsLeaveConfirmModalOpen(true)}
                        className="flex-1 py-3 bg-red-600/20 text-red-400 font-bold rounded-lg border border-red-600/50 hover:bg-red-600 hover:text-white transition-all uppercase text-xs tracking-wider"
                    >
                        {isCaptain ? 'Disband Team' : 'Leave Team'}
                    </button>
                    {isCaptain && team.members.length < 4 && (
                         <button
                            onClick={() => setIsAddPlayerModalOpen(true)}
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-500 transition-all uppercase text-xs tracking-wider"
                        >
                            Invite Player
                        </button>
                    )}
                </div>
            </div>

            <AddPlayerModal 
                isOpen={isAddPlayerModalOpen}
                onClose={() => setIsAddPlayerModalOpen(false)}
                onAddPlayer={onAddPlayer}
            />

            <ConfirmationModal 
                isOpen={isLeaveConfirmModalOpen}
                onClose={() => setIsLeaveConfirmModalOpen(false)}
                onConfirm={onLeaveTeam}
                title={isCaptain ? "Disband Team?" : "Leave Team?"}
                message={isCaptain ? "As the Captain, leaving will disband the team permanently. Are you sure?" : `Are you sure you want to leave ${team.name}?`}
                confirmText={isCaptain ? "Disband" : "Leave"}
                cancelText="Stay"
            />
        </>
    );
};

export default ManageTeamScreen;
