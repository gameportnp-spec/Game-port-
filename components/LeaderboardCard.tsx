
import React from 'react';
import type { LeaderboardEntry } from '../types';

interface LeaderboardCardProps {
    entries: LeaderboardEntry[];
    onUserClick: (userId: string) => void;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entries, onUserClick }) => {
    // Sort descending by score
    const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-[1.02]';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300 via-blue-400 to-blue-500 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
        if (rank === 3) return 'bg-gradient-to-r from-orange-400 via-red-400 to-red-500 border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
        return 'bg-gray-800/80 border-gray-700';
    };

    return (
        <div className="w-full max-w-md mx-auto perspective-1000 mt-8 mb-12">
            <div className="relative bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:rotate-x-2">
                
                {/* Header Ribbon */}
                <div className="absolute -top-3 -left-3 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-br-lg shadow-md z-20 font-orbitron tracking-widest">
                    LEADERBOARD
                </div>

                {/* Glassy Effect & Content */}
                <div className="p-6 pt-8 relative z-10">
                     {/* Top 3 Header Visual */}
                     <div className="flex justify-center items-end space-x-4 mb-6">
                        {/* Rank 2 */}
                        <div className="flex flex-col items-center cursor-pointer" onClick={() => sortedEntries[1] && onUserClick(sortedEntries[1].id)}>
                            <div className="w-12 h-12 rounded-full border-2 border-blue-400 overflow-hidden mb-1 relative">
                                <img src={sortedEntries[1]?.avatar || 'https://via.placeholder.com/50'} alt="Rank 2" className="w-full h-full object-cover"/>
                                <div className="absolute bottom-0 w-full bg-blue-600 text-[8px] text-center font-bold text-white">#2</div>
                            </div>
                            <div className="h-16 w-8 bg-gradient-to-t from-blue-900 to-blue-600 rounded-t-lg shadow-lg"></div>
                        </div>
                        {/* Rank 1 */}
                        <div className="flex flex-col items-center z-10 cursor-pointer" onClick={() => sortedEntries[0] && onUserClick(sortedEntries[0].id)}>
                             <div className="w-16 h-16 rounded-full border-2 border-yellow-400 overflow-hidden mb-1 relative shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                                 <div className="absolute top-0 left-0 w-full h-full bg-yellow-400/20 animate-pulse"></div>
                                <img src={sortedEntries[0]?.avatar || 'https://via.placeholder.com/50'} alt="Rank 1" className="w-full h-full object-cover"/>
                                <div className="absolute bottom-0 w-full bg-yellow-500 text-[10px] text-center font-bold text-black">#1</div>
                            </div>
                            <div className="h-24 w-10 bg-gradient-to-t from-yellow-700 to-yellow-500 rounded-t-lg shadow-xl flex items-center justify-center">
                                <span className="text-2xl">👑</span>
                            </div>
                        </div>
                        {/* Rank 3 */}
                         <div className="flex flex-col items-center cursor-pointer" onClick={() => sortedEntries[2] && onUserClick(sortedEntries[2].id)}>
                            <div className="w-12 h-12 rounded-full border-2 border-red-400 overflow-hidden mb-1 relative">
                                <img src={sortedEntries[2]?.avatar || 'https://via.placeholder.com/50'} alt="Rank 3" className="w-full h-full object-cover"/>
                                <div className="absolute bottom-0 w-full bg-red-600 text-[8px] text-center font-bold text-white">#3</div>
                            </div>
                            <div className="h-12 w-8 bg-gradient-to-t from-red-900 to-red-600 rounded-t-lg shadow-lg"></div>
                        </div>
                     </div>

                    {/* Scrollable List */}
                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                        {sortedEntries.map((entry, index) => (
                            <div 
                                key={entry.id}
                                onClick={() => onUserClick(entry.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-95 ${getRankStyle(index + 1)}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className={`font-bold font-mono text-sm w-4 ${index < 3 ? 'text-white' : 'text-gray-500'}`}>{index + 1}</span>
                                    <img src={entry.avatar} alt={entry.username} className="w-8 h-8 rounded-full bg-gray-800 object-cover" />
                                    <span className={`text-sm font-bold truncate ${index < 3 ? 'text-white' : 'text-gray-300'}`}>{entry.username}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-white font-mono">{entry.score}</div>
                                    <div className="text-[10px] text-white/70 flex items-center justify-end">
                                        <span className="mr-1">🪙</span>{entry.coins}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {sortedEntries.length === 0 && <p className="text-center text-gray-500 py-4">No data yet.</p>}
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-600/10 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
        </div>
    );
};

export default LeaderboardCard;
