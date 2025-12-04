
import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';

interface ClaimWinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmClaim: (screenshotUrl: string) => void;
}

const ClaimWinModal: React.FC<ClaimWinModalProps> = ({ isOpen, onClose, onConfirmClaim }) => {
    const [screenshotUrl, setScreenshotUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setScreenshotUrl('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setError('');
        if (!screenshotUrl) {
            setError('Please upload the winning moment screenshot.');
            return;
        }
        
        onConfirmClaim(screenshotUrl);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Claim Your Prize</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <p className="text-sm text-gray-400 mb-4">Congratulations on your victory! Please upload a screenshot of your winning moment for verification.</p>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold animate-fade-in">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <FileUploader 
                            label="Winning Screenshot" 
                            onFileSelect={(base64) => setScreenshotUrl(base64)} 
                            placeholder="Upload Screenshot"
                        />
                    </div>
                </div>

                <div className="flex space-x-4 mt-6">
                    <button onClick={onClose} className="w-full py-3 bg-gray-700/80 text-white font-semibold rounded-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gray-600">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50"
                    >
                        Submit for Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClaimWinModal;
