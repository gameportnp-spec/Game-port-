
import React, { useEffect, useState } from 'react';

interface NotificationPopupProps {
    data: {
        title: string;
        message: string;
        image?: string;
        type?: 'info' | 'success' | 'warning' | 'error';
        actions?: { label: string; onClick: () => void; primary?: boolean }[];
    } | null;
    onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ data, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (data) {
            setVisible(true);
            
            // Only auto-close if there are NO actions required
            if (!data.actions || data.actions.length === 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, 5000); 
                return () => clearTimeout(timer);
            }
        }
    }, [data]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 500); 
    };

    if (!data) return null;

    const borderColor = data.type === 'success' ? 'border-green-500' : 
                        data.type === 'error' ? 'border-red-500' : 
                        data.type === 'warning' ? 'border-yellow-500' : 'border-blue-500';

    const glowColor = data.type === 'success' ? 'shadow-green-500/20' : 
                      data.type === 'error' ? 'shadow-red-500/20' : 
                      data.type === 'warning' ? 'shadow-yellow-500/20' : 'shadow-blue-500/20';

    return (
        <div className={`fixed top-4 left-4 right-4 z-[200] flex justify-center pointer-events-none transition-all duration-500 ease-out transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className={`w-full max-w-md bg-gray-900/95 backdrop-blur-md border-l-4 ${borderColor} text-white rounded-lg shadow-2xl ${glowColor} pointer-events-auto overflow-hidden flex flex-col`}>
                <div className="flex w-full">
                     {/* Image Section */}
                    {data.image && (
                        <div className="w-20 bg-gray-800 flex items-center justify-center shrink-0">
                             <img src={data.image} alt="Notification" className="w-full h-full object-cover opacity-80" />
                        </div>
                    )}
                    
                    {/* Content Section */}
                    <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-orbitron font-bold text-sm tracking-wide text-white uppercase">{data.title}</h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors -mt-1 -mr-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-300 text-sm mt-1 leading-snug">{data.message}</p>
                    </div>
                </div>

                {/* Actions Section */}
                {data.actions && data.actions.length > 0 && (
                    <div className="flex p-2 bg-gray-800/50 space-x-2">
                        {data.actions.map((action, idx) => (
                            <button 
                                key={idx}
                                onClick={() => {
                                    action.onClick();
                                    handleClose();
                                }}
                                className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${action.primary ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPopup;
