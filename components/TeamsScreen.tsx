
import React, { useState } from 'react';
import type { Team, User } from '../types';
import PullToRefreshContainer from './PullToRefreshContainer';
import CreateTeamModal from './CreateTeamModal';

interface TeamsScreenProps {
    user: User;
    teams: Team[];
    onNavigateToManageTeam: (teamId: string) => void;
    onCreateTeam: (teamName: string, avatarUrl: string) => void;
    onJoinTeam: (teamId: string) => void;
}

const TeamCard: React.FC<{ team: Team, onClick: () => void, index: number }> = ({ team, onClick, index }) => (
    <div 
        onClick={onClick}
        className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 rounded-xl flex items-center justify-between border border-gray-700 shadow-lg transform transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-slide-in-up"
        style={{ animationDelay: `${index * 80}ms`, opacity: 0}}
    >
        <div className="flex items-center space-x-4">
            <div className="relative">
                <img src={team.avatar} alt={team.name} className="w-14 h-14 rounded-full object-cover border-2 border-orange-500" />
                <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            </div>
            <div>
                <p className="font-bold text-white text-lg font-orbitron tracking-wide">{team.name}</p>
                <p className="text-xs text-gray-400">Captain: <span className="text-gray-300">{team.captain.name}</span></p>
                <p className="text-xs text-orange-400 font-bold mt-1">{team.members.length} / 4 Members</p>
            </div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-full">
            <ChevronRightIcon />
        </div>
    </div>
);

const JoinableTeamCard: React.FC<{ team: Team, onJoin: () => void, index: number }> = ({ team, onJoin, index }) => {
    const isFull = team.members.length >= 4;
    return (
        <div 
            className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between border border-gray-700 animate-slide-in-up hover:bg-gray-800 transition-colors"
            style={{ animationDelay: `${index * 80}ms`, opacity: 0}}
        >
            <div className="flex items-center space-x-3">
                <img src={team.avatar} alt={team.name} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                <div>
                    <p className="font-bold text-white font-orbitron text-sm">{team.name}</p>
                    <p className="text-[10px] text-gray-400 flex items-center">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        {team.members.length}/4
                    </p>
                </div>
            </div>
            <button 
                onClick={onJoin}
                disabled={isFull}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isFull ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg hover:shadow-green-500/20'}`}
            >
                {isFull ? 'FULL' : 'JOIN (रू5)'}
            </button>
        </div>
    );
};


const TeamsScreen: React.FC<TeamsScreenProps> = ({ user, teams, onNavigateToManageTeam, onCreateTeam, onJoinTeam }) => {
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    
    const handleRefresh = () => {
        return new Promise(resolve => setTimeout(resolve, 1500));
    };

    const userTeam = teams.find(team => team.id === user.teamId);
    // Filter teams: Not my team, and created by valid users (basic check)
    const availableTeams = teams.filter(team => team.id !== user.teamId);

    return (
        <>
            <div className="w-full h-screen flex flex-col bg-gray-900 pb-20">
                <header className="px-4 pt-6 pb-4 z-10 bg-gray-900/80 backdrop-blur-sm sticky top-0 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-white font-orbitron text-center">Team Center</h1>
                </header>

                <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1">
                    <main className="px-4 py-4">
                        {/* MY TEAM SECTION */}
                        <div className="mb-8">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Your Team</h2>
                            {userTeam ? (
                                <TeamCard team={userTeam} onClick={() => onNavigateToManageTeam(userTeam.id)} index={0} />
                            ) : (
                                <div className="p-6 text-center bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <UsersIcon className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <p className="text-gray-300 font-semibold mb-1">No Team Assigned</p>
                                    <p className="text-xs text-gray-500 mb-4">Create your own squad or join an existing one.</p>
                                    <button 
                                        onClick={() => setIsCreateTeamModalOpen(true)}
                                        className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/30 transform transition-all active:scale-95 text-sm"
                                    >
                                        Create Squad (रू20)
                                    </button>
                                </div>
                            )}
                        </div>
                       
                        {/* AVAILABLE TEAMS */}
                        <div>
                            <div className="flex justify-between items-end mb-3 px-1">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recruiting Squads</h2>
                                <span className="text-[10px] text-gray-500">{availableTeams.length} available</span>
                            </div>
                            
                             {availableTeams.length > 0 ? (
                                <div className="space-y-3">
                                    {availableTeams.map((team, index) => (
                                        <JoinableTeamCard 
                                            key={team.id} 
                                            team={team} 
                                            onJoin={() => onJoinTeam(team.id)}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-800/20 rounded-lg">
                                    <p className="text-gray-500 text-sm">No other teams available right now.</p>
                                </div>
                            )}
                        </div>

                    </main>
                </PullToRefreshContainer>
            </div>
            
            <CreateTeamModal 
                isOpen={isCreateTeamModalOpen}
                onClose={() => setIsCreateTeamModalOpen(false)}
                onCreateTeam={onCreateTeam}
            />
        </>
    );
};

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-6-6h6z" />
    </svg>
);

export default TeamsScreen;
