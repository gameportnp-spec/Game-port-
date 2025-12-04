
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-orbitron font-bold text-white">{title}</h2>
                <p className="text-gray-300 mt-2 mb-6">{message}</p>
                <div className="flex space-x-4">
                    <button onClick={onClose} className="w-full py-3 bg-gray-700/80 text-white font-semibold rounded-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gray-600">
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/50"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;