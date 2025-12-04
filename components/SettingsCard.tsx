import React from 'react';

interface SettingsCardProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    status?: 'idle' | 'checking' | 'available' | 'pending' | 'verified' | 'rejected';
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon, label, onClick, status = 'idle' }) => {
    
    const getStatusStyles = () => {
        switch (status) {
            case 'checking':
                return { text: 'Checking...', color: 'text-yellow-400', iconColor: 'text-yellow-400', disabled: true };
            case 'available':
                return { text: '', color: '', iconColor: 'text-green-400', disabled: false };
            case 'pending':
                 return { text: 'Under Review', color: 'text-yellow-400', iconColor: 'text-yellow-400', disabled: true };
            case 'verified':
                return { text: '', color: '', iconColor: 'text-green-400', disabled: true };
            case 'rejected':
                 return { text: 'Action Required', color: 'text-red-400', iconColor: 'text-red-400', disabled: false };
            default:
                return { text: '', color: '', iconColor: 'text-orange-400', disabled: false };
        }
    };

    const { text, color, iconColor, disabled } = getStatusStyles();

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="col-span-1 bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center text-center border border-gray-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 bounce-on-click"
        >
            <div className={`transition-colors ${iconColor}`}>{icon}</div>
            <p className="mt-2 font-semibold text-white text-sm">{label}</p>
            {text && <p className={`text-xs mt-1 font-bold ${color}`}>{text}</p>}
        </button>
    );
};

export default SettingsCard;