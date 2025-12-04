import React, { useState } from 'react';

interface RoomDetailsProps {
    roomId: string;
    roomPassword?: string;
}

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


const RoomDetails: React.FC<RoomDetailsProps> = ({ roomId, roomPassword }) => {
    const [idCopied, setIdCopied] = useState(false);
    const [passCopied, setPassCopied] = useState(false);

    const handleCopy = (text: string, type: 'id' | 'pass') => {
        navigator.clipboard.writeText(text);
        if (type === 'id') {
            setIdCopied(true);
            setTimeout(() => setIdCopied(false), 2000);
        } else {
            setPassCopied(true);
            setTimeout(() => setPassCopied(false), 2000);
        }
    };

    return (
        <div className="mt-4 p-3 bg-green-900/50 border-l-4 border-green-500 rounded-lg animate-fade-in">
            <p className="text-xs text-center text-green-300 mb-2 font-semibold">Match Started! Join Now:</p>
            <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                    <div>
                        <p className="text-xs text-gray-400">Room ID</p>
                        <p className="font-mono font-bold text-white tracking-widest">{roomId}</p>
                    </div>
                    <button onClick={() => handleCopy(roomId, 'id')} className={`p-2 rounded transition-colors ${idCopied ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {idCopied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
                {roomPassword && (
                    <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                        <div>
                            <p className="text-xs text-gray-400">Password</p>
                            <p className="font-mono font-bold text-white tracking-widest">{roomPassword}</p>
                        </div>
                         <button onClick={() => handleCopy(roomPassword, 'pass')} className={`p-2 rounded transition-colors ${passCopied ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                            {passCopied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomDetails;