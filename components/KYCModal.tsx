
import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';

interface KYCModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmKYC: (fullName: string, idNumber: string, frontUrl: string, backUrl: string) => void;
}

const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose, onConfirmKYC }) => {
    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [idFrontUrl, setIdFrontUrl] = useState('');
    const [idBackUrl, setIdBackUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFullName('');
            setIdNumber('');
            setIdFrontUrl('');
            setIdBackUrl('');
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        setError('');
        if (fullName.trim().length < 3) {
            setError('Please enter your full legal name.');
            return;
        }
        if (idNumber.trim().length < 5) {
            setError('Please enter a valid Government ID number.');
            return;
        }
        if (!idFrontUrl || !idBackUrl) {
            setError('Please upload photos for both front and back of your ID.');
            return;
        }

        onConfirmKYC(fullName, idNumber, idFrontUrl, idBackUrl);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up max-h-[90vh] overflow-y-auto" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-orbitron font-bold text-white">KYC Verification</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <p className="text-sm text-gray-400 mb-4">Please provide your details exactly as they appear on your government-issued ID.</p>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold animate-fade-in">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="text-sm font-semibold text-gray-300 mb-1 block">Full Legal Name</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g., John Bahadur Doe"
                            className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="idNumber" className="text-sm font-semibold text-gray-300 mb-1 block">Citizenship / License Number</label>
                        <input
                            id="idNumber"
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="Enter your ID number"
                            className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                    </div>
                     <div>
                        <FileUploader 
                            label="ID Front Photo" 
                            onFileSelect={(base64) => setIdFrontUrl(base64)} 
                            placeholder="Upload Front"
                        />
                    </div>
                     <div>
                         <FileUploader 
                            label="ID Back Photo" 
                            onFileSelect={(base64) => setIdBackUrl(base64)} 
                            placeholder="Upload Back"
                        />
                    </div>
                </div>

                <div className="flex space-x-4 mt-6">
                    <button onClick={onClose} className="w-full py-3 bg-gray-700/80 text-white font-semibold rounded-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gray-600">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
                    >
                        Submit for Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KYCModal;
