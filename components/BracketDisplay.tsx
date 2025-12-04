
import React from 'react';
import type { BracketMatch } from '../types';

interface BracketDisplayProps {
    matches: Record<string, BracketMatch>;
}

const MatchBox: React.FC<{ match: BracketMatch, position: 'left' | 'right' | 'center' }> = ({ match, position }) => {
    const isWinner1 = match.winner === 'player1';
    const isWinner2 = match.winner === 'player2';

    return (
        <div className={`relative flex flex-col justify-center w-full max-w-[140px] md:max-w-[160px] my-2 bg-gray-900 border border-gray-700 rounded overflow-hidden shadow-lg transform transition-all hover:scale-105`}>
            {/* Player 1 */}
            <div className={`flex justify-between items-center p-2 border-b border-gray-800 ${isWinner1 ? 'bg-gradient-to-r from-orange-600/50 to-orange-900/50' : ''}`}>
                <span className={`text-xs font-bold truncate ${isWinner1 ? 'text-white' : 'text-gray-400'}`}>{match.player1 || 'TBD'}</span>
                <span className={`text-xs font-mono ${isWinner1 ? 'text-orange-400' : 'text-gray-600'}`}>{match.score1}</span>
            </div>
            {/* Player 2 */}
            <div className={`flex justify-between items-center p-2 ${isWinner2 ? 'bg-gradient-to-r from-blue-600/50 to-blue-900/50' : ''}`}>
                <span className={`text-xs font-bold truncate ${isWinner2 ? 'text-white' : 'text-gray-400'}`}>{match.player2 || 'TBD'}</span>
                <span className={`text-xs font-mono ${isWinner2 ? 'text-blue-400' : 'text-gray-600'}`}>{match.score2}</span>
            </div>
            
            {/* Connector Line Logic (Simplified visual) */}
            {position === 'left' && <div className="absolute top-1/2 -right-4 w-4 h-[1px] bg-gray-700"></div>}
            {position === 'right' && <div className="absolute top-1/2 -left-4 w-4 h-[1px] bg-gray-700"></div>}
        </div>
    );
};

const BracketDisplay: React.FC<BracketDisplayProps> = ({ matches }) => {
    // Structure: QF -> Semi -> Final
    // Left Side: QF1, QF2 -> Semi1
    // Right Side: QF3, QF4 -> Semi2
    // Center: Final

    return (
        <div className="w-full overflow-x-auto p-4 flex flex-col items-center justify-start min-h-[500px]">
            {/* Championship Header */}
            <div className="text-center mb-8 animate-slide-in-down sticky left-0 right-0">
                <div className="text-4xl mb-2 filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">🏆</div>
                <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600">
                    WORLD TOURNAMENT
                </h2>
                <div className="h-0.5 w-32 bg-yellow-500 mx-auto mt-1"></div>
                <p className="text-xs text-yellow-500/80 tracking-[0.3em] mt-1 font-bold">CHAMPIONSHIP</p>
            </div>

            {/* Min-width added to force scroll on mobile */}
            <div className="flex items-center justify-center space-x-4 md:space-x-8 min-w-[900px]">
                
                {/* LEFT SIDE - QUARTER FINALS */}
                <div className="flex flex-col justify-around h-[300px]">
                    <MatchBox match={matches.qf1} position="left" />
                    <MatchBox match={matches.qf2} position="left" />
                </div>

                {/* LEFT SIDE - SEMI FINAL */}
                <div className="flex flex-col justify-around h-[150px] relative">
                    <div className="absolute -left-4 top-[25%] bottom-[25%] w-4 border-r border-t border-b border-gray-700 rounded-r"></div>
                    <div className="absolute -right-4 top-1/2 w-4 h-[1px] bg-gray-700"></div>
                    <MatchBox match={matches.semi1} position="left" />
                </div>

                {/* CENTER - FINAL */}
                <div className="flex flex-col justify-center items-center z-10 px-4">
                     <div className="mb-2">
                        <span className="text-3xl font-black text-red-600 font-orbitron tracking-tighter drop-shadow-md animate-pulse">VS</span>
                     </div>
                     <div className="transform scale-125 border-2 border-yellow-500 rounded shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        <MatchBox match={matches.final} position="center" />
                     </div>
                     {matches.final.winner && (
                         <div className="mt-4 px-6 py-1 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold font-orbitron tracking-wider rounded skew-x-[-10deg] shadow-lg animate-bounce-in">
                             CHAMPION
                         </div>
                     )}
                </div>

                 {/* RIGHT SIDE - SEMI FINAL */}
                 <div className="flex flex-col justify-around h-[150px] relative">
                    <div className="absolute -right-4 top-[25%] bottom-[25%] w-4 border-l border-t border-b border-gray-700 rounded-l"></div>
                    <div className="absolute -left-4 top-1/2 w-4 h-[1px] bg-gray-700"></div>
                    <MatchBox match={matches.semi2} position="right" />
                </div>

                {/* RIGHT SIDE - QUARTER FINALS */}
                <div className="flex flex-col justify-around h-[300px]">
                    <MatchBox match={matches.qf3} position="right" />
                    <MatchBox match={matches.qf4} position="right" />
                </div>
            </div>
        </div>
    );
};

export default BracketDisplay;
