
import React, { useState, useEffect } from 'react';
import type { User, Tournament, Transaction, Team, TournamentMode, TournamentRequest, NotificationCategory, KYCData, TournamentCategory, VipJoinRequest, Notification, HeroSlide, LoginBanner } from '../types';
import FileUploader from './FileUploader';
import AdminTournamentManager from './AdminTournamentManager';

interface AdminDashboardProps {
    user: User; 
    updateUser: (u: User) => void;
    deleteUser: (userId: string) => void;
    allUsers: User[];
    tournaments: Tournament[];
    updateTournaments: (t: Tournament[]) => void;
    teams: Team[];
    onLogout: () => void;
    tournamentRequests?: TournamentRequest[];
    onUpdateTournamentRequest?: (reqId: string, status: 'approved' | 'rejected', fee?: number) => void;
    onBroadcastNotification?: (message: string, category: NotificationCategory) => void;
    vipJoinRequests?: VipJoinRequest[];
    onUpdateVipJoinRequest?: (reqId: string, status: VipJoinRequest['status']) => void;
    heroSlides?: HeroSlide[];
    updateHeroSlides?: (slides: HeroSlide[]) => void;
    loginBanners?: LoginBanner[];
    updateLoginBanners?: (banners: LoginBanner[]) => void;
    systemStatus?: 'online' | 'offline';
    setSystemOverride?: (mode: 'auto' | 'online' | 'offline') => void;
    systemOverride?: 'auto' | 'online' | 'offline';
    maintenanceMessage?: string;
    setMaintenanceMessage?: (msg: string) => void;
}

type Tab = 'overview' | 'users' | 'tournaments' | 'scores' | 'approvals' | 'requests' | 'vip_requests' | 'broadcast' | 'banner_add' | 'login_banner';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let color = 'bg-gray-500';
    if (['completed', 'approved', 'verified', 'joined'].includes(status)) color = 'bg-green-600';
    if (['pending', 'pending_claim', 'upcoming'].includes(status.toLowerCase())) color = 'bg-yellow-600';
    if (['rejected', 'banned', 'finished'].includes(status.toLowerCase())) color = 'bg-red-600';
    if (['live'].includes(status.toLowerCase())) color = 'bg-red-600 animate-pulse';
    if (['payment_submitted'].includes(status)) color = 'bg-blue-600';
    if (['accepted_waiting_payment'].includes(status)) color = 'bg-orange-600';
    if (['unverified'].includes(status)) color = 'bg-gray-600';

    return (
        <span className={`${color} text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

const ImagePreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; imageUrl: string | null; }> = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen || !imageUrl) return null;
    return (
        <div className="fixed inset-0 bg-black/90 z-[150] flex justify-center items-center p-4" onClick={onClose}>
             <div className="relative max-w-5xl max-h-[95vh] flex flex-col items-center">
                 <button onClick={onClose} className="absolute -top-10 right-0 text-white text-3xl hover:text-red-500">&times;</button>
                 <img src={imageUrl} alt="Proof" className="max-w-full max-h-[90vh] rounded border border-gray-600" onClick={e => e.stopPropagation()}/>
             </div>
        </div>
    );
};

const ApproveClaimModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (amount: number) => void; tournamentName: string; userName: string; defaultAmount: number; }> = ({ isOpen, onClose, onConfirm, tournamentName, userName, defaultAmount }) => {
    const [amount, setAmount] = useState(defaultAmount.toString());
    useEffect(() => { if(isOpen) setAmount(defaultAmount.toString()); }, [isOpen, defaultAmount]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[160] flex justify-center items-center p-4">
             <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-md p-6 shadow-xl">
                <h2 className="text-xl font-bold text-green-500 mb-2">Approve Prize</h2>
                <div className="bg-gray-900 p-4 rounded mb-4 text-sm border border-gray-700">
                    <p className="text-gray-400">Winner: <span className="text-white font-bold">{userName}</span></p>
                    <p className="text-gray-400">Tournament: <span className="text-white font-bold">{tournamentName}</span></p>
                </div>
                <label className="block text-gray-300 text-sm font-bold mb-2">Prize Amount (Rs)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-green-500 text-lg font-bold" />
                <div className="flex space-x-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 font-bold">Cancel</button>
                    <button onClick={() => { if(amount && parseInt(amount) > 0) onConfirm(parseInt(amount)); }} className="flex-1 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold shadow-lg shadow-green-600/20">Confirm & Send</button>
                </div>
             </div>
        </div>
    );
};

const BanUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (reason: string) => void; userName: string; }> = ({ isOpen, onClose, onConfirm, userName }) => {
    const [reason, setReason] = useState('');
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[160] flex justify-center items-center p-4">
            <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-md p-6 shadow-xl">
                <h2 className="text-xl font-bold text-red-500 mb-4">Ban User: {userName}</h2>
                <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white h-32 resize-none focus:outline-none focus:border-red-500" placeholder="Reason for suspension..." />
                <div className="flex space-x-3 mt-4">
                    <button onClick={onClose} className="flex-1 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 font-bold">Cancel</button>
                    <button onClick={() => { if(reason.trim()) onConfirm(reason); }} className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold" disabled={!reason.trim()}>Confirm Ban</button>
                </div>
            </div>
        </div>
    );
};

const VipRequestDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; request: VipJoinRequest | null; onAccept: () => void; onReject: () => void; onFinalAccept: () => void; }> = ({ isOpen, onClose, request, onAccept, onReject, onFinalAccept }) => {
    if (!isOpen || !request) return null;
    const isPaymentSubmitted = request.status === 'payment_submitted';
    const isPending = request.status === 'pending';
    const isCompleted = request.status === 'completed';
    return (
        <div className="fixed inset-0 bg-black/80 z-[140] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center sticky top-0">
                    <h2 className="text-xl font-bold text-yellow-500">VIP Request Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700 p-4 rounded border border-gray-600">
                            <p className="text-xs text-gray-400 uppercase font-bold">Tournament</p>
                            <p className="text-white font-bold text-lg">{request.tournamentName}</p>
                            <p className="text-yellow-400 font-bold">Fee: रू{request.tournamentFee}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded border border-gray-600">
                             <p className="text-xs text-gray-400 uppercase font-bold">Applicant</p>
                             <p className="text-white font-bold text-lg">{request.personalDetails.fullName}</p>
                             <p className="text-gray-300 text-sm">{request.personalDetails.phone}</p>
                             <p className="text-gray-300 text-sm">{request.personalDetails.city}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-xs text-gray-400 uppercase mb-1 font-bold">Selfie</p><img src={request.proofs.selfieUrl} className="w-full h-32 object-cover rounded bg-black" onClick={() => window.open(request.proofs.selfieUrl, '_blank')}/></div>
                        <div><p className="text-xs text-gray-400 uppercase mb-1 font-bold">Profile</p><img src={request.proofs.profileScreenshotUrl} className="w-full h-32 object-cover rounded bg-black" onClick={() => window.open(request.proofs.profileScreenshotUrl, '_blank')}/></div>
                    </div>
                    {request.paymentProof && (<div><p className="text-xs text-green-400 uppercase mb-1 font-bold">Payment Proof</p><img src={request.paymentProof} className="w-full h-40 object-contain bg-black rounded" onClick={() => window.open(request.paymentProof, '_blank')}/></div>)}
                </div>
                <div className="p-4 bg-gray-900 border-t border-gray-700 flex gap-4">
                    {!isCompleted && <button onClick={onReject} className="flex-1 py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors">Reject</button>}
                    {isPending && <button onClick={onAccept} className="flex-[2] py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors">Approve & Request Payment</button>}
                    {isPaymentSubmitted && <button onClick={onFinalAccept} className="flex-[2] py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-colors">Verify Payment & Join</button>}
                </div>
            </div>
        </div>
    );
};

const FeeInputModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (fee: number) => void; }> = ({ isOpen, onClose, onConfirm }) => {
    const [fee, setFee] = useState('');
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[160]">
             <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm border border-gray-600 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Set Hosting Fee</h3>
                <input type="number" value={fee} onChange={e => setFee(e.target.value)} placeholder="Amount in Rs" className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white mb-4 text-center text-lg font-bold" />
                <div className="flex space-x-2">
                    <button onClick={onClose} className="flex-1 bg-gray-700 py-2 rounded text-white font-bold hover:bg-gray-600">Cancel</button>
                    <button onClick={() => { if(fee) onConfirm(parseInt(fee)); }} className="flex-1 bg-green-600 py-2 rounded text-white font-bold hover:bg-green-700">Confirm</button>
                </div>
             </div>
        </div>
    );
};

const RequestDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; request: TournamentRequest | null; onApprove: () => void; onReject: () => void; }> = ({ isOpen, onClose, request, onApprove, onReject }) => {
    if (!isOpen || !request) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[150] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg w-full max-w-lg border border-gray-600 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Organizer Request</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                     <div className="bg-gray-700 p-4 rounded border border-gray-600">
                         <p className="text-orange-400 font-bold text-lg mb-2">{request.tournamentDetails.name}</p>
                         <p className="text-sm text-gray-300">Game: {request.tournamentDetails.gameName}</p>
                         <p className="text-sm text-gray-300">Contact: {request.tournamentDetails.contact}</p>
                     </div>
                     {request.paymentProof && (<img src={request.paymentProof} className="w-full h-40 object-contain bg-black rounded border border-gray-600"/>)}
                </div>
                <div className="p-4 border-t border-gray-700 bg-gray-900 flex space-x-2">
                    {request.status === 'pending' ? (
                        <>
                            <button onClick={onReject} className="flex-1 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">Reject</button>
                            <button onClick={onApprove} className="flex-1 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Approve & Set Fee</button>
                        </>
                    ) : (
                        <button onClick={onClose} className="w-full py-2 bg-gray-700 text-white font-bold rounded hover:bg-gray-600">Close</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const TransactionDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; transaction: Transaction | null; }> = ({ isOpen, onClose, transaction }) => {
    if(!isOpen || !transaction) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[150] flex justify-center items-center p-4" onClick={onClose}>
             <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-600 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <p className={`text-4xl font-bold mb-2 ${transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>{transaction.type === 'credit' ? '+' : '-'}रू{transaction.amount}</p>
                    <div className="mb-4"><StatusBadge status={transaction.status} /></div>
                    <p className="text-white font-bold">{transaction.description}</p>
                    {transaction.screenshotUrl && <img src={transaction.screenshotUrl} className="w-full mt-4 rounded border border-gray-600" onClick={() => window.open(transaction.screenshotUrl, '_blank')}/>}
                    <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-700 text-white font-bold rounded">Close</button>
                </div>
             </div>
        </div>
    );
}

const KYCDetailModal: React.FC<{ isOpen: boolean; onClose: () => void; data: KYCData | null; }> = ({ isOpen, onClose, data }) => {
    if(!isOpen || !data) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[150] flex justify-center items-center p-4" onClick={onClose}>
             <div className="bg-gray-800 rounded-lg w-full max-w-3xl border border-gray-600 p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><p className="text-sm font-bold text-gray-300 mb-2 text-center">Front</p><img src={data.frontUrl} className="w-full h-48 object-contain bg-black border border-gray-600 rounded" onClick={() => window.open(data.frontUrl, '_blank')}/></div>
                    <div><p className="text-sm font-bold text-gray-300 mb-2 text-center">Back</p><img src={data.backUrl} className="w-full h-48 object-contain bg-black border border-gray-600 rounded" onClick={() => window.open(data.backUrl, '_blank')}/></div>
                </div>
                <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-700">
                     <p className="text-gray-400 text-sm">Full Name: <span className="text-white font-bold">{data.fullName}</span></p>
                     <p className="text-gray-400 text-sm">ID Number: <span className="text-white font-bold">{data.idNumber}</span></p>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-700 text-white font-bold rounded">Close</button>
             </div>
        </div>
    );
}

const TournamentModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (t: Tournament) => void; editingTournament?: Tournament | null; }> = ({ isOpen, onClose, onSubmit, editingTournament }) => {
    const [name, setName] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [prizePool, setPrizePool] = useState('');
    const [entryFee, setEntryFee] = useState('');
    const [maxTeams, setMaxTeams] = useState('48');
    const [startDate, setStartDate] = useState('');
    const [mode, setMode] = useState<TournamentMode>('Squad');
    const [roomId, setRoomId] = useState('');
    const [roomPassword, setRoomPassword] = useState('');
    const [status, setStatus] = useState<'Upcoming' | 'Live' | 'Finished'>('Upcoming');
    const [category, setCategory] = useState<TournamentCategory>('Normal Match');
    const [bracketUrl, setBracketUrl] = useState('');
    const [leaderboardUrl, setLeaderboardUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingTournament) {
                setName(editingTournament.name);
                setBannerUrl(editingTournament.bannerUrl);
                setPrizePool(editingTournament.prizePool.toString());
                setEntryFee(editingTournament.entryFee.toString());
                setMaxTeams(editingTournament.maxTeams.toString());
                const d = new Date(editingTournament.startDate);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                setStartDate(d.toISOString().slice(0, 16));
                setMode(editingTournament.mode);
                setRoomId(editingTournament.roomId || '');
                setRoomPassword(editingTournament.roomPassword || '');
                setStatus(editingTournament.status);
                setCategory(editingTournament.category || 'Normal Match');
                setBracketUrl(editingTournament.bracketUrl || '');
                setLeaderboardUrl(editingTournament.leaderboardUrl || '');
            } else {
                setName(''); setBannerUrl(''); setPrizePool(''); setEntryFee(''); setMaxTeams('48'); setStartDate(''); setMode('Squad'); setRoomId(''); setRoomPassword(''); setStatus('Upcoming'); setCategory('Normal Match'); setBracketUrl(''); setLeaderboardUrl('');
            }
        }
    }, [isOpen, editingTournament]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tournament: Tournament = {
            id: editingTournament ? editingTournament.id : `t${Date.now()}`,
            name, bannerUrl: bannerUrl || 'https://via.placeholder.com/800x400', prizePool: parseInt(prizePool), entryFee: parseInt(entryFee), registeredTeams: editingTournament ? editingTournament.registeredTeams : 0, maxTeams: parseInt(maxTeams), startDate: new Date(startDate), createdAt: editingTournament ? editingTournament.createdAt : new Date(), status, mode, roomId, roomPassword, category, isVip: category !== 'Normal Match',
            bracketUrl, leaderboardUrl
        };
        onSubmit(tournament);
        onClose();
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-600 shadow-2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                         {(['Normal Match', 'VIP Match', 'VIP Big Match'] as TournamentCategory[]).map(cat => ( <button key={cat} type="button" onClick={() => setCategory(cat)} className={`py-2 text-xs font-bold rounded border ${category === cat ? 'bg-orange-600 border-orange-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}>{cat}</button> ))}
                    </div>
                    <input type="text" placeholder="Tournament Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required />
                    <FileUploader label="Banner Image" onFileSelect={setBannerUrl} placeholder="Upload Banner"/>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Prize Pool" value={prizePool} onChange={e => setPrizePool(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required />
                        <input type="number" placeholder="Entry Fee" value={entryFee} onChange={e => setEntryFee(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <input type="number" placeholder="Max Teams" value={maxTeams} onChange={e => setMaxTeams(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required />
                         <select value={mode} onChange={(e) => setMode(e.target.value as TournamentMode)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white"><option value="Solo">Solo</option><option value="Duo">Duo</option><option value="Squad">Squad</option></select>
                    </div>
                    <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white" required />
                    
                    {editingTournament && (
                        <div className="bg-gray-700 p-4 rounded border border-gray-600 mt-4">
                             <div className="grid grid-cols-2 gap-2 mb-2">
                                 <input type="text" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" />
                                 <input type="text" placeholder="Password" value={roomPassword} onChange={e => setRoomPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" />
                             </div>
                             <div className="flex space-x-2">
                                 {(['Upcoming', 'Live', 'Finished'] as const).map(s => ( <button type="button" key={s} onClick={() => setStatus(s)} className={`flex-1 px-3 py-1 rounded text-xs font-bold ${status === s ? 'bg-blue-600' : 'bg-gray-600'}`}>{s}</button> ))}
                             </div>
                        </div>
                    )}
                    <div className="flex space-x-4 pt-4 border-t border-gray-700"><button type="button" onClick={onClose} className="flex-1 bg-gray-700 text-white py-3 rounded font-bold">Cancel</button><button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded font-bold">Save</button></div>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, updateUser, deleteUser, allUsers, tournaments, updateTournaments, teams, onLogout, tournamentRequests = [], onUpdateTournamentRequest, onBroadcastNotification, vipJoinRequests = [], onUpdateVipJoinRequest, heroSlides = [], updateHeroSlides, loginBanners = [], updateLoginBanners, systemStatus, setSystemOverride, systemOverride, maintenanceMessage, setMaintenanceMessage }) => {
    // Persistent Tab State
    const [activeTab, setActiveTab] = useState<Tab>(() => localStorage.getItem('admin_active_tab') as Tab || 'overview');
    
    // User Management State
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');

    // Common Modals & Persistent View State
    const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
    const [approvalHistoryView, setApprovalHistoryView] = useState(() => localStorage.getItem('admin_approval_history') === 'true');
    const [requestHistoryView, setRequestHistoryView] = useState(() => localStorage.getItem('admin_request_history') === 'true');
    const [vipRequestHistoryView, setVipRequestHistoryView] = useState(() => localStorage.getItem('admin_vip_history') === 'true');
    
    // Score Management
    const [selectedTournamentIdForScores, setSelectedTournamentIdForScores] = useState<string>('');
    const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]);
    
    const [selectedRequest, setSelectedRequest] = useState<TournamentRequest | null>(null);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [selectedVipRequest, setSelectedVipRequest] = useState<VipJoinRequest | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [selectedKYC, setSelectedKYC] = useState<KYCData | null>(null);
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [isApproveClaimModalOpen, setIsApproveClaimModalOpen] = useState(false);
    const [claimData, setClaimData] = useState<{jt: any, tournamentName: string, userName: string, defaultAmount: number} | null>(null);
    
    // Banner
    const [newSlideTitle, setNewSlideTitle] = useState('');
    const [newSlideDate, setNewSlideDate] = useState('');
    const [newSlideImage, setNewSlideImage] = useState('');
    const [newSlideTournamentId, setNewSlideTournamentId] = useState('');
    
    // Login Banner
    const [newLoginBannerImage, setNewLoginBannerImage] = useState('');
    
    // Broadcast
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastCat, setBroadcastCat] = useState<NotificationCategory>('System');

    // --- Persist State Changes ---
    useEffect(() => { localStorage.setItem('admin_active_tab', activeTab); }, [activeTab]);
    useEffect(() => { localStorage.setItem('admin_approval_history', String(approvalHistoryView)); }, [approvalHistoryView]);
    useEffect(() => { localStorage.setItem('admin_request_history', String(requestHistoryView)); }, [requestHistoryView]);
    useEffect(() => { localStorage.setItem('admin_vip_history', String(vipRequestHistoryView)); }, [vipRequestHistoryView]);

    // --- Calculate Joined Players for Score Manager ---
    useEffect(() => {
        if (!selectedTournamentIdForScores) {
            setJoinedPlayers([]);
            return;
        }
        
        const tournament = tournaments.find(t => t.id === selectedTournamentIdForScores);
        if (!tournament) return;

        let players: string[] = [];
        if (tournament.category === 'VIP Big Match') {
             // Look in VIP Requests
             players = vipJoinRequests
                .filter(r => r.tournamentId === selectedTournamentIdForScores && (r.status === 'completed' || r.status === 'accepted_waiting_payment' || r.status === 'payment_submitted'))
                .map(r => r.gameDetails.gameId);
        } else {
             // Regular match - use User Names
             players = allUsers
                .filter(u => u.joinedTournaments.some(jt => jt.tournamentId === selectedTournamentIdForScores && jt.status === 'joined'))
                .map(u => u.name);
        }
        
        // Remove duplicates and empty
        setJoinedPlayers([...new Set(players.filter(p => !!p))]);

    }, [selectedTournamentIdForScores, tournaments, vipJoinRequests, allUsers]);


    const filteredTournamentRequests = requestHistoryView 
        ? tournamentRequests 
        : tournamentRequests.filter(req => req.status === 'pending');

    const filteredVipRequests = vipRequestHistoryView 
        ? vipJoinRequests 
        : vipJoinRequests.filter(req => ['pending', 'payment_submitted', 'accepted_waiting_payment'].includes(req.status));

    // --- Handlers ---
    const handleCreateTournament = (t: Tournament) => {
        if (editingTournament) { updateTournaments(tournaments.map(curr => curr.id === t.id ? t : curr)); } 
        else { updateTournaments([t, ...tournaments]); }
        setEditingTournament(null);
    };

    const handleDeleteTournament = (id: string) => { if (window.confirm("Delete tournament?")) updateTournaments(tournaments.filter(t => t.id !== id)); };
    
    const handleApproveTransaction = (tx: Transaction) => {
        const owner = allUsers.find(u => u.wallet.transactions.some(t => t.id === tx.id));
        if(!owner) return;
        const updatedWallet = { ...owner.wallet };
        const txIndex = updatedWallet.transactions.findIndex(t => t.id === tx.id);
        if (txIndex === -1) return;
        updatedWallet.transactions[txIndex].status = 'completed';
        if (tx.type === 'credit') { updatedWallet.balance += tx.amount; } 
        else { if (updatedWallet.balance >= tx.amount) updatedWallet.balance -= tx.amount; else { alert("Insufficient balance."); return; } }
        updateUser({ ...owner, wallet: updatedWallet });
    };

    const handleRejectTransaction = (tx: Transaction) => {
        const owner = allUsers.find(u => u.wallet.transactions.some(t => t.id === tx.id));
        if(!owner) return;
        const updatedWallet = { ...owner.wallet };
        const txIndex = updatedWallet.transactions.findIndex(t => t.id === tx.id);
        if (txIndex === -1) return;
        updatedWallet.transactions[txIndex].status = 'rejected';
        updateUser({ ...owner, wallet: updatedWallet });
    };
    
    const handleBanSelectedUser = (reason: string) => {
        if(!selectedUser) return;
        updateUser({ ...selectedUser, isBanned: true, banReason: reason });
        setIsBanModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleUnbanSelectedUser = () => {
        if(!selectedUser) return;
        const updatedUser = { ...selectedUser, isBanned: false, banReason: undefined };
        delete updatedUser.banReason; 
        
        updateUser(updatedUser);
        setSelectedUser(null); 
        alert(`User ${selectedUser.name} has been unbanned successfully.`);
    };

    const handleResetSelectedUser = () => {
         if(!selectedUser) return;
         if(window.confirm(`Reset stats for ${selectedUser.name}?`)) {
             updateUser({ ...selectedUser, level: 1, coins: 0 });
         }
    };

    const handleDeleteSelectedUser = () => {
        if(!selectedUser) return;
        if(window.confirm(`PERMANENTLY DELETE user ${selectedUser.name}? This cannot be undone.`)) {
            deleteUser(selectedUser.id);
            setSelectedUser(null);
        }
    };
    
    const handleUpdateKYC = (status: 'verified' | 'rejected') => {
        if (!selectedUser) return;
        const updatedUser = { ...selectedUser, kycStatus: status };
        updateUser(updatedUser);
        setSelectedUser(updatedUser); // Update local view
        setSelectedKYC(null);
        alert(`KYC Status updated to: ${status.toUpperCase()}`);
    };
    
    const handlePasswordReset = () => {
        if(!selectedUser || !newPassword.trim()) return;
        updateUser({...selectedUser, password: newPassword.trim()});
        setNewPassword('');
        alert(`Password for ${selectedUser.name} updated to: ${newPassword}`);
    };
    
    const handleAddHeroSlide = () => {
        if (!newSlideImage || !newSlideTitle || !newSlideDate || !updateHeroSlides) return;
        updateHeroSlides([...heroSlides, { id: `slide_${Date.now()}`, imageUrl: newSlideImage, title: newSlideTitle, dateLabel: newSlideDate, tournamentId: newSlideTournamentId || undefined }]);
        setNewSlideTitle(''); setNewSlideDate(''); setNewSlideImage(''); setNewSlideTournamentId('');
        alert('Slide Added');
    };
    const handleDeleteSlide = (id: string) => { if(!updateHeroSlides) return; if(window.confirm('Delete?')) updateHeroSlides(heroSlides.filter(s => s.id !== id)); };

    const handleAddLoginBanner = () => {
        if (!newLoginBannerImage || !updateLoginBanners) return;
        updateLoginBanners([...loginBanners, { id: `banner_${Date.now()}`, imageUrl: newLoginBannerImage }]);
        setNewLoginBannerImage('');
        alert('Login Banner Added');
    };
    const handleDeleteLoginBanner = (id: string) => { if(!updateLoginBanners) return; if(window.confirm('Delete?')) updateLoginBanners(loginBanners.filter(b => b.id !== id)); };

    const sendBroadcast = () => { if (broadcastMsg.trim() && onBroadcastNotification) { onBroadcastNotification(broadcastMsg, broadcastCat); setBroadcastMsg(''); alert('Sent!'); } };

    const handleFeeConfirm = (fee: number) => {
        if (selectedRequest && onUpdateTournamentRequest) {
            onUpdateTournamentRequest(selectedRequest.id, 'approved', fee);
            setIsFeeModalOpen(false);
            setSelectedRequest(null);
        }
    };

    const handleVipRequestAction = (status: VipJoinRequest['status']) => {
        if (selectedVipRequest && onUpdateVipJoinRequest) {
            onUpdateVipJoinRequest(selectedVipRequest.id, status);
            setSelectedVipRequest(null);
        }
    };

    const handleConfirmClaimApproval = (amount: number) => {
        if (claimData) {
            const userToUpdate = allUsers.find(u => u.joinedTournaments.includes(claimData.jt));
            if (userToUpdate) {
                const updatedJoined = userToUpdate.joinedTournaments.map(jt => jt === claimData.jt ? { ...jt, status: 'claimed' as const } : jt);
                const tx: Transaction = {
                    id: `tx_prize_${Date.now()}`,
                    description: `Prize for ${claimData.tournamentName}`,
                    amount: amount,
                    type: 'credit',
                    date: new Date(),
                    status: 'completed'
                };
                const notif: Notification = {
                    id: `notif_prize_${Date.now()}`,
                    message: `Congratulations! You received रू${amount} for winning ${claimData.tournamentName}.`,
                    date: new Date(),
                    read: false,
                    type: 'success',
                    category: 'System'
                };
                updateUser({
                    ...userToUpdate,
                    wallet: { ...userToUpdate.wallet, balance: userToUpdate.wallet.balance + amount, transactions: [tx, ...userToUpdate.wallet.transactions] },
                    joinedTournaments: updatedJoined,
                    notifications: [notif, ...userToUpdate.notifications]
                });
            }
        }
        setIsApproveClaimModalOpen(false);
        setClaimData(null);
    };
    
    const handleBackupDatabase = () => {
        const fullBackup = {
            timestamp: new Date().toISOString(),
            users: allUsers,
            tournaments,
            teams,
            tournamentRequests,
            vipJoinRequests,
            heroSlides,
            loginBanners
        };
        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GamePort_Backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestoreDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if(data.users && Array.isArray(data.users)) {
                    if(window.confirm(`Warning: This will overwrite ALL current data with the backup from ${data.timestamp}. Continue?`)) {
                        localStorage.setItem('gameport_users_db', JSON.stringify(data.users));
                        localStorage.setItem('gameport_tournaments', JSON.stringify(data.tournaments || []));
                        localStorage.setItem('gameport_teams', JSON.stringify(data.teams || []));
                        localStorage.setItem('gameport_requests', JSON.stringify(data.tournamentRequests || []));
                        localStorage.setItem('gameport_vip_requests', JSON.stringify(data.vipJoinRequests || []));
                        localStorage.setItem('gameport_hero_slides', JSON.stringify(data.heroSlides || []));
                        localStorage.setItem('gameport_login_banners', JSON.stringify(data.loginBanners || []));
                        alert('Restore Successful! The page will now reload.');
                        window.location.reload();
                    }
                } else {
                    alert("Invalid Backup File");
                }
            } catch(err) {
                alert("Error parsing backup file");
            }
        };
        reader.readAsText(file);
    };

    const allTransactions = allUsers.flatMap(u => u.wallet.transactions);
    const pendingDeposits = approvalHistoryView ? allTransactions.filter(t => t.type === 'credit') : allTransactions.filter(t => t.status === 'pending' && t.type === 'credit');
    const pendingWithdrawals = approvalHistoryView ? allTransactions.filter(t => t.type === 'debit') : allTransactions.filter(t => t.status === 'pending' && t.type === 'debit');

    const filteredUsers = allUsers.filter(u => 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.id.toLowerCase().includes(userSearch.toLowerCase())
    );
    
    const userTeam = selectedUser && selectedUser.teamId ? teams.find(t => t.id === selectedUser.teamId) : null;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col md:flex-row">
            <aside className="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col shadow-lg shrink-0 h-screen sticky top-0">
                <div className="p-4 bg-gray-900 border-b border-gray-700"><h1 className="text-xl font-bold text-orange-500 tracking-wider">ADMIN PANEL</h1></div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {(['overview', 'users', 'tournaments', 'scores', 'requests', 'vip_requests', 'approvals', 'broadcast', 'banner_add', 'login_banner'] as Tab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left p-3 rounded capitalize font-medium ${activeTab === tab ? 'bg-orange-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}>
                            {tab === 'banner_add' ? 'Home Banner' : tab === 'login_banner' ? 'Login Banner' : tab === 'vip_requests' ? 'VIP Requests' : tab}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700 bg-gray-900"><button onClick={onLogout} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded">Logout</button></div>
            </aside>

            <div className="flex-1 overflow-y-auto h-screen bg-gray-900">
                 <header className="md:hidden bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-20">
                     <span className="font-bold text-orange-500">ADMIN PANEL</span>
                     <button onClick={onLogout} className="text-xs border border-red-500 text-red-400 px-2 py-1 rounded">Logout</button>
                 </header>
                 <div className="md:hidden flex overflow-x-auto p-2 bg-gray-800 space-x-2 border-b border-gray-700 sticky top-[60px] z-20">
                     {(['overview', 'users', 'tournaments', 'scores', 'requests', 'vip_requests', 'approvals', 'broadcast', 'banner_add', 'login_banner'] as Tab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded text-xs whitespace-nowrap capitalize font-bold ${activeTab === tab ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{tab === 'banner_add' ? 'Home' : tab === 'login_banner' ? 'Login' : tab.replace('_', ' ')}</button>
                    ))}
                 </div>

                 <main className="p-6 pb-24">
                     {activeTab === 'overview' && (
                        <div>
                            <div className={`p-4 rounded border mb-8 shadow-lg transition-colors ${systemStatus === 'offline' ? 'bg-red-900/20 border-red-500' : 'bg-green-900/20 border-green-500'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className={`text-xl font-bold font-orbitron ${systemStatus === 'offline' ? 'text-red-500' : 'text-green-500'}`}>
                                            SERVER IS {systemStatus?.toUpperCase()}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            Current Mode: <span className="font-bold text-white uppercase">{systemOverride === 'auto' ? 'Auto Schedule (10AM - 5PM)' : systemOverride === 'online' ? 'Forced Online' : 'Forced Offline'}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                        <button 
                                            onClick={() => setSystemOverride && setSystemOverride('auto')}
                                            className={`px-4 py-2 rounded font-bold text-xs transition-colors ${systemOverride === 'auto' ? 'bg-blue-600 text-white shadow' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            AUTO SCHEDULE
                                        </button>
                                        <button 
                                            onClick={() => setSystemOverride && setSystemOverride('online')}
                                            className={`px-4 py-2 rounded font-bold text-xs transition-colors ${systemOverride === 'online' ? 'bg-green-600 text-white shadow' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            FORCE ONLINE
                                        </button>
                                        <button 
                                            onClick={() => setSystemOverride && setSystemOverride('offline')}
                                            className={`px-4 py-2 rounded font-bold text-xs transition-colors ${systemOverride === 'offline' ? 'bg-red-600 text-white shadow' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                        >
                                            FORCE OFFLINE
                                        </button>
                                    </div>
                                </div>
                                
                                {systemStatus === 'offline' && setMaintenanceMessage && (
                                    <div className="mt-2 border-t border-gray-700 pt-4">
                                        <label className="text-xs text-red-300 font-bold uppercase mb-1 block">Maintenance Reason (Displayed to Users)</label>
                                        <input 
                                            type="text" 
                                            value={maintenanceMessage} 
                                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                                            className="w-full bg-gray-900 border border-red-500/50 rounded p-2 text-white text-sm focus:outline-none focus:border-red-500"
                                            placeholder="e.g. Server Maintenance in progress..." 
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-800 p-4 rounded border border-gray-700 mb-8 shadow-lg">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                    <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                    Real-time Activity Feed
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {tournamentRequests.filter(r => r.status === 'pending').map(r => (
                                        <div key={r.id} onClick={() => setActiveTab('requests')} className="text-sm bg-gray-900 p-2 rounded border border-gray-700 cursor-pointer hover:bg-gray-800 text-blue-300">New Tournament Request: {r.tournamentDetails.name}</div>
                                    ))}
                                    {vipJoinRequests.filter(r => r.status === 'pending').map(r => (
                                        <div key={r.id} onClick={() => setActiveTab('vip_requests')} className="text-sm bg-gray-900 p-2 rounded border border-gray-700 cursor-pointer hover:bg-gray-800 text-yellow-300">New VIP Match Request: {r.tournamentName}</div>
                                    ))}
                                    {pendingDeposits.map(d => (
                                        <div key={d.id} onClick={() => setActiveTab('approvals')} className="text-sm bg-gray-900 p-2 rounded border border-gray-700 cursor-pointer hover:bg-gray-800 text-green-300">Pending Deposit: +रू{d.amount}</div>
                                    ))}
                                     {pendingWithdrawals.map(d => (
                                        <div key={d.id} onClick={() => setActiveTab('approvals')} className="text-sm bg-gray-900 p-2 rounded border border-gray-700 cursor-pointer hover:bg-gray-800 text-red-300">Pending Withdrawal: -रू{d.amount}</div>
                                    ))}
                                    {tournamentRequests.length === 0 && vipJoinRequests.length === 0 && pendingDeposits.length === 0 && pendingWithdrawals.length === 0 && (
                                        <p className="text-gray-500 italic">No new activity.</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gray-800 p-6 rounded border border-gray-700 shadow"><p className="text-gray-400 text-xs uppercase font-bold">Total Users</p><p className="text-3xl font-bold text-white mt-2">{allUsers.length}</p></div>
                                <div className="bg-gray-800 p-6 rounded border border-gray-700 shadow"><p className="text-gray-400 text-xs uppercase font-bold">Live Matches</p><p className="text-3xl font-bold text-red-500 animate-pulse mt-2">{tournaments.filter(t => t.status === 'Live').length}</p></div>
                                <div className="bg-gray-800 p-6 rounded border border-gray-700 shadow"><p className="text-gray-400 text-xs uppercase font-bold">Pending Dep.</p><p className="text-3xl font-bold text-yellow-500 mt-2">{pendingDeposits.length}</p></div>
                                <div className="bg-gray-800 p-6 rounded border border-gray-700 shadow"><p className="text-gray-400 text-xs uppercase font-bold">Pending Req.</p><p className="text-3xl font-bold text-blue-500 mt-2">{tournamentRequests.filter(r => r.status === 'pending').length}</p></div>
                            </div>

                            <div className="bg-gray-800 p-6 rounded border border-gray-600 mb-8">
                                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">System Backup & Security</h3>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 bg-gray-900 p-4 rounded border border-gray-700">
                                        <p className="font-bold text-green-400 mb-2">1. Backup Database</p>
                                        <p className="text-xs text-gray-400 mb-3">Download a secure JSON file containing all users, tournaments, and history. Keep this file safe.</p>
                                        <button onClick={handleBackupDatabase} className="w-full py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded text-sm transition-colors">Download Full Backup</button>
                                    </div>
                                    <div className="flex-1 bg-gray-900 p-4 rounded border border-gray-700">
                                        <p className="font-bold text-blue-400 mb-2">2. Restore Database</p>
                                        <p className="text-xs text-gray-400 mb-3">Upload a previously saved backup file to restore the entire system state (Upgrade Safe).</p>
                                        <label className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded text-sm transition-colors text-center cursor-pointer block">
                                            Upload Backup File
                                            <input type="file" accept=".json" onChange={handleRestoreDatabase} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                     )}

                     {activeTab === 'users' && (
                         <div>
                            <h2 className="text-xl font-bold text-white mb-4">User Management Database</h2>
                            <div className="mb-4">
                                <input 
                                    type="text" 
                                    placeholder="Search by Name or ID..." 
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white focus:border-orange-500 outline-none"
                                />
                            </div>

                            {selectedUser ? (
                                <div className="bg-gray-800 p-6 rounded border border-gray-700 shadow-lg animate-fade-in">
                                     <button onClick={() => setSelectedUser(null)} className="mb-4 text-blue-400 text-sm hover:underline">← Back to List</button>
                                     <div className="flex items-center space-x-6 mb-6">
                                         <img src={selectedUser.avatar} className="w-20 h-20 rounded-full border-4 border-orange-500" />
                                         <div className="flex-1">
                                             <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
                                             <div className="flex flex-wrap gap-2 mt-2 items-center">
                                                 <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${selectedUser.isBanned ? 'bg-red-600' : 'bg-green-600'}`}>{selectedUser.isBanned ? 'BANNED' : 'ACTIVE'}</span>
                                                 <p className="text-sm font-bold bg-gray-700 px-2 rounded text-white flex items-center">
                                                    KYC: {selectedUser.kycStatus.toUpperCase()}
                                                    {selectedUser.kycData && <button onClick={() => setSelectedKYC(selectedUser.kycData)} className="ml-2 text-xs text-blue-400 underline">View</button>}
                                                 </p>
                                             </div>
                                             {selectedUser.kycStatus === 'pending' && (
                                                <div className="mt-2 flex space-x-2">
                                                    <button onClick={() => handleUpdateKYC('verified')} className="bg-green-600 text-white px-3 py-1 text-xs rounded font-bold hover:bg-green-700">Approve KYC</button>
                                                    <button onClick={() => handleUpdateKYC('rejected')} className="bg-red-600 text-white px-3 py-1 text-xs rounded font-bold hover:bg-red-700">Reject KYC</button>
                                                </div>
                                             )}
                                             <p className="text-gray-400 text-sm mt-1">ID: {selectedUser.id}</p>
                                             {selectedUser.email && <p className="text-gray-400 text-sm">Email: <span className="text-white">{selectedUser.email}</span></p>}
                                             
                                             <p className="text-yellow-400 font-bold mt-2 text-xl">Wallet Balance: रू{selectedUser.wallet.balance.toLocaleString()}</p> 
                                         </div>
                                     </div>
                                     
                                     {userTeam ? (
                                         <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-6">
                                             <h3 className="text-orange-400 font-bold uppercase text-xs mb-3">Team Information</h3>
                                             <div className="flex items-center space-x-3 mb-3">
                                                 <img src={userTeam.avatar} className="w-10 h-10 rounded-full border border-gray-600" />
                                                 <div>
                                                     <p className="font-bold text-white">{userTeam.name}</p>
                                                     <p className="text-xs text-gray-400">Captain: {userTeam.captain.name}</p>
                                                 </div>
                                             </div>
                                             <p className="text-xs text-gray-500 mb-1">Members:</p>
                                             <div className="flex -space-x-2">
                                                 {userTeam.members.map(m => (
                                                     <img key={m.id} src={m.avatar} title={m.name} className="w-8 h-8 rounded-full border-2 border-gray-800" />
                                                 ))}
                                             </div>
                                         </div>
                                     ) : (
                                        <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-6">
                                            <p className="text-gray-500 italic">User is not in a team.</p>
                                        </div>
                                     )}

                                     <div className="flex space-x-4 border-t border-gray-700 pt-6">
                                         {selectedUser.isBanned ? (
                                             <button onClick={handleUnbanSelectedUser} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold transition-colors">Unban User</button>
                                         ) : (
                                             <button onClick={() => setIsBanModalOpen(true)} className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition-colors">Ban User</button>
                                         )}
                                         <button onClick={handleResetSelectedUser} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold transition-colors">Reset Stats</button>
                                         <button onClick={handleDeleteSelectedUser} className="px-6 py-2 bg-red-800 hover:bg-red-900 rounded text-white font-bold transition-colors ml-auto">Delete User</button>
                                     </div>
                                     
                                     <div className="mt-8">
                                         <h3 className="font-bold text-gray-300 border-b border-gray-700 pb-2 mb-2">Recent Transactions</h3>
                                         <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                            {selectedUser.wallet.transactions.length > 0 ? selectedUser.wallet.transactions.slice(0, 5).map(t => (
                                                <div key={t.id} className="text-xs flex justify-between text-gray-400">
                                                    <span>{t.description}</span>
                                                    <span className={t.type === 'credit' ? 'text-green-500' : 'text-red-500'}>{t.type === 'credit' ? '+' : '-'} {t.amount}</span>
                                                </div>
                                            )) : <p className="text-gray-500 text-xs">No transactions found.</p>}
                                         </div>
                                     </div>
                                </div>
                            ) : (
                                <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
                                    <div className="grid grid-cols-5 bg-gray-900 p-3 text-xs font-bold text-gray-400 uppercase sticky top-0 z-10 border-b border-gray-700">
                                        <div className="col-span-2">Name</div>
                                        <div className="col-span-1">KYC</div>
                                        <div className="col-span-1">Wallet</div>
                                        <div className="col-span-1 text-right">Action</div>
                                    </div>
                                    <div className="divide-y divide-gray-700">
                                        {filteredUsers.map(u => (
                                            <div key={u.id} className="grid grid-cols-5 p-3 items-center hover:bg-gray-750 transition-colors">
                                                <div className="col-span-2 flex items-center space-x-2 truncate">
                                                    <img src={u.avatar} className="w-6 h-6 rounded-full" />
                                                    <span className={`text-sm font-bold truncate ${u.isBanned ? 'text-red-400 line-through' : 'text-white'}`}>{u.name}</span>
                                                </div>
                                                <div className="col-span-1">
                                                    <StatusBadge status={u.kycStatus} />
                                                </div>
                                                <div className="col-span-1 text-sm text-yellow-500 font-bold">रू{u.wallet.balance}</div>
                                                <div className="col-span-1 text-right">
                                                    <button onClick={() => setSelectedUser(u)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded font-bold hover:bg-blue-700">Manage</button>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredUsers.length === 0 && <div className="p-4 text-center text-gray-500">No users found.</div>}
                                    </div>
                                </div>
                            )}
                         </div>
                     )}
                     
                     {activeTab === 'scores' && (
                         <div>
                             <h2 className="text-xl font-bold text-white mb-4">Bracket & Leaderboard Manager</h2>
                             <div className="mb-6">
                                 <label className="text-sm text-gray-400 font-bold mb-2 block">Select Tournament to Manage</label>
                                 <select 
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white"
                                    onChange={(e) => setSelectedTournamentIdForScores(e.target.value)}
                                    value={selectedTournamentIdForScores}
                                 >
                                     <option value="">-- Select Tournament --</option>
                                     {tournaments.filter(t => t.category !== 'Normal Match').map(t => (
                                         <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                                     ))}
                                 </select>
                             </div>
                             
                             {selectedTournamentIdForScores ? (
                                 <AdminTournamentManager tournamentId={selectedTournamentIdForScores} joinedPlayers={joinedPlayers} />
                             ) : (
                                 <div className="p-8 text-center border-2 border-dashed border-gray-700 rounded text-gray-500">
                                     Select a VIP or Big Match tournament to manage scores.
                                 </div>
                             )}
                         </div>
                     )}

                     {activeTab === 'tournaments' && (
                         <div>
                             <button onClick={() => { setEditingTournament(null); setIsTournamentModalOpen(true); }} className="mb-6 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded font-bold shadow-lg transition-colors flex items-center">
                                 <span className="text-xl mr-2">+</span> Create Tournament
                             </button>
                             <div className="space-y-4">
                                 {tournaments.map(t => (
                                     <div key={t.id} className="bg-gray-800 p-5 rounded border border-gray-700 shadow flex flex-col md:flex-row justify-between items-center hover:bg-gray-750 transition-colors">
                                         <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
                                             <img src={t.bannerUrl} className="w-16 h-16 object-cover rounded border border-gray-600" />
                                             <div>
                                                 <div className="flex items-center space-x-2">
                                                     <h3 className="font-bold text-white text-lg">{t.name}</h3>
                                                     {(t.isVip || t.category === 'VIP Big Match') && <span className="bg-yellow-600 text-black text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">VIP</span>}
                                                     <StatusBadge status={t.status} />
                                                 </div>
                                                 <p className="text-sm text-gray-400 mt-1">Prize: रू{t.prizePool} | Fee: रू{t.entryFee} | {t.mode}</p>
                                             </div>
                                         </div>
                                         <div className="flex space-x-3">
                                             <button onClick={() => { setEditingTournament(t); setIsTournamentModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded font-bold transition-colors">Edit</button>
                                             <button onClick={() => handleDeleteTournament(t.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded font-bold transition-colors">Delete</button>
                                         </div>
                                     </div>
                                 ))}
                                 {tournaments.length === 0 && <p className="text-gray-500 text-center py-10">No tournaments created yet.</p>}
                             </div>
                         </div>
                     )}

                     {activeTab === 'requests' && (
                         <div className="space-y-4">
                             <div className="flex bg-gray-800 p-1 rounded w-fit border border-gray-700 mb-4 sticky top-0 z-10">
                                 <button onClick={() => setRequestHistoryView(false)} className={`px-4 py-2 rounded text-xs font-bold transition-all ${!requestHistoryView ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Pending</button>
                                 <button onClick={() => setRequestHistoryView(true)} className={`px-4 py-2 rounded text-xs font-bold transition-all ${requestHistoryView ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>History</button>
                             </div>
                             <div className="space-y-4">
                                 {filteredTournamentRequests.map(req => (
                                     <div key={req.id} onClick={() => setSelectedRequest(req)} className="bg-gray-800 p-5 rounded border border-gray-700 hover:bg-gray-750 cursor-pointer flex justify-between items-center shadow transition-all hover:scale-[1.01]">
                                         <div>
                                             <p className="font-bold text-white text-lg">{req.tournamentDetails.name}</p>
                                             <p className="text-sm text-gray-400">Organizer: <span className="text-white">{req.userName}</span></p>
                                         </div>
                                         <div className="text-right">
                                             <StatusBadge status={req.status} />
                                             {req.adminFee && <p className="text-sm text-green-400 mt-1 font-bold">Fee: रू{req.adminFee}</p>}
                                         </div>
                                     </div>
                                 ))}
                                 {filteredTournamentRequests.length === 0 && <p className="text-gray-500 text-center py-10 bg-gray-800 rounded border border-gray-700">No requests found.</p>}
                             </div>
                         </div>
                     )}
                     
                     {activeTab === 'vip_requests' && (
                        <div className="space-y-4">
                            <div className="flex bg-gray-800 p-1 rounded w-fit border border-gray-700 mb-4 sticky top-0 z-10">
                                 <button onClick={() => setVipRequestHistoryView(false)} className={`px-4 py-2 rounded text-xs font-bold transition-all ${!vipRequestHistoryView ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Pending</button>
                                 <button onClick={() => setVipRequestHistoryView(true)} className={`px-4 py-2 rounded text-xs font-bold transition-all ${vipRequestHistoryView ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>History</button>
                            </div>
                            <div className="space-y-4">
                                {filteredVipRequests.map(req => (
                                     <div key={req.id} onClick={() => setSelectedVipRequest(req)} className="bg-gray-800 p-4 rounded border border-gray-700 hover:border-yellow-500 cursor-pointer flex items-center space-x-4 shadow transition-all hover:bg-gray-750">
                                         <img src={req.proofs.selfieUrl} className="w-12 h-12 rounded-full object-cover border-2 border-gray-600" />
                                         <div className="flex-1">
                                             <p className="font-bold text-white text-lg">{req.personalDetails.fullName}</p>
                                             <p className="text-sm text-gray-400">Applying for: <span className="text-yellow-500 font-bold">{req.tournamentName}</span></p>
                                         </div>
                                         <StatusBadge status={req.status} />
                                     </div>
                                 ))}
                                 {filteredVipRequests.length === 0 && <p className="text-gray-500 text-center py-10 bg-gray-800 rounded border border-gray-700">No requests found.</p>}
                            </div>
                        </div>
                     )}

                     {activeTab === 'approvals' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="col-span-full mb-2 flex bg-gray-800 p-1 rounded w-fit border border-gray-700 sticky top-0 z-10 h-fit">
                                 <button onClick={() => setApprovalHistoryView(false)} className={`px-6 py-2 rounded text-sm font-bold transition-all ${!approvalHistoryView ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Pending</button>
                                 <button onClick={() => setApprovalHistoryView(true)} className={`px-6 py-2 rounded text-sm font-bold transition-all ${approvalHistoryView ? 'bg-orange-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>History</button>
                             </div>

                             <div className="bg-gray-800 p-4 rounded border border-gray-700 shadow-lg flex flex-col">
                                 <h3 className="font-bold text-white mb-4 flex items-center shrink-0"><span className="w-2 h-6 bg-green-500 mr-2 rounded"></span> Deposits</h3>
                                 <div className="space-y-3">
                                     {pendingDeposits.map(tx => (
                                         <div key={tx.id} className="bg-gray-900 p-3 rounded flex justify-between items-center border border-gray-700">
                                             <div>
                                                 <p className="font-bold text-green-400 text-lg">+रू{tx.amount}</p>
                                                 <p className="text-xs text-gray-400">{tx.description}</p>
                                                 {tx.screenshotUrl && <button onClick={() => setSelectedImage(tx.screenshotUrl!)} className="text-xs text-blue-400 underline mt-1 block">View Proof</button>}
                                             </div>
                                             {!approvalHistoryView ? (
                                                 <div className="flex gap-2">
                                                     <button onClick={() => handleApproveTransaction(tx)} className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center font-bold">✓</button>
                                                     <button onClick={() => handleRejectTransaction(tx)} className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center font-bold">✕</button>
                                                 </div>
                                             ) : <StatusBadge status={tx.status} />}
                                         </div>
                                     ))}
                                     {pendingDeposits.length === 0 && <p className="text-sm text-gray-500 italic">No deposit records.</p>}
                                 </div>
                             </div>

                             <div className="bg-gray-800 p-4 rounded border border-gray-700 shadow-lg flex flex-col">
                                 <h3 className="font-bold text-white mb-4 flex items-center shrink-0"><span className="w-2 h-6 bg-red-500 mr-2 rounded"></span> Withdrawals</h3>
                                 <div className="space-y-3">
                                     {pendingWithdrawals.map(tx => (
                                         <div key={tx.id} className="bg-gray-900 p-3 rounded flex justify-between items-center border border-gray-700">
                                             <div>
                                                 <p className="font-bold text-red-400 text-lg">-रू{tx.amount}</p>
                                                 <button onClick={() => setSelectedTransaction(tx)} className="text-xs text-blue-400 underline mt-1 block">View Details</button>
                                             </div>
                                             {!approvalHistoryView ? (
                                                 <div className="flex gap-2">
                                                     <button onClick={() => handleApproveTransaction(tx)} className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center font-bold">✓</button>
                                                     <button onClick={() => handleRejectTransaction(tx)} className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center font-bold">✕</button>
                                                 </div>
                                             ) : <StatusBadge status={tx.status} />}
                                         </div>
                                     ))}
                                     {pendingWithdrawals.length === 0 && <p className="text-sm text-gray-500 italic">No withdrawal records.</p>}
                                 </div>
                             </div>
                         </div>
                     )}
                     
                     {activeTab === 'broadcast' && (
                         <div className="bg-gray-800 p-8 rounded border border-gray-700 max-w-2xl mx-auto shadow-xl">
                             <h3 className="font-bold text-2xl text-white mb-6 text-center">System Broadcast</h3>
                             <div className="flex justify-center space-x-4 mb-6">{(['System', 'Big Match', 'Normal Match'] as NotificationCategory[]).map(cat => ( <button key={cat} onClick={() => setBroadcastCat(cat)} className={`px-4 py-2 rounded text-sm font-bold border transition-colors ${broadcastCat === cat ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>{cat}</button> ))}</div>
                             <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-4 text-white h-40 mb-6 resize-none focus:outline-none focus:border-orange-500" placeholder="Type message..." />
                             <button onClick={sendBroadcast} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded shadow-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={!broadcastMsg}>Send Notification</button>
                         </div>
                     )}
                     
                     {activeTab === 'banner_add' && (
                         <div className="max-w-4xl mx-auto space-y-6">
                              <div className="bg-gray-800 p-6 rounded border border-gray-700 shadow-lg">
                                 <h3 className="font-bold text-xl text-white mb-4">Home Screen Banners (Hero Slider)</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Title</label><input type="text" value={newSlideTitle} onChange={e => setNewSlideTitle(e.target.value)} placeholder="Slide Title" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
                                     <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Date/Text</label><input type="text" value={newSlideDate} onChange={e => setNewSlideDate(e.target.value)} placeholder="e.g. Starts 15 Oct" className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" /></div>
                                      <div className="col-span-full"><FileUploader label="Upload Poster" onFileSelect={setNewSlideImage} placeholder="Upload Slide Image" /></div>
                                 </div>
                                 <button onClick={handleAddHeroSlide} className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow">Add Home Banner</button>
                                 
                                 <div className="mt-6 border-t border-gray-700 pt-4">
                                     <h4 className="text-sm font-bold text-gray-400 mb-2">Active Home Banners</h4>
                                     <div className="space-y-2">
                                         {heroSlides.map((slide) => ( <div key={slide.id} className="bg-gray-900 p-2 rounded border border-gray-700 flex items-center space-x-4"><img src={slide.imageUrl} className="w-16 h-10 object-cover rounded border border-gray-600" /><div className="flex-1 text-xs"><p className="font-bold text-white">{slide.title}</p></div><button onClick={() => handleDeleteSlide(slide.id)} className="text-red-500 font-bold text-xs hover:underline">Delete</button></div> ))}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}

                     {activeTab === 'login_banner' && (
                         <div className="max-w-4xl mx-auto space-y-6">
                             <div className="bg-gray-800 p-6 rounded border border-gray-700 shadow-lg">
                                 <h3 className="font-bold text-xl text-white mb-4">Login Screen Backgrounds</h3>
                                 <p className="text-xs text-gray-400 mb-4">Manage the images that appear on the sliding background of the User Login/Signup screen.</p>
                                 <FileUploader label="Upload Login Background" onFileSelect={setNewLoginBannerImage} placeholder="Upload Image (Portrait Recommended)" />
                                 <button onClick={handleAddLoginBanner} className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow">Add Login Banner</button>
                                 
                                 <div className="mt-6 border-t border-gray-700 pt-4">
                                     <h4 className="text-sm font-bold text-gray-400 mb-2">Active Login Backgrounds</h4>
                                     <div className="grid grid-cols-3 gap-2">
                                         {loginBanners.map((banner) => (
                                             <div key={banner.id} className="relative group">
                                                 <img src={banner.imageUrl} className="w-full h-24 object-cover rounded border border-gray-600" />
                                                 <button onClick={() => handleDeleteLoginBanner(banner.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                             </div>
                                         ))}
                                         {loginBanners.length === 0 && <p className="text-xs text-gray-500 col-span-3">No login banners set. Using defaults.</p>}
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}
                 </main>
            </div>

            <TournamentModal isOpen={isTournamentModalOpen} onClose={() => setIsTournamentModalOpen(false)} onSubmit={handleCreateTournament} editingTournament={editingTournament} />
            <RequestDetailsModal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} request={selectedRequest} onApprove={() => setIsFeeModalOpen(true)} onReject={() => { if(selectedRequest && onUpdateTournamentRequest) onUpdateTournamentRequest(selectedRequest.id, 'rejected'); setSelectedRequest(null); }} />
            <FeeInputModal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} onConfirm={handleFeeConfirm} />
            <ImagePreviewModal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} imageUrl={selectedImage} />
            <TransactionDetailModal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} transaction={selectedTransaction} />
            <KYCDetailModal isOpen={!!selectedKYC} onClose={() => setSelectedKYC(null)} data={selectedKYC} />
            <VipRequestDetailModal isOpen={!!selectedVipRequest} onClose={() => setSelectedVipRequest(null)} request={selectedVipRequest} onAccept={() => handleVipRequestAction('accepted_waiting_payment')} onReject={() => handleVipRequestAction('rejected')} onFinalAccept={() => handleVipRequestAction('completed')} />
            <BanUserModal isOpen={isBanModalOpen} onClose={() => setIsBanModalOpen(false)} onConfirm={handleBanSelectedUser} userName={selectedUser ? selectedUser.name : ''} />
            {claimData && <ApproveClaimModal isOpen={isApproveClaimModalOpen} onClose={() => { setIsApproveClaimModalOpen(false); setClaimData(null); }} onConfirm={handleConfirmClaimApproval} tournamentName={claimData.tournamentName} userName={claimData.userName} defaultAmount={claimData.defaultAmount} />}
        </div>
    );
};

export default AdminDashboard;
