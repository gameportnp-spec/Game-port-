
import React, { useState, useEffect } from 'react';
import type { Tournament, TournamentData } from '../types';
import PullToRefreshContainer from './PullToRefreshContainer';
import BracketDisplay from './BracketDisplay';
import LeaderboardCard from './LeaderboardCard';
import { database, ref, onValue, initDefaultTournamentData } from '../services/mockFirebase';

interface BracketScreenProps {
    tournamentId: string;
    tournaments: Tournament[];
    onBack: () => void;
    onUserClick: (userId: string) => void;
}

type View = 'leaderboard' | 'bracket';

const BracketScreen: React.FC<BracketScreenProps> = ({ tournamentId, tournaments, onBack, onUserClick }) => {
    const [view, setView] = useState<View>('leaderboard');
    const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    useEffect(() => {
        // Initialize mock data if it doesn't exist for this tournament
        initDefaultTournamentData(tournamentId);

        const dataRef = ref(database, `tournaments/${tournamentId}`);
        const unsubscribe = onValue(dataRef, (snapshot) => {
            if (snapshot.val()) {
                setTournamentData(snapshot.val());
            }
        });

        return () => unsubscribe();
    }, [tournamentId]);

    const handleRefresh = () => {
        // In this real-time setup, refresh just waits a bit as data is pushed live
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    if (!tournament) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
                <p>Tournament not found.</p>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-orange-500 rounded">Go Back</button>
            </div>
        );
    }
    
    return (
        <div className="w-full h-screen flex flex-col bg-gray-950">
            <header className="px-4 pt-6 pb-4 z-10 bg-gray-900/80 backdrop-blur-sm sticky top-0 flex items-center space-x-4 border-b border-gray-800">
                <button onClick={onBack} aria-label="Go back" className="bg-gray-800 p-2 rounded-full text-white hover:bg-orange-500 transition-colors border border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                     <h1 className="text-xl font-bold text-white font-orbitron">{tournament.name}</h1>
                     <div className="flex items-center space-x-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <p className="text-xs text-red-400 font-bold tracking-widest uppercase">Live Updates</p>
                     </div>
                </div>
            </header>

            {/* Segmented Control */}
            <div className="p-4 bg-gray-900/50">
                <div className="relative flex w-full bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <div className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-orange-600 to-red-600 rounded-md shadow-lg transition-transform duration-300 ease-in-out ${view === 'leaderboard' ? 'transform translate-x-0' : 'transform translate-x-full'}`}></div>
                    <button onClick={() => setView('leaderboard')} className={`relative z-10 w-1/2 py-2 text-center font-bold text-sm transition-colors ${view === 'leaderboard' ? 'text-white' : 'text-gray-400'}`}>Leaderboard</button>
                    <button onClick={() => setView('bracket')} className={`relative z-10 w-1/2 py-2 text-center font-bold text-sm transition-colors ${view === 'bracket' ? 'text-white' : 'text-gray-400'}`}>Bracket</button>
                </div>
            </div>

            <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1 bg-gray-950">
                <main className="px-4 pb-8 min-h-full">
                    {!tournamentData ? (
                        <div className="flex flex-col items-center justify-center mt-20 space-y-4">
                            <div className="w-10 h-10 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500">Connecting to Realtime Database...</p>
                        </div>
                    ) : (
                        <>
                            {view === 'leaderboard' ? (
                                <div className="animate-fade-in">
                                    <LeaderboardCard entries={tournamentData.leaderboard} onUserClick={onUserClick} />
                                </div>
                            ) : (
                                <div className="animate-fade-in mt-4">
                                    <BracketDisplay matches={tournamentData.matches} />
                                </div>
                            )}
                        </>
                    )}
                </main>
            </PullToRefreshContainer>
        </div>
    );
}

export default BracketScreen;
