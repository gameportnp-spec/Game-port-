
import React, { useState, useRef } from 'react';

interface FileUploaderProps {
    label: string;
    onFileSelect: (base64: string) => void;
    placeholder?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, onFileSelect, placeholder = "Select Image" }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setPreview(base64String);
            onFileSelect(base64String);
            setLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const triggerSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <label className="text-sm font-semibold text-gray-300 mb-2 block">{label}</label>
            
            <div 
                onClick={triggerSelect}
                className={`relative w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden ${preview ? 'border-orange-500 bg-gray-900' : 'border-gray-600 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-500'}`}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                />

                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-sm text-gray-400">Processing...</span>
                    </div>
                ) : preview ? (
                    <>
                        <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-sm">{placeholder}</span>
                        <span className="text-xs text-gray-500 mt-1">Tap to browse gallery</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
