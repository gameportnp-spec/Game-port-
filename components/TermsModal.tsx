
import React from 'react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg m-4 h-[80vh] flex flex-col shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Terms & Guidelines</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto text-gray-300 space-y-4">
                    <h3 className="font-bold text-white text-lg">Community Guidelines</h3>
                    <p>Welcome to Game-port Np! To ensure a fair and enjoyable environment for everyone, you must agree to the following terms:</p>
                    
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><strong className="text-red-400">No Cheating or Hacking:</strong> Any use of third-party software, hacks, exploits, or cheats is strictly prohibited and will result in a permanent ban.</li>
                        <li><strong className="text-white">Fair Play:</strong> Teaming up in solo modes or intentionally disrupting matches is not allowed. Play fairly and respect the integrity of the competition.</li>
                        <li><strong className="text-white">Respectful Conduct:</strong> Harassment, abuse, hate speech, or any form of toxicity towards other players or staff is not tolerated.</li>
                        <li><strong className="text-white">One Account Per Player:</strong> Each player is permitted to have only one account. Multiple accounts may lead to disqualification and bans.</li>
                        <li><strong className="text-white">Accurate Information:</strong> You must provide accurate and truthful information upon registration and for any transactions.</li>
                    </ul>

                    <h3 className="font-bold text-red-500 text-lg pt-4">Warning</h3>
                    <p>Failure to comply with these terms will result in penalties, including temporary suspension, permanent account termination, forfeiture of winnings, and being blacklisted from all future events without a refund.</p>
                </div>

                <div className="p-4 mt-auto border-t border-gray-700">
                    <button onClick={onClose} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95">
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;