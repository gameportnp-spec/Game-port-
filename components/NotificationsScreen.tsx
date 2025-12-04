
import React, { useState } from 'react';
import type { User, Notification, NotificationCategory } from '../types';
import PullToRefreshContainer from './PullToRefreshContainer';
import ConfirmationModal from './ConfirmationModal';

interface NotificationsScreenProps {
    user: User;
    onMarkAllRead: () => void;
    onLogout: () => void;
    onClearAll?: () => void;
    onMarkRead?: (id: string) => void;
}

const NotificationDetailModal: React.FC<{ notification: Notification | null, onClose: () => void }> = ({ notification, onClose }) => {
    if (!notification) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
             <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-md p-6 shadow-2xl relative animate-slide-in-up" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
                 
                 <div className="flex items-center space-x-3 mb-4 border-b border-gray-700 pb-2">
                     {notification.type === 'success' && <div className="text-green-500"><CheckCircleIcon className="h-6 w-6" /></div>}
                     {notification.type === 'error' && <div className="text-red-500"><XCircleIcon className="h-6 w-6" /></div>}
                     {notification.type === 'warning' && <div className="text-yellow-500"><ExclamationIcon className="h-6 w-6" /></div>}
                     {notification.type === 'info' && <div className="text-blue-500"><InfoIcon className="h-6 w-6" /></div>}
                     
                     <h3 className="text-xl font-bold font-orbitron text-white">{notification.category || 'Notification'}</h3>
                 </div>
                 
                 <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 mb-4 max-h-[60vh] overflow-y-auto">
                     <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">{notification.message}</p>
                 </div>
                 
                 <div className="flex justify-between items-center text-xs text-gray-500">
                     <span>{notification.date.toLocaleString()}</span>
                     {notification.category && <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded font-bold">{notification.category.toUpperCase()}</span>}
                 </div>
                 
                 <button onClick={onClose} className="w-full mt-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors">Close</button>
             </div>
        </div>
    );
};

const NotificationCard: React.FC<{ notification: Notification, index: number, onClick: () => void }> = ({ notification, index, onClick }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <CheckCircleIcon className="text-green-400" />;
            case 'warning': return <ExclamationIcon className="text-yellow-400" />;
            case 'error': return <XCircleIcon className="text-red-400" />;
            default: return <InfoIcon className="text-blue-400" />;
        }
    };
    
    const getCategoryChip = () => {
        switch (notification.category) {
            case 'Big Match':
                return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500 text-black border border-yellow-400 ml-2">BIG MATCH</span>;
            case 'Normal Match':
                return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white ml-2">MATCH</span>;
            case 'System':
                return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-600 text-gray-200 ml-2">SYSTEM</span>;
            default:
                return null;
        }
    }
    
    return (
        <div 
            onClick={onClick}
            className={`flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg animate-slide-in-up border-l-4 cursor-pointer hover:bg-gray-750 transition-colors ${notification.read ? 'border-transparent' : 'border-orange-500'}`}
            style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
        >
            <div className="flex-shrink-0 mt-1">{getIcon()}</div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap">
                    <span className="text-xs text-gray-400">{notification.date.toLocaleString()}</span>
                    {getCategoryChip()}
                </div>
                <p className={`text-white mt-1 truncate ${!notification.read ? 'font-bold' : ''}`}>{notification.message}</p>
                <p className="text-[10px] text-gray-500 mt-1">Tap to view details</p>
            </div>
            {!notification.read && <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2"></div>}
        </div>
    );
};


const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ user, onMarkAllRead, onLogout, onClearAll, onMarkRead }) => {
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const handleRefresh = () => {
        return new Promise(resolve => setTimeout(resolve, 1500));
    };

    const handleNotificationClick = (n: Notification) => {
        setSelectedNotification(n);
        if (onMarkRead && !n.read) {
            onMarkRead(n.id);
        }
    };

    const sortedNotifications = [...user.notifications].sort((a, b) => +b.date - +a.date);
    const hasUnread = user.notifications.some(n => !n.read);

    return (
        <>
            <div className="w-full h-screen flex flex-col bg-gray-900 pb-20">
                <header className="px-4 pt-6 pb-4 z-10 bg-gray-900/80 backdrop-blur-sm sticky top-0 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white font-orbitron">Notifications</h1>
                    <div className="flex items-center space-x-2">
                        {sortedNotifications.length > 0 && onClearAll && (
                            <button 
                                onClick={onClearAll}
                                className="text-xs text-gray-400 font-semibold hover:text-white px-2">
                                Clear
                            </button>
                        )}
                        {hasUnread && (
                            <button 
                                onClick={onMarkAllRead}
                                className="text-xs text-orange-400 font-semibold hover:text-orange-300 px-2">
                                Read All
                            </button>
                        )}
                        <button 
                            onClick={() => setIsLogoutConfirmOpen(true)}
                            className="text-xs bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors bounce-on-click ml-2">
                            Logout
                        </button>
                    </div>
                </header>
                
                <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1">
                    <main className="px-4">
                        {sortedNotifications.length > 0 ? (
                            <div className="space-y-3 mt-4">
                                {sortedNotifications.map((notification, index) => (
                                    <NotificationCard 
                                        key={notification.id} 
                                        notification={notification} 
                                        index={index} 
                                        onClick={() => handleNotificationClick(notification)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <BellIcon className="mx-auto h-16 w-16 text-gray-600"/>
                                <p className="mt-4 text-gray-400 font-semibold">No notifications yet</p>
                                <p className="text-sm text-gray-500 mt-1">Important updates will appear here.</p>
                            </div>
                        )}
                    </main>
                </PullToRefreshContainer>
            </div>

            <ConfirmationModal 
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={onLogout}
                title="Confirm Logout"
                message="Are you sure you want to log out of your account?"
                confirmText="Logout"
            />
            
            <NotificationDetailModal 
                notification={selectedNotification} 
                onClose={() => setSelectedNotification(null)} 
            />
        </>
    );
};


// Icons
const CheckCircleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ExclamationIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const XCircleIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InfoIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BellIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

export default NotificationsScreen;
