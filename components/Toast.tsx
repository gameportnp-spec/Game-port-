import React, { useState, useEffect } from 'react';
import type { Toast as ToastType } from '../types';

interface ToastProps {
    toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        setVisible(true);

        // Prepare to animate out
        const timer = setTimeout(() => {
            setVisible(false);
        }, 3500); // Start fade out before it's removed from the parent

        return () => clearTimeout(timer);
    }, []);

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return { bg: 'bg-green-500', icon: <CheckCircleIcon /> };
            case 'error':
                return { bg: 'bg-red-500', icon: <XCircleIcon /> };
            default:
                return { bg: 'bg-blue-500', icon: <InfoIcon /> };
        }
    };

    const { bg, icon } = getStyles();

    return (
        <div
            className={`flex items-center w-full max-w-sm p-4 text-white rounded-lg shadow-lg ${bg} transform transition-all duration-500 ease-in-out ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
            role="alert"
        >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-white/20">
                {icon}
            </div>
            <div className="ml-3 text-sm font-medium">{toast.message}</div>
        </div>
    );
};

// Icons
const CheckCircleIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>;
const XCircleIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>;
const InfoIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>;


export default Toast;
