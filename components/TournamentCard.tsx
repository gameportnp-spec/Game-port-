
import React, { useState, useEffect } from 'react';
import type { Tournament, TournamentMode } from '../types';
import RoomDetails from './RoomDetails';

interface TournamentCardProps {
    tournament: Tournament;
    index: number;
    onClick: () => void;
    isJoined: boolean;
}

const CountdownTimer: React.FC<{ targetDate: Date }> = React.memo(({ targetDate }) => {
    const calculateTimeLeft = React.useCallback(() => {
        const difference = +targetDate - +new Date();
        if (difference <= 0) return {};
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            if (Object.keys(newTimeLeft).length > 0) {
                setTimeLeft(newTimeLeft);
            } else {
                setTimeLeft({});
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);


    if (Object.keys(timeLeft).length === 0) {
        return <div className="text-center text-lg font-bold text-green-400">Starting Soon!</div>;
    }

    return (
        <div className="flex space-x-2 text-center justify-center">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center bg-gray-900/50 p-1 rounded w-12">
                    <span className="text-lg font-bold text-white tabular-nums">{String(value).padStart(2, '0')}</span>
                    <span className="text-xs text-gray-400 uppercase">{unit.slice(0,1)}</span>
                </div>
            ))}
        </div>
    );
});

const getModeColor = (mode: TournamentMode) => {
    switch (mode) {
        case 'Solo': return 'bg-yellow-500';
        case 'Duo': return 'bg-blue-500';
        case 'Squad': return 'bg-purple-500';
        default: return 'bg-gray-500';
    }
};

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, index, onClick, isJoined }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute for status check
        return () => clearInterval(timer);
    }, []);

    // Derived Status based on Time
    const getEffectiveStatus = () => {
        if (tournament.status === 'Finished') return 'Finished';
        if (currentTime >= tournament.startDate) return 'Live';
        return 'Upcoming';
    };

    const effectiveStatus = getEffectiveStatus();

    const getStatusChip = () => {
        switch(effectiveStatus) {
            case 'Live':
                return <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse z-10 shadow-lg shadow-red-500/50">LIVE</div>;
            case 'Upcoming':
                return <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">UPCOMING</div>;
            case 'Finished':
                return <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">FINISHED</div>;
        }
    }
    
    const isNew = tournament.createdAt && (new Date().getTime() - tournament.createdAt.getTime()) < 12 * 60 * 60 * 1000; // 12 hours
    const isBigMatch = tournament.category === 'VIP Big Match';
    const isVip = isBigMatch || tournament.category === 'VIP Match' || tournament.isVip;
    
    // Lock logic: VIP tournament not joined yet
    const isLocked = isVip && !isJoined;

    return (
        <div 
          onClick={onClick}
          className={`relative rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-slide-in-up cursor-pointer group 
          ${isBigMatch ? 'bg-gradient-to-b from-yellow-900/40 to-black border-2 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : isVip ? 'bg-gradient-to-b from-purple-900/20 to-black border border-purple-500/30' : 'bg-gray-800/50 border border-gray-700'}`}
          style={{ animationDelay: `${index * 100 + 300}ms`, opacity: 0}}
        >
            <div className="relative">
                <img src={tournament.bannerUrl} alt={tournament.name} className={`w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110 ${isLocked ? 'blur-[1px] grayscale-[30%]' : ''}`}/>
                <div className="absolute inset-0 bg-black/30"></div>
                {isVip && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-yellow-500/10 pointer-events-none"></div>
                )}
                
                {isNew && !isVip && <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full z-10 animate-pulse">NEW</div>}
                
                {/* Category Badges */}
                {isBigMatch ? (
                     <div className="absolute top-2 left-2 flex items-center space-x-1 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg shadow-yellow-500/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                        <span>BIG MATCH</span>
                     </div>
                ) : tournament.category === 'VIP Match' ? (
                     <div className="absolute top-2 left-2 flex items-center space-x-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                        <span>VIP</span>
                     </div>
                ) : null}
                
                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                        <div className={`bg-black/80 p-3 rounded-full border shadow-lg ${isBigMatch ? 'border-yellow-500 shadow-yellow-500/50' : 'border-gray-500'}`}>
                            {isBigMatch ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            )}
                        </div>
                    </div>
                )}

                {getStatusChip()}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className={`text-lg font-bold font-orbitron truncate pr-2 ${isBigMatch ? 'text-yellow-400' : 'text-white'}`}>{tournament.name}</h3>
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full text-white ${getModeColor(tournament.mode)}`}>
                        {tournament.mode}
                    </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                    <p className="text-gray-300">Prize Pool</p>
                    <p className={`font-bold ${isBigMatch ? 'text-yellow-300 text-base' : 'text-yellow-400'}`}>रू{tournament.prizePool.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center mt-1 text-sm">
                    <p className="text-gray-300">Entry Fee</p>
                    <p className="font-bold text-white">रू{tournament.entryFee}</p>
                </div>
                
                <div className="h-2 w-full bg-gray-700 rounded-full mt-4">
                    <div 
                        className={`h-2 rounded-full ${isBigMatch ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' : 'bg-gradient-to-r from-orange-500 to-yellow-500'}`}
                        style={{ width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%`}}
                    ></div>
                </div>
                <p className="text-xs text-center text-gray-400 mt-1">{tournament.registeredTeams} / {tournament.maxTeams} {tournament.mode === 'Solo' ? 'Players' : 'Teams'}</p>

                {isJoined && effectiveStatus === 'Live' && tournament.roomId && (
                    <RoomDetails roomId={tournament.roomId} roomPassword={tournament.roomPassword} />
                )}

                {effectiveStatus === 'Upcoming' && (
                    <div className="mt-4 p-2 bg-black/30 rounded-lg">
                        <p className="text-xs text-center text-orange-400 mb-2">Starts In:</p>
                        <CountdownTimer targetDate={tournament.startDate} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(TournamentCard);
