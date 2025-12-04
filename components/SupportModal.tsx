
import React from 'react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Customer Support</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="text-center text-gray-300 space-y-6 py-4">
                    <p>If you have any questions or need assistance, please reach out to us through one of the channels below.</p>
                    
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-orange-400">Support Email</p>
                            <a href="mailto:sujanpoco@gmail.com" className="text-white hover:underline">sujanpoco@gmail.com</a>
                        </div>
                        
                        <div>
                            <p className="font-semibold text-orange-400">WhatsApp</p>
                            <a href="https://wa.me/9779704007111" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">9704007111</a>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400">Our support team is available 24/7 to help you with any issues.</p>
                </div>

                <div className="mt-6">
                    <button onClick={onClose} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;