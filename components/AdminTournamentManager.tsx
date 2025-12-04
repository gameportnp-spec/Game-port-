
import React, { useState, useEffect } from 'react';
import { database, ref, set, onValue, initDefaultTournamentData } from '../services/mockFirebase';
import type { BracketMatch, LeaderboardEntry, TournamentData } from '../types';

interface AdminTournamentManagerProps {
    tournamentId: string;
    joinedPlayers?: string[];
}

const AdminTournamentManager: React.FC<AdminTournamentManagerProps> = ({ tournamentId, joinedPlayers = [] }) => {
    const [data, setData] = useState<TournamentData | null>(null);
    const [activeTab, setActiveTab] = useState<'bracket' | 'leaderboard'>('bracket');

    useEffect(() => {
        initDefaultTournamentData(tournamentId); // Ensure data exists
        const dataRef = ref(database, `tournaments/${tournamentId}`);
        const unsubscribe = onValue(dataRef, (snapshot) => {
            if (snapshot.val()) {
                setData(snapshot.val());
            }
        });
        return () => unsubscribe();
    }, [tournamentId]);

    const updateMatch = (matchId: string, updates: Partial<BracketMatch>) => {
        if (!data) return;
        const updatedMatches = {
            ...data.matches,
            [matchId]: { ...data.matches[matchId], ...updates }
        };
        
        // Auto-advance logic
        const match = updatedMatches[matchId];
        if (match.winner && match.nextMatchId) {
             const nextMatch = updatedMatches[match.nextMatchId];
             const winnerName = match.winner === 'player1' ? match.player1 : match.player2;
             
             // Determine if this match feeds into player1 or player2 of next match
             // Simplification for demo: QF1/QF2 -> Semi1, QF3/QF4 -> Semi2
             let targetSlot: 'player1' | 'player2' = 'player1';
             if (matchId === 'qf2' || matchId === 'qf4' || matchId === 'semi2') targetSlot = 'player2';
             
             updatedMatches[match.nextMatchId] = {
                 ...nextMatch,
                 [targetSlot]: winnerName
             };
        }

        set(ref(database, `tournaments/${tournamentId}`), { ...data, matches: updatedMatches });
    };

    const updateLeaderboardEntry = (id: string, updates: Partial<LeaderboardEntry>) => {
        if (!data) return;
        const updatedLeaderboard = data.leaderboard.map(entry => 
            entry.id === id ? { ...entry, ...updates } : entry
        );
        set(ref(database, `tournaments/${tournamentId}`), { ...data, leaderboard: updatedLeaderboard });
    };

    const autoFillBracket = () => {
        if (!data || joinedPlayers.length === 0) {
            alert('No joined players found to auto-fill.');
            return;
        }
        
        if (window.confirm("Overwrite current bracket with joined players? This cannot be undone.")) {
            const matches = { ...data.matches };
            const qfMatches = ['qf1', 'qf2', 'qf3', 'qf4'];
            let playerIndex = 0;

            qfMatches.forEach(matchId => {
                if (matches[matchId]) {
                    matches[matchId].player1 = joinedPlayers[playerIndex] || 'TBD';
                    matches[matchId].player2 = joinedPlayers[playerIndex + 1] || 'TBD';
                    playerIndex += 2;
                }
            });
            
            // Populate leaderboard as well
            const newLeaderboard: LeaderboardEntry[] = joinedPlayers.map((player, idx) => ({
                id: `p_${idx}`,
                rank: idx + 1,
                username: player,
                avatar: `https://i.pravatar.cc/150?u=${player}`,
                score: 0,
                coins: 0
            }));

            // Keep existing size or expand
            const finalLeaderboard = newLeaderboard.length > 0 ? newLeaderboard : data.leaderboard;

            set(ref(database, `tournaments/${tournamentId}`), { 
                matches, 
                leaderboard: finalLeaderboard 
            });
            alert('Bracket & Leaderboard updated with joined players!');
        }
    };

    if (!data) return <div className="text-white p-4">Loading Data...</div>;

    return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="text-xl font-bold text-white">🔴 Live Tournament Manager</h2>
                {activeTab === 'bracket' && (
                    <button onClick={autoFillBracket} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded shadow transition-colors">
                        Auto-Fill from Participants ({joinedPlayers.length})
                    </button>
                )}
            </div>
            
            <div className="flex space-x-2 mb-4 shrink-0">
                <button onClick={() => setActiveTab('bracket')} className={`px-4 py-2 rounded text-sm font-bold transition-colors ${activeTab === 'bracket' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>Bracket Scores</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-2 rounded text-sm font-bold transition-colors ${activeTab === 'leaderboard' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}>Leaderboard</button>
            </div>

            <div className="space-y-4 bg-gray-900/50 p-2 rounded border border-gray-700/50">
                {activeTab === 'bracket' && (
                    <div className="space-y-4">
                        {Object.values(data.matches).map((match: BracketMatch) => (
                            <div key={match.id} className="bg-gray-900 p-3 rounded border border-gray-700 flex flex-col md:flex-row items-center md:justify-between gap-4 shadow-sm">
                                <span className="text-xs font-mono text-orange-500 font-bold w-12">{match.id.toUpperCase()}</span>
                                
                                {/* Player 1 Input */}
                                <div className="flex items-center space-x-2">
                                    <input 
                                        value={match.player1} 
                                        onChange={(e) => updateMatch(match.id, { player1: e.target.value })}
                                        className="bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm w-32 focus:border-orange-500 outline-none"
                                        placeholder="Player 1"
                                    />
                                    <input 
                                        type="number"
                                        value={match.score1}
                                        onChange={(e) => updateMatch(match.id, { score1: parseInt(e.target.value) || 0 })}
                                        className="bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm w-16 text-center focus:border-orange-500 outline-none font-mono font-bold"
                                    />
                                </div>

                                <span className="text-red-500 font-bold text-xs">VS</span>

                                 {/* Player 2 Input */}
                                 <div className="flex items-center space-x-2">
                                    <input 
                                        type="number"
                                        value={match.score2}
                                        onChange={(e) => updateMatch(match.id, { score2: parseInt(e.target.value) || 0 })}
                                        className="bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm w-16 text-center focus:border-orange-500 outline-none font-mono font-bold"
                                    />
                                    <input 
                                        value={match.player2} 
                                        onChange={(e) => updateMatch(match.id, { player2: e.target.value })}
                                        className="bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm w-32 focus:border-orange-500 outline-none"
                                        placeholder="Player 2"
                                    />
                                </div>

                                {/* Winner Actions */}
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => updateMatch(match.id, { winner: 'player1' })}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${match.winner === 'player1' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                    >
                                        P1 WIN
                                    </button>
                                    <button 
                                        onClick={() => updateMatch(match.id, { winner: 'player2' })}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${match.winner === 'player2' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                    >
                                        P2 WIN
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="space-y-2">
                        {data.leaderboard.map((entry) => (
                            <div key={entry.id} className="bg-gray-900 p-2 rounded border border-gray-700 flex items-center gap-2 text-sm hover:bg-gray-800 transition-colors">
                                <span className="font-mono text-gray-500 w-6 font-bold">#{entry.rank}</span>
                                <img src={entry.avatar} className="w-8 h-8 rounded-full border border-gray-600" />
                                <input 
                                    value={entry.username}
                                    onChange={(e) => updateLeaderboardEntry(entry.id, { username: e.target.value })}
                                    className="bg-gray-800 border border-gray-600 rounded p-2 text-white flex-1 focus:border-blue-500 outline-none"
                                />
                                 <input 
                                    type="number"
                                    value={entry.score}
                                    onChange={(e) => updateLeaderboardEntry(entry.id, { score: parseInt(e.target.value) || 0 })}
                                    className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-20 text-center font-mono focus:border-blue-500 outline-none"
                                    placeholder="Score"
                                />
                                <input 
                                    type="number"
                                    value={entry.coins}
                                    onChange={(e) => updateLeaderboardEntry(entry.id, { coins: parseInt(e.target.value) || 0 })}
                                    className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-16 text-center font-mono focus:border-yellow-500 outline-none"
                                    placeholder="Coins"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTournamentManager;
    