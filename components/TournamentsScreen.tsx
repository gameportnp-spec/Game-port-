import React, { useState, useMemo } from 'react';
import type { Page } from '../App';
import type { Tournament, User, TournamentMode } from '../types';
import TournamentCard from './TournamentCard';
import PullToRefreshContainer from './PullToRefreshContainer';

interface TournamentsScreenProps {
     user: User;
     tournaments: Tournament[];
     onNavigateToDetail: (tournamentId: string) => void;
}

type JoinedFilterType = 'all' | 'joined';
type ModeFilterType = 'all' | TournamentMode;

const TournamentsScreen: React.FC<TournamentsScreenProps> = ({ user, tournaments, onNavigateToDetail }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [joinedFilter, setJoinedFilter] = useState<JoinedFilterType>('all');
    const [modeFilter, setModeFilter] = useState<ModeFilterType>('all');

    const handleRefresh = () => {
        return new Promise(resolve => setTimeout(resolve, 1500));
    };

    const filteredTournaments = useMemo(() => {
        let results = tournaments;

        // Apply "My Tournaments" filter
        if (joinedFilter === 'joined') {
            // FIX: The User type has a `joinedTournaments` property, which is an array of objects.
            // This has been updated to correctly check if the user has joined a tournament.
            results = results.filter(t => user.joinedTournaments.some(jt => jt.tournamentId === t.id));
        }
        
        // Apply Mode filter
        if (modeFilter !== 'all') {
            results = results.filter(t => t.mode === modeFilter);
        }

        // Apply search query
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (lowercasedQuery) {
            results = results.filter(tournament => 
                tournament.name.toLowerCase().includes(lowercasedQuery)
            );
        }

        return results;
    // FIX: The dependency array for useMemo has been updated to use `user.joinedTournaments` instead of the non-existent `user.joinedTournamentIds`.
    }, [searchQuery, tournaments, joinedFilter, modeFilter, user.joinedTournaments]);

    const modeFilters: ModeFilterType[] = ['all', 'Solo', 'Duo', 'Squad'];
    const activeModeIndex = modeFilters.indexOf(modeFilter);

    return (
        <div className="w-full h-screen flex flex-col bg-gray-900 pb-20">
            <header className="px-4 pt-6 pb-4 z-10 bg-gray-900/80 backdrop-blur-sm sticky top-0">
                <h1 className="text-2xl font-bold text-white font-orbitron text-center">Tournaments</h1>
            </header>

            <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1">
                <main className="px-4">
                    {/* Search Input */}
                    <div className="my-4 relative animate-fade-in">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tournaments..."
                            className="w-full px-4 py-3 pl-10 bg-gray-800/70 border-2 border-transparent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        />
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Filter Buttons */}
                    <div className="mb-4 flex justify-center animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="relative flex w-full max-w-xs bg-gray-800 rounded-lg p-1">
                             <div className={`absolute top-1 bottom-1 w-1/2 bg-orange-500 rounded-md shadow-lg transition-transform duration-300 ease-in-out ${joinedFilter === 'all' ? 'transform translate-x-0' : 'transform translate-x-full'}`}></div>
                            <button onClick={() => setJoinedFilter('all')} className="relative z-10 w-1/2 py-2 text-center font-bold">All</button>
                            <button onClick={() => setJoinedFilter('joined')} className="relative z-10 w-1/2 py-2 text-center font-bold">My Tournaments</button>
                        </div>
                    </div>
                    
                    {/* Mode Filter Buttons */}
                    <div className="mb-4 flex justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
                       <div className="relative flex w-full max-w-sm bg-gray-800 rounded-lg p-1">
                            <div 
                                className="absolute top-1 bottom-1 w-1/4 bg-orange-500 rounded-md shadow-lg transition-transform duration-300 ease-in-out"
                                style={{ transform: `translateX(${activeModeIndex * 100}%)` }}
                            ></div>
                            {modeFilters.map(mode => (
                                <button 
                                    key={mode} 
                                    onClick={() => setModeFilter(mode)} 
                                    className="relative z-10 w-1/4 py-2 text-center font-bold capitalize text-sm"
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTournaments.length > 0 ? (
                            filteredTournaments.map((tournament, index) => (
                                <TournamentCard 
                                    key={tournament.id} 
                                    tournament={tournament} 
                                    index={index} 
                                    onClick={() => onNavigateToDetail(tournament.id)} 
                                    // FIX: The User type has a `joinedTournaments` property, which is an array of objects.
                                    // This has been updated to correctly check if the user has joined a tournament.
                                    isJoined={user.joinedTournaments.some(jt => jt.tournamentId === tournament.id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-1 md:col-span-2 text-center py-10 bg-gray-800/30 rounded-lg">
                                <p className="text-gray-400 font-semibold">No tournaments found</p>
                                <p className="text-sm text-gray-500 mt-1">Try a different search or filter.</p>
                            </div>
                        )}
                    </div>
                </main>
            </PullToRefreshContainer>
        </div>
    );
};

export default TournamentsScreen;