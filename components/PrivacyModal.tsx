
import React from 'react';

interface PrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg m-4 h-[80vh] flex flex-col shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Privacy Policy</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto text-gray-300 space-y-4">
                    <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="font-bold text-white text-lg pt-2">1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, join tournaments, or contact customer support. This may include your username, email address, and in-game ID.</p>
                    
                    <h3 className="font-bold text-white text-lg pt-2">2. How We Use Your Information</h3>
                    <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of the app, including to: facilitate tournament registration, process transactions, communicate with you, and enforce our terms and policies.</p>

                    <h3 className="font-bold text-white text-lg pt-2">3. Information Sharing</h3>
                    <p>We do not share your personal information with third parties except as described in this Privacy Policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
                    
                    <h3 className="font-bold text-white text-lg pt-2">4. Data Security</h3>
                    <p>We use reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access. However, no electronic transmission or storage is ever completely secure.</p>

                    <h3 className="font-bold text-white text-lg pt-2">5. Your Choices</h3>
                    <p>You may update or correct your account information at any time by accessing your profile settings within the app.</p>
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

export default PrivacyModal;