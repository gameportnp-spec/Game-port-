
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Tournament, Team, User, VipJoinRequest } from '../types';
import PullToRefreshContainer from './PullToRefreshContainer';
import RoomDetails from './RoomDetails';
import ClaimWinModal from './ClaimWinModal';
import VipJoinRequestModal from './VipJoinRequestModal';


interface TournamentDetailScreenProps {
    tournamentId: string;
    tournaments: Tournament[];
    teams: Team[];
    user: User;
    allUsers: User[]; 
    onBack: () => void;
    onNavigateToBracket: (tournamentId: string) => void;
    onJoinTournament: (tournament: Tournament) => void;
    onClaimWin: (tournament: Tournament, screenshotUrl: string) => void;
    onRequestVipJoin: (tournament: Tournament, data: any) => void;
    vipJoinRequests: VipJoinRequest[];
    onOpenVipPayment?: (tournament: Tournament) => void; 
}

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, isVip?: boolean }> = ({ label, value, icon, isVip }) => (
    <div className={`p-4 rounded-lg flex items-center space-x-4 ${isVip ? 'bg-yellow-900/30 border border-yellow-500/30' : 'bg-gray-800/50'}`}>
        <div className={isVip ? 'text-yellow-400' : 'text-orange-400'}>{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`text-xl font-bold font-orbitron ${isVip ? 'text-yellow-100' : 'text-white'}`}>{value}</p>
        </div>
    </div>
)

const TournamentDetailScreen: React.FC<TournamentDetailScreenProps> = ({ tournamentId, tournaments, teams, user, allUsers, onBack, onNavigateToBracket, onJoinTournament, onClaimWin, onRequestVipJoin, vipJoinRequests, onOpenVipPayment }) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isVipRequestModalOpen, setIsVipRequestModalOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleRefresh = () => {
        return new Promise(resolve => setTimeout(resolve, 1500));
    };

    const handleConfirmClaim = useCallback((screenshotUrl: string) => {
        if (tournament) {
            onClaimWin(tournament, screenshotUrl);
            setIsClaimModalOpen(false);
        }
    }, [tournament, onClaimWin]);

    const handleVipRequestSubmit = (data: any) => {
        if (tournament) {
            onRequestVipJoin(tournament, data);
        }
    };
    
    const handleJoinClick = async () => {
        if (tournament) {
            setIsJoining(true);
            // Simulate network request visual delay
            await new Promise(resolve => setTimeout(resolve, 800));
            onJoinTournament(tournament);
            setIsJoining(false);
        }
    };
    
    // Logic to fetch participants based on Mode (Solo = Users, Squad = Teams)
    const participants = useMemo(() => {
        if (!tournament?.registeredTeamIds) {
            return [];
        }
        if (tournament.mode === 'Solo') {
             // For Solo, registeredTeamIds contains User IDs
             return allUsers.filter(u => tournament.registeredTeamIds!.includes(u.id));
        } else {
             // For Squad/Duo, registeredTeamIds contains Team IDs
             return teams.filter(team => tournament.registeredTeamIds!.includes(team.id));
        }
    }, [tournament, teams, allUsers]);


    if (!tournament) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900">
                <p>Tournament not found.</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-orange-500 rounded">Go Back</button>
            </div>
        );
    }
    
    // Determine Joined Status more robustly
    const isUserDirectlyJoined = user.joinedTournaments.some(jt => jt.tournamentId === tournament.id);
    const isTeamJoined = tournament.mode !== 'Solo' && user.teamId && tournament.registeredTeamIds?.includes(user.teamId);
    
    const isJoined = isUserDirectlyJoined || !!isTeamJoined;
    
    const isVip = tournament.category === 'VIP Match' || tournament.category === 'VIP Big Match' || tournament.isVip;
    const isBigMatch = tournament.category === 'VIP Big Match';
    
    let displayStatus = 'Upcoming';
    if (tournament.status === 'Finished') displayStatus = 'Finished';
    else if (currentTime >= tournament.startDate) displayStatus = 'Live';

    const showRoomDetails = isJoined && displayStatus === 'Live' && tournament.roomId;

    const getButtonState = () => {
        const isFull = tournament.registeredTeams >= tournament.maxTeams;
        
        if (displayStatus === 'Finished') {
            if (!isJoined) {
                if (isVip) return { text: 'VIEW BRACKET & LEADERBOARD', action: () => onNavigateToBracket(tournament.id), disabled: false, style: 'default' };
                return { text: 'TOURNAMENT FINISHED', action: () => {}, disabled: true, style: 'disabled' };
            }
            // Find status
            const status = user.joinedTournaments.find(jt => jt.tournamentId === tournament.id)?.status;
            switch (status) {
                case 'joined':
                    return { text: 'CLAIM VICTORY', action: () => setIsClaimModalOpen(true), disabled: false, style: 'claim' };
                case 'pending_claim':
                    return { text: 'CLAIM PENDING REVIEW', action: () => {}, disabled: true, style: 'disabled' };
                case 'claimed':
                    return { text: 'PRIZE CLAIMED', action: () => {}, disabled: true, style: 'claimed' };
                case 'rejected_claim':
                     return { text: 'RESUBMIT CLAIM', action: () => setIsClaimModalOpen(true), disabled: false, style: 'rejected' };
                default:
                     if (isVip) return { text: 'VIEW BRACKET & LEADERBOARD', action: () => onNavigateToBracket(tournament.id), disabled: false, style: 'default' };
                     return { text: 'TOURNAMENT FINISHED', action: () => {}, disabled: true, style: 'disabled' };
            }
        }

        if (displayStatus === 'Live') {
             if (isJoined) {
                  if (isVip) return { text: 'VIEW BRACKET & LEADERBOARD', action: () => onNavigateToBracket(tournament.id), disabled: false, style: 'default' };
                  return { text: 'MATCH IN PROGRESS', action: () => {}, disabled: true, style: 'default' };
             }
             if (isVip) return { text: 'VIEW BRACKET & LEADERBOARD', action: () => onNavigateToBracket(tournament.id), disabled: false, style: 'default' };
             return { text: 'REGISTRATION CLOSED (LIVE)', action: () => {}, disabled: true, style: 'disabled' };
        }

        if (isJoined) {
            return { text: 'ALREADY JOINED', action: () => {}, disabled: true, style: 'disabled' };
        }
        
        // SPECIAL CASE FOR VIP BIG MATCH
        if (isBigMatch) {
            const userRequest = vipJoinRequests.find(r => r.tournamentId === tournament.id && r.userId === user.id);
            
            if (userRequest) {
                switch (userRequest.status) {
                    case 'pending':
                        return { text: 'REQUEST PENDING APPROVAL', action: () => {}, disabled: true, style: 'disabled' };
                    case 'accepted_waiting_payment':
                        return { 
                            text: 'SELECTED! CLICK TO PAY ENTRY FEE', 
                            action: () => onOpenVipPayment && onOpenVipPayment(tournament), 
                            disabled: false, 
                            style: 'vip' 
                        };
                    case 'payment_submitted':
                        return { text: 'VERIFYING PAYMENT...', action: () => {}, disabled: true, style: 'disabled' };
                    case 'rejected':
                        return { text: 'REQUEST REJECTED', action: () => {}, disabled: true, style: 'rejected' };
                    case 'completed':
                         return { text: 'ALREADY JOINED', action: () => {}, disabled: true, style: 'disabled' };
                }
            }
            
            if (isFull) {
                return { text: 'TOURNAMENT FULL', action: () => {}, disabled: true, style: 'disabled' };
            }

            return { 
                text: 'REQUEST ENTRY (FORM)', 
                action: () => setIsVipRequestModalOpen(true), 
                disabled: false, 
                style: 'vip' 
            };
        }

        if (isFull) {
            return { text: 'TOURNAMENT FULL', action: () => {}, disabled: true, style: 'disabled' };
        }

        if (isJoining) {
             return { text: 'JOINING...', action: () => {}, disabled: true, style: 'default' };
        }

        return { text: `JOIN NOW (रू${tournament.entryFee})`, action: handleJoinClick, disabled: false, style: isVip ? 'vip' : 'default' };
    };
    
    const { text, action, disabled, style } = getButtonState();

    const getButtonClassName = () => {
        const baseClasses = 'w-full py-4 font-bold rounded-lg ripple transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg';
        switch(style) {
            case 'claim':
                return `${baseClasses} bg-gradient-to-r from-green-500 to-teal-500 text-white`;
            case 'claimed':
                return `${baseClasses} bg-green-700 text-white/80 cursor-not-allowed`;
            case 'rejected':
                return `${baseClasses} bg-gradient-to-r from-red-500 to-yellow-500 text-white`;
            case 'disabled':
                 return `${baseClasses} bg-gray-600 text-gray-400 cursor-not-allowed`;
            case 'vip':
                 return `${baseClasses} bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 text-black shadow-yellow-500/50`;
            case 'default':
            default:
                 return `${baseClasses} bg-gradient-to-r from-orange-500 to-yellow-500 text-white`;
        }
    }

    return (
        <>
            <div className="w-full h-screen flex flex-col bg-gray-900">
                <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1">
                    <header className="relative h-60 flex-shrink-0">
                        <img src={tournament.bannerUrl} alt={tournament.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        <button onClick={onBack} aria-label="Go back" className="absolute top-4 left-4 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-orange-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="absolute bottom-0 left-0 p-4 z-10 w-full">
                            {isVip && <span className="mb-2 inline-block bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded shadow-lg shadow-yellow-500/50">{tournament.category || 'VIP MATCH'}</span>}
                            <h1 className={`text-2xl md:text-3xl font-orbitron font-bold ${isVip ? 'text-yellow-400' : 'text-white'}`}>{tournament.name}</h1>
                            <p className={`text-sm font-bold mt-1 px-3 py-1 rounded-full inline-block ${displayStatus === 'Live' ? 'bg-red-600 animate-pulse' : displayStatus === 'Upcoming' ? 'bg-blue-600' : 'bg-gray-600'}`}>{displayStatus}</p>
                        </div>
                    </header>
                    
                    <main className="p-4 pb-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-in-up" style={{ opacity: 0 }}>
                            <StatCard label="Prize Pool" value={`रू${tournament.prizePool.toLocaleString()}`} icon={<TrophyIcon />} isVip={isVip} />
                            <StatCard label="Entry Fee" value={`रू${tournament.entryFee}`} icon={<TicketIcon />} isVip={isVip} />
                            <StatCard label="Mode" value={tournament.mode} icon={<ModeIcon />} isVip={isVip} />
                            <StatCard label={tournament.mode === 'Solo' ? 'Players' : 'Teams'} value={`${tournament.registeredTeams}/${tournament.maxTeams}`} icon={<UsersIcon />} isVip={isVip} />
                        </div>

                        {showRoomDetails && (
                            <div className="mt-8 animate-slide-in-up" style={{ animationDelay: '50ms', opacity: 0 }}>
                                <RoomDetails roomId={tournament.roomId!} roomPassword={tournament.roomPassword} />
                            </div>
                        )}
                        
                        {isVip && (
                             <div className="mt-6 animate-slide-in-up" style={{ animationDelay: '75ms', opacity: 0 }}>
                                <button onClick={() => onNavigateToBracket(tournament.id)} className="w-full py-3 bg-gray-800 border border-gray-600 text-white font-bold rounded flex items-center justify-center space-x-2 hover:bg-gray-700">
                                    <span>📊 View Live Bracket & Standings</span>
                                </button>
                             </div>
                        )}

                        <div className="mt-8 animate-slide-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
                            <h2 className="text-xl font-bold text-white mb-4 font-orbitron">Registered {tournament.mode === 'Solo' ? 'Players' : 'Teams'}</h2>
                            {participants.length > 0 ? (
                                <div className="space-y-3">
                                    {tournament.mode === 'Solo' ? (
                                        // SOLO MODE DISPLAY
                                        (participants as User[]).map((p, index) => (
                                            <div key={p.id} className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between animate-slide-in-up" style={{ animationDelay: `${index * 100 + 200}ms`, opacity: 0}}>
                                                <div className="flex items-center space-x-3">
                                                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full border border-gray-600 object-cover"/>
                                                    <div>
                                                        <p className="font-bold text-white">{p.name}</p>
                                                        <p className="text-xs text-gray-400">Level {p.level}</p>
                                                    </div>
                                                </div>
                                                {p.id === user.id && <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">YOU</span>}
                                            </div>
                                        ))
                                    ) : (
                                        // SQUAD MODE DISPLAY
                                        (participants as Team[]).map((team, index) => (
                                            <div key={team.id} className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between animate-slide-in-up" style={{ animationDelay: `${index * 100 + 200}ms`, opacity: 0}}>
                                                <div className="flex items-center space-x-3">
                                                    <img src={team.avatar} alt={team.name} className="w-10 h-10 rounded-full object-cover"/>
                                                    <div>
                                                        <p className="font-bold text-white">{team.name}</p>
                                                        <p className="text-xs text-gray-400">Captain: {team.captain.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex -space-x-4">
                                                    {team.members.map(m => <img key={m.id} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-gray-700" title={m.name} />)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 p-4 bg-gray-800/50 rounded-lg">No {tournament.mode === 'Solo' ? 'players' : 'teams'} have registered yet.</p>
                            )}
                        </div>
                        
                        <div className="mt-8 animate-slide-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
                            <h2 className="text-xl font-bold text-white mb-4 font-orbitron">Rules & Format</h2>
                            <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg text-sm leading-relaxed">
                            - All players must adhere to Fair Play policies. <br/>
                            - Game Mode: {tournament.mode} <br/>
                            - Map: Bermuda Remastered <br/>
                            - Format: Single Elimination Bracket <br/>
                            - Teaming up with other squads is strictly prohibited. <br/>
                            - Use of hacks or scripts results in an instant ban.
                            </p>
                        </div>

                        {/* JOIN BUTTON - PLACED AT BOTTOM AS REQUESTED */}
                        <div className="mt-8 mb-4 animate-slide-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
                            <button 
                                onClick={action}
                                disabled={disabled}
                                className={getButtonClassName()}>
                                {text}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-2">
                                By joining, you agree to the Tournament Rules & Guidelines.
                            </p>
                        </div>

                    </main>
                </PullToRefreshContainer>
            </div>

            <ClaimWinModal 
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                onConfirmClaim={handleConfirmClaim}
            />

            <VipJoinRequestModal 
                isOpen={isVipRequestModalOpen}
                onClose={() => setIsVipRequestModalOpen(false)}
                tournamentName={tournament.name}
                tournamentMode={tournament.mode}
                onSubmit={handleVipRequestSubmit}
            />
        </>
    );
};

const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.184-1.268-.5-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.184-1.268.5-1.857m0 0a5.002 5.002 0 019 0m0 0a5 5 0 005 0m-9 0a5.002 5.002 0 01-9 0" /></svg>;
const ModeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>


export default TournamentDetailScreen;
