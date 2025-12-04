
import React, { useState, useEffect } from 'react';
import type { User, Tournament, Server, HeroSlide } from '../types';
import TournamentCard from './TournamentCard';
import PullToRefreshContainer from './PullToRefreshContainer';
import type { Page } from '../App';
import MarketStatus from './MarketStatus';

interface HomeScreenProps {
    user: User;
    tournaments: Tournament[];
    onNavigateToDetail: (tournamentId: string) => void;
    onNavigate: (page: Page) => void;
    onRefreshData?: () => Promise<void>;
    heroSlides?: HeroSlide[];
}

const HeroSlider: React.FC<{ slides: HeroSlide[], onNavigateToDetail: (id: string) => void }> = ({ slides, onNavigateToDetail }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    if (!slides || slides.length === 0) return null;

    return (
        <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-8 shadow-2xl border border-gray-800 bg-gray-900 group">
            {slides.map((slide, index) => (
                <div 
                    key={slide.id}
                    onClick={() => slide.tournamentId && onNavigateToDetail(slide.tournamentId)}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out cursor-pointer ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    {/* Image with Ken Burns Effect */}
                    <div className="absolute inset-0 overflow-hidden">
                         <img 
                            src={slide.imageUrl} 
                            alt={slide.title} 
                            className={`w-full h-full object-cover transform transition-transform duration-[6000ms] ease-linear ${index === currentIndex ? 'scale-110' : 'scale-100'}`} 
                        />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent"></div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start justify-end h-full">
                        <div className={`transform transition-all duration-700 delay-300 ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                             <div className="inline-flex items-center space-x-2 bg-orange-600/90 backdrop-blur-md px-3 py-1 rounded-full mb-3 shadow-lg">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Featured Event</span>
                            </div>
                            <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg tracking-tight font-poppins mb-1">
                                {slide.title}
                            </h3>
                            <p className="text-yellow-400 text-sm font-semibold tracking-wide flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                                {slide.dateLabel}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Progress Bar Indicators */}
            <div className="absolute bottom-0 left-0 right-0 flex space-x-1 p-2 z-20">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className="h-1 flex-1 bg-gray-700/50 rounded-full overflow-hidden"
                    >
                        <div 
                            className={`h-full bg-orange-500 transition-all duration-300 ${currentIndex === idx ? 'w-full' : 'w-0'}`}
                            style={{ transitionDuration: currentIndex === idx ? '5000ms' : '0ms', transitionTimingFunction: 'linear' }}
                        ></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ user, tournaments, onNavigateToDetail, onNavigate, onRefreshData, heroSlides = [] }) => {
    const vipTournaments = tournaments.filter(t => t.isVip || t.category === 'VIP Match' || t.category === 'VIP Big Match');
    const regularTournaments = tournaments.filter(t => !t.isVip && t.category !== 'VIP Match' && t.category !== 'VIP Big Match');
    
    const unreadCount = user.notifications.filter(n => !n.read).length;
    
    const handleRefresh = async () => {
        if (onRefreshData) {
            await onRefreshData();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    };

    return (
        <>
            <div className="w-full h-screen flex flex-col bg-gray-950 pb-20">
                <header className="px-5 pt-6 pb-4 z-10 bg-gray-950/90 backdrop-blur-md sticky top-0 border-b border-gray-800">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-white font-orbitron tracking-wide">Game-Port<span className="text-orange-500">.</span>Np</h1>
                            <MarketStatus />
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => onNavigate('notifications')} className="relative text-gray-400 hover:text-white p-2 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-gray-900 animate-pulse"></span>}
                            </button>
                        </div>
                    </div>
                </header>

                <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1">
                    <main className="px-5 pb-8 pt-4">
                        {/* HERO SLIDER */}
                        {heroSlides.length > 0 && (
                            <HeroSlider slides={heroSlides} onNavigateToDetail={onNavigateToDetail} />
                        )}

                        {/* BIG MATCHES SECTION (VIP) */}
                        {vipTournaments.length > 0 && (
                            <div className="animate-slide-in-up mt-6" style={{ animationDelay: '150ms', opacity: 0 }}>
                                <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center space-x-2">
                                        <h2 className="text-xl font-bold text-white tracking-tight">Big Matches</h2>
                                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">VIP Access</span>
                                     </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    {vipTournaments.map((tournament, index) => (
                                        <TournamentCard key={tournament.id} tournament={tournament} index={index} onClick={() => onNavigateToDetail(tournament.id)} isJoined={user.joinedTournaments.some(jt => jt.tournamentId === tournament.id)} />
                                    ))}
                                </div>
                                <div className="my-8 border-b border-gray-800"></div>
                            </div>
                        )}

                        {/* Regular Matches */}
                        <div className="animate-slide-in-up mt-2" style={{ animationDelay: '200ms', opacity: 0 }}>
                            <div className="flex items-center space-x-2 mb-4">
                                <h2 className="text-lg font-bold text-gray-200 tracking-tight">Open Battles</h2>
                                <div className="h-px bg-gray-800 flex-1"></div>
                            </div>
                            
                            {regularTournaments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {regularTournaments.map((tournament, index) => (
                                        <TournamentCard key={tournament.id} tournament={tournament} index={index} onClick={() => onNavigateToDetail(tournament.id)} isJoined={user.joinedTournaments.some(jt => jt.tournamentId === tournament.id)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
                                    <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <p className="text-gray-400 font-semibold text-sm">No open tournaments available.</p>
                                    <p className="text-xs text-gray-600 mt-1">Join a VIP match or check back later.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </PullToRefreshContainer>

            </div>
        </>
    );
};

export default HomeScreen;
