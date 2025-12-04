
import React, { useState, useCallback, useEffect } from 'react';
import type { User, Transaction, Server } from '../types';
import PullToRefreshContainer from './PullToRefreshContainer';
import WithdrawModal from './WithdrawModal';
import AddMoneyModal from './AddMoneyModal';
import SettingsCard from './SettingsCard';
import PrivacyModal from './PrivacyModal';
import SupportModal from './SupportModal';
import TermsModal from './TermsModal';
import AboutModal from './AboutModal';
import KYCModal from './KYCModal';
import OrganizeTournamentModal from './OrganizeTournamentModal';
import LiveStreamModal from './LiveStreamModal';
import DiamondTopupModal from './DiamondTopupModal';
import FileUploader from './FileUploader';
import FriendsModal from './FriendsListModal';

interface OrganizeTournamentDetails {
    name: string;
    contact: string;
    description: string;
    prizePool: number;
    entryFee: number;
    startDate: string;
}

interface ProfileScreenProps {
    user: User;
    allUsers: User[];
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    onWithdrawRequest: (amount: number, method: 'esewa' | 'khalti', accountId: string) => void;
    onAddMoneyRequest: (amount: number, method: 'esewa' | 'khalti', screenshotUrl: string) => void;
    onUpdateProfile: (newName: string, newAvatar: string) => void;
    onKYCSubmit: (fullName: string, idNumber: string, frontUrl: string, backUrl: string) => void;
    onOrganizeTournamentRequest: (details: OrganizeTournamentDetails) => void;
    onDiamondTopupRequest: (playerId: string, pkg: { diamonds: number; price: number }, server: Server) => void;
    onSearchUser: (query: string) => void;
    onUserClick: (userId: string) => void;
    onAcceptFriendRequest: (fromId: string) => void;
    onRejectFriendRequest: (fromId: string) => void;
    onChat: (friend: User) => void;
}

const TransactionRow: React.FC<{ transaction: Transaction, index: number }> = React.memo(({ transaction, index }) => {
    const isCredit = transaction.type === 'credit';
    
    const statusInfo = {
        pending: { color: 'text-yellow-400', dot: 'bg-yellow-400', text: 'Pending' },
        completed: { color: 'text-green-400', dot: 'bg-green-400', text: 'Completed' },
        rejected: { color: 'text-red-400', dot: 'bg-red-400', text: 'Rejected' },
    };
    
    const { color, dot, text } = statusInfo[transaction.status];

    return (
        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg animate-slide-in-up" style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}>
            <div>
                <p className="font-semibold text-white">{transaction.description}</p>
                 <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-400">{transaction.date.toLocaleDateString()}</p>
                    <div className={`w-2 h-2 rounded-full ${dot}`}></div>
                    <p className={`text-xs font-semibold ${color}`}>{text}</p>
                </div>
            </div>
            <p className={`font-bold text-lg font-orbitron ${transaction.status === 'completed' ? (isCredit ? 'text-green-400' : 'text-red-400') : 'text-gray-500'}`}>
                {isCredit ? '+' : '-'}रू{transaction.amount.toLocaleString()}</p>
        </div>
    );
});

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, allUsers, showToast, onWithdrawRequest, onAddMoneyRequest, onUpdateProfile, onKYCSubmit, onOrganizeTournamentRequest, onDiamondTopupRequest, onSearchUser, onUserClick, onAcceptFriendRequest, onRejectFriendRequest, onChat }) => {
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user.name);
    const [editedAvatar, setEditedAvatar] = useState(user.avatar);
    
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
    const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
    const [isLiveStreamModalOpen, setIsLiveStreamModalOpen] = useState(false);
    const [isDiamondTopupModalOpen, setIsDiamondTopupModalOpen] = useState(false);
    const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available'>('idle');
    const [searchId, setSearchId] = useState('');

    useEffect(() => {
        if (!isEditing) {
            setEditedName(user.name);
            setEditedAvatar(user.avatar);
        }
    }, [user, isEditing]);
    
    const handleSave = () => {
        if (editedName.trim().length < 3) {
            showToast('Name must be at least 3 characters long.', 'error');
            return;
        }
        if (!editedAvatar) {
             showToast('Please select an avatar.', 'error');
             return;
        }
        onUpdateProfile(editedName, editedAvatar);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedName(user.name);
        setEditedAvatar(user.avatar);
        setIsEditing(false);
    };

    const handleRefresh = () => {
        return new Promise(resolve => setTimeout(resolve, 1500));
    };

    const handleConfirmWithdraw = useCallback((amount: number, method: 'esewa' | 'khalti', accountId: string) => {
        onWithdrawRequest(amount, method, accountId);
        setIsWithdrawModalOpen(false);
    }, [onWithdrawRequest]);
    
    const handleConfirmAddMoney = useCallback((amount: number, method: 'esewa' | 'khalti', screenshotUrl: string) => {
        onAddMoneyRequest(amount, method, screenshotUrl);
        setIsAddMoneyModalOpen(false);
    }, [onAddMoneyRequest]);

    const handleConfirmKYC = useCallback((fullName: string, idNumber: string, frontUrl: string, backUrl: string) => {
        onKYCSubmit(fullName, idNumber, frontUrl, backUrl);
        setIsKYCModalOpen(false);
    }, [onKYCSubmit]);

    const handleConfirmDiamondTopup = useCallback((playerId: string, selectedPackage: { diamonds: number; price: number }, server: Server) => {
        onDiamondTopupRequest(playerId, selectedPackage, server);
        setIsDiamondTopupModalOpen(false);
    }, [onDiamondTopupRequest]);
    
    const handleCheckForUpdate = () => {
        if (updateStatus === 'checking') return;
        setUpdateStatus('checking');
        showToast('Checking for updates...', 'info');
        setTimeout(() => {
            const isAvailable = Math.random() < 0.3; 
            if (isAvailable) {
                setUpdateStatus('available');
                showToast('A new update is available!', 'success');
            } else {
                setUpdateStatus('idle');
                showToast('Your app is up-to-date.', 'info');
            }
        }, 2500);
    };

    const getKYCStatusProps = (): { label: string; status: 'verified' | 'pending' | 'rejected' | 'idle'; onClick: () => void; } => {
        switch (user.kycStatus) {
            case 'verified':
                return { label: 'KYC Verified', status: 'verified', onClick: () => {} };
            case 'pending':
                return { label: 'KYC Pending', status: 'pending', onClick: () => {} };
            case 'rejected':
                return { label: 'Resubmit KYC', status: 'rejected', onClick: () => setIsKYCModalOpen(true) };
            case 'unverified':
            default:
                return { label: 'Verify KYC', status: 'idle', onClick: () => setIsKYCModalOpen(true) };
        }
    };
    const kycProps = getKYCStatusProps();

    return (
        <>
            <div className="w-full h-screen flex flex-col bg-gray-900 pb-20">
                <header className="px-4 pt-6 pb-4 z-10 bg-gray-900/80 backdrop-blur-sm sticky top-0">
                    <h1 className="text-2xl font-bold text-white font-orbitron text-center">Profile</h1>
                </header>

                <PullToRefreshContainer onRefresh={handleRefresh} className="flex-1">
                    <main className="px-4">
                        {/* User Info Card */}
                        <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-xl animate-fade-in shadow-lg border border-gray-700/50">
                             <img src={editedAvatar} alt={editedName} className="w-24 h-24 rounded-full border-4 border-orange-500 shadow-lg object-cover" />
                             {!isEditing ? (
                                <>
                                    <h2 className="mt-4 text-2xl font-bold font-orbitron text-white">{user.name}</h2>
                                    
                                    {/* Email Display */}
                                    <div className="flex items-center space-x-1.5 mt-1 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        <p className="text-xs text-gray-300 font-mono">{user.email || 'No Email Linked'}</p>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1 cursor-pointer bg-gray-800/80 px-2 py-0.5 rounded" onClick={() => { navigator.clipboard.writeText(user.id); showToast('ID Copied', 'info'); }}>
                                        <span className="text-[10px] text-gray-400">UID: {user.id}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                                    </div>

                                    <p className="text-orange-400 font-bold text-sm mt-3 uppercase tracking-wider">Level {user.level}</p>
                                    
                                    {/* Coin Progress Bar */}
                                    <div className="w-full max-w-xs mt-3">
                                        <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                                            <span>XP Progress</span>
                                            <span>{user.coins} / 50</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 shadow-inner overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-orange-600 to-yellow-400 h-full rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${(user.coins / 50) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <button onClick={() => setIsEditing(true)} className="mt-6 px-5 py-2 text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors flex items-center space-x-2 border border-gray-600">
                                        <PencilIcon />
                                        <span>EDIT PROFILE</span>
                                    </button>
                                </>
                            ) : (
                                <div className="w-full mt-4 space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400" htmlFor="edit-name">Player Name</label>
                                        <input
                                            id="edit-name"
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <FileUploader 
                                            label="Change Avatar" 
                                            onFileSelect={(base64) => setEditedAvatar(base64)} 
                                            placeholder="Upload New Avatar"
                                        />
                                    </div>
                                    <div className="flex space-x-2 pt-2">
                                        <button onClick={handleCancel} className="w-full py-2 bg-gray-600 font-semibold rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                                        <button onClick={handleSave} className="w-full py-2 bg-orange-500 font-bold rounded-lg hover:bg-orange-600 transition-colors">Save</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Friend System */}
                        <div className="my-6 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg animate-slide-in-up" style={{ animationDelay: '50ms', opacity: 0 }}>
                            <h3 className="text-lg font-bold font-orbitron text-white mb-3">Community & Friends</h3>
                            
                             {/* Pending Friend Requests */}
                             {user.friendRequests && user.friendRequests.length > 0 && (
                                <div className="mb-6 bg-gray-900/60 p-3 rounded-xl border border-orange-500/30 animate-pulse-slow">
                                    <h3 className="text-xs font-bold text-orange-400 uppercase mb-3 flex items-center">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-ping"></span>
                                        Incoming Requests ({user.friendRequests.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {user.friendRequests.map(req => (
                                            <div key={req.fromId} className="bg-gray-800 p-2 rounded-lg flex justify-between items-center border border-gray-700">
                                                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onUserClick(req.fromId)}>
                                                    <img src={req.fromAvatar} alt={req.fromName} className="w-8 h-8 rounded-full border border-gray-600" />
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{req.fromName}</p>
                                                        <p className="text-[10px] text-gray-500">ID: {req.fromId}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button onClick={() => onAcceptFriendRequest(req.fromId)} className="bg-green-600 text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-green-500">ACCEPT</button>
                                                    <button onClick={() => onRejectFriendRequest(req.fromId)} className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-red-500">✕</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 mb-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter Player ID (UID)" 
                                    className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                />
                                <button onClick={() => onSearchUser(searchId)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold">Search</button>
                            </div>

                            <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => setIsFriendsModalOpen(true)}>
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-600/20 p-2 rounded-full text-blue-400"><UsersIcon className="w-5 h-5"/></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">My Friends</p>
                                        <p className="text-xs text-gray-400">{user.friends?.length || 0} Connected</p>
                                    </div>
                                </div>
                                <span className="text-gray-400">View List →</span>
                            </div>
                        </div>

                        {/* Wallet Card */}
                        <div className="my-6 bg-gradient-to-br from-orange-600 to-yellow-500 p-6 rounded-xl shadow-lg text-white animate-slide-in-up transform transition-all hover:scale-[1.02]" style={{ animationDelay: '100ms', opacity: 0 }}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold font-orbitron tracking-wide">MY WALLET</h3>
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                    <WalletIcon />
                                </div>
                            </div>
                            <p className="text-3xl font-orbitron font-bold mt-2 text-white drop-shadow-md">रू{user.wallet.balance.toLocaleString()}</p>
                            <div className="flex space-x-4 mt-5">
                                <button 
                                    onClick={() => setIsAddMoneyModalOpen(true)}
                                    className="flex-1 py-3 bg-gray-900/30 rounded-lg backdrop-blur-md font-bold text-sm border border-white/10 hover:bg-gray-900/50 transition-colors bounce-on-click flex items-center justify-center space-x-2">
                                    <span>+</span> <span>ADD MONEY</span>
                                </button>
                                <button 
                                    onClick={() => setIsWithdrawModalOpen(true)}
                                    className="flex-1 py-3 bg-gray-900/30 rounded-lg backdrop-blur-md font-bold text-sm border border-white/10 hover:bg-gray-900/50 transition-colors bounce-on-click flex items-center justify-center space-x-2">
                                    <span>↓</span> <span>WITHDRAW</span>
                                </button>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="animate-slide-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
                            <h3 className="text-lg font-bold text-white mb-4 font-orbitron flex items-center">
                                <span className="w-1 h-5 bg-orange-500 rounded mr-2"></span>
                                TRANSACTION HISTORY
                            </h3>
                            <div className="space-y-3">
                                {user.wallet.transactions.length > 0 ? (
                                    user.wallet.transactions.sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((tx, index) => <TransactionRow key={tx.id} transaction={tx} index={index} />)
                                ) : (
                                    <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-800 border-dashed">
                                        <p className="text-gray-500 text-sm">No transactions yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* System & Support Section */}
                        <div className="my-8 animate-slide-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
                            <h3 className="text-lg font-bold text-white mb-4 font-orbitron flex items-center">
                                <span className="w-1 h-5 bg-blue-500 rounded mr-2"></span>
                                SYSTEM & SUPPORT
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <SettingsCard icon={<DiamondIcon />} label="Diamond Top-up" onClick={() => setIsDiamondTopupModalOpen(true)} />
                                <SettingsCard icon={<ShieldCheckIcon />} label="Terms & Guidelines" onClick={() => setIsTermsModalOpen(true)} />
                                <SettingsCard icon={<LockClosedIcon />} label="Privacy Policy" onClick={() => setIsPrivacyModalOpen(true)} />
                                <SettingsCard icon={<QuestionMarkCircleIcon />} label="Support" onClick={() => setIsSupportModalOpen(true)} />
                                <SettingsCard icon={<InformationCircleIcon />} label="About" onClick={() => setIsAboutModalOpen(true)} />
                                <SettingsCard icon={<CloudArrowDownIcon />} label="Check for Update" onClick={handleCheckForUpdate} status={updateStatus} />
                                <SettingsCard icon={<IdentificationIcon />} label={kycProps.label} onClick={kycProps.onClick} status={kycProps.status} />
                                <SettingsCard icon={<CalendarPlusIcon />} label="Organize Tournament" onClick={() => setIsOrganizeModalOpen(true)} />
                                <SettingsCard icon={<PlayCircleIcon />} label="Live Stream" onClick={() => setIsLiveStreamModalOpen(true)} />
                            </div>
                        </div>

                    </main>
                </PullToRefreshContainer>
            </div>

            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} balance={user.wallet.balance} onConfirmWithdraw={handleConfirmWithdraw} kycStatus={user.kycStatus} />
            <AddMoneyModal isOpen={isAddMoneyModalOpen} onClose={() => setIsAddMoneyModalOpen(false)} balance={user.wallet.balance} onConfirmAddMoney={handleConfirmAddMoney} />
            <PrivacyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
            <SupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />
            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
            <KYCModal isOpen={isKYCModalOpen} onClose={() => setIsKYCModalOpen(false)} onConfirmKYC={handleConfirmKYC} />
            <OrganizeTournamentModal isOpen={isOrganizeModalOpen} onClose={() => setIsOrganizeModalOpen(false)} onConfirm={onOrganizeTournamentRequest} />
            <LiveStreamModal isOpen={isLiveStreamModalOpen} onClose={() => setIsLiveStreamModalOpen(false)} />
            <DiamondTopupModal isOpen={isDiamondTopupModalOpen} onClose={() => setIsDiamondTopupModalOpen(false)} onConfirm={handleConfirmDiamondTopup} balance={user.wallet.balance} />
            <FriendsModal isOpen={isFriendsModalOpen} onClose={() => setIsFriendsModalOpen(false)} friends={user.friends || []} allUsers={allUsers} onUserClick={onUserClick} onChat={onChat} />
        </>
    );
};

// Icons needed for this component
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-4.944c3.545 0 6.64-.846 8.618-2.228a12.02 12.02 0 00-3-8.772z" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const QuestionMarkCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InformationCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CloudArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m-4-4l4 4 4-4" /></svg>;
const IdentificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4m-4 0H9m4 0h2m-2 0h-2m2 0h4M7 16h10" /></svg>;
const CalendarPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12v6m-3-3h6" /></svg>;
const PlayCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DiamondIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 9.5l10 12.5L22 9.5 12 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 9.5l10 2.5 10-2.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v12" /></svg>;
const UsersIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-6-6h6z" /></svg>);

export default ProfileScreen;