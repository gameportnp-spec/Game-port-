

import React from 'react';

interface LiveStreamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Updated stream URL to use the standard youtube.com for better embed compatibility and to resolve configuration errors.
// Kept autoplay, mute, and other UX-enhancing parameters.
const LIVE_STREAM_URL = "https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1&playsinline=1&rel=0";

const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl m-4 flex flex-col shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-orbitron font-bold text-white flex items-center">
                        <span className="relative flex h-3 w-3 mr-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        Live Stream
                    </h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                {/* Responsive video container */}
                <div className="aspect-video bg-black">
                     <iframe 
                        src={LIVE_STREAM_URL}
                        title="YouTube Live Stream Player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
                 <div className="p-4 mt-auto border-t border-gray-700">
                    <button onClick={onClose} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveStreamModal;