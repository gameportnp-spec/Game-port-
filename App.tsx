
import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import BottomNav from './components/BottomNav';
import PageContainer from './components/PageContainer';
import TournamentDetailScreen from './components/TournamentDetailScreen';
import BracketScreen from './components/BracketScreen';
import TournamentsScreen from './components/TournamentsScreen';
import ProfileScreen from './components/ProfileScreen';
import NotificationsScreen from './components/NotificationsScreen';
import TeamsScreen from './components/TeamsScreen';
import ManageTeamScreen from './components/ManageTeamScreen';
import ToastContainer from './components/ToastContainer';
import NotificationPopup from './components/NotificationPopup';
import AdminDashboard from './components/AdminDashboard'; 
import AddMoneyModal from './components/AddMoneyModal'; 
import { MOCK_TOURNAMENTS, MOCK_TEAMS, MOCK_USER } from './constants';
import GarenaTopupCenter from './components/GarenaTopupCenter';
import FileUploader from './components/FileUploader';
import BanScreen from './components/BanScreen';
import MaintenanceScreen from './components/MaintenanceScreen';
import PublicProfileModal from './components/PublicProfileModal';
import WithdrawModal from './components/WithdrawModal'; 
import ChatModal from './components/ChatModal';

import type { User, Tournament, Toast, Team, Transaction, Notification, Server, KYCData, TournamentRequest, NotificationCategory, VipJoinRequest, HeroSlide, LoginBanner } from './types';

export type Page = 'home' | 'tournaments' | 'teams' | 'profile' | 'notifications';
type DetailPage = { type: 'tournament-detail', id: string } | { type: 'bracket', id: string } | { type: 'manage-team', id: string };

interface PaymentModalState {
    isOpen: boolean;
    amount: number;
    description: string;
    onConfirm: (proofUrl: string) => void;
}

const ADMIN_PROFILE: User = {
    id: 'admin_001',
    name: 'GamePort Admin',
    avatar: 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png',
    level: 99,
    coins: 9999,
    joinedTournaments: [],
    notifications: [],
    wallet: { balance: 999999, transactions: [] },
    kycStatus: 'verified',
    email: 'admin@gameport.np',
    password: 'admin',
    isOnline: true // Admin is always online
};

const App: React.FC = () => {
    // --- State Initialization ---
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
    const [activeTab, setActiveTab] = useState<Page>('home');
    const [detailPage, setDetailPage] = useState<DetailPage | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [popupData, setPopupData] = useState<any>(null);

    // Data Store
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [tournamentRequests, setTournamentRequests] = useState<TournamentRequest[]>([]);
    const [vipJoinRequests, setVipJoinRequests] = useState<VipJoinRequest[]>([]);
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [loginBanners, setLoginBanners] = useState<LoginBanner[]>([]);

    // System Status
    const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online');
    const [systemOverride, setSystemOverride] = useState<'auto' | 'online' | 'offline'>('auto');
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [nextOpeningTime, setNextOpeningTime] = useState<Date | undefined>(undefined);

    // Modals & UI State
    const [paymentModal, setPaymentModal] = useState<PaymentModalState>({ isOpen: false, amount: 0, description: '', onConfirm: () => {} });
    const [publicProfileUser, setPublicProfileUser] = useState<User | null>(null);
    const [isPublicProfileOpen, setIsPublicProfileOpen] = useState(false);
    const [generatedCode, setGeneratedCode] = useState(''); 
    
    // Chat State
    const [currentChatFriend, setCurrentChatFriend] = useState<User | null>(null);

    // --- Helpers ---
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const rehydrateUser = (u: any): User => ({
        ...MOCK_USER,
        ...u,
        wallet: { 
            balance: u.wallet?.balance || 0, 
            transactions: (u.wallet?.transactions || []).map((t: any) => ({ ...t, date: new Date(t.date) })) 
        },
        notifications: (u.notifications || []).map((n: any) => ({ ...n, date: new Date(n.date) })),
        joinedTournaments: u.joinedTournaments || [],
        friends: u.friends || [],
        friendRequests: (u.friendRequests || []).map((r: any) => ({ ...r, date: new Date(r.date) })),
        // Ensure password is treated as a string and exists. Default to '123456' if totally missing, but preserve empty string for guests.
        password: (u.password !== undefined && u.password !== null) ? String(u.password) : '123456',
        // Default online status
        isOnline: false,
        lastSeen: new Date()
    });

    // --- Load Data ---
    useEffect(() => {
        const loadData = () => {
            try {
                // 1. Users
                const storedUsers = localStorage.getItem('gameport_users_db');
                let users = storedUsers ? JSON.parse(storedUsers).map(rehydrateUser) : [];
                
                // Fallback / Auto-Recovery
                if (users.length === 0) {
                    const backup = localStorage.getItem('gameport_auto_recovery');
                    if (backup) {
                        users = JSON.parse(backup).map(rehydrateUser);
                    }
                }
                
                setAllUsers(users);

                // 2. Tournaments
                const storedTournaments = localStorage.getItem('gameport_tournaments');
                if (storedTournaments) {
                    const parsedTournaments = JSON.parse(storedTournaments).map((t: any) => ({ 
                        ...t, 
                        startDate: new Date(t.startDate), 
                        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
                        // SANITIZATION: Ensure registeredTeamIds exists
                        registeredTeamIds: t.registeredTeamIds || []
                    }));
                    setTournaments(parsedTournaments);
                } else {
                    // System starts empty - Admin must create tournaments
                    setTournaments([]);
                }

                // 3. Teams
                const storedTeams = localStorage.getItem('gameport_teams');
                setTeams(storedTeams ? JSON.parse(storedTeams) : MOCK_TEAMS);

                // 4. Requests & System Data
                const storedRequests = localStorage.getItem('gameport_requests');
                if (storedRequests) setTournamentRequests(JSON.parse(storedRequests));

                const storedVipRequests = localStorage.getItem('gameport_vip_requests');
                if (storedVipRequests) setVipJoinRequests(JSON.parse(storedVipRequests));
                
                const storedHeroSlides = localStorage.getItem('gameport_hero_slides');
                if (storedHeroSlides) setHeroSlides(JSON.parse(storedHeroSlides));

                const storedLoginBanners = localStorage.getItem('gameport_login_banners');
                if (storedLoginBanners) setLoginBanners(JSON.parse(storedLoginBanners));

                const storedSystemStatus = localStorage.getItem('gameport_system_status');
                if (storedSystemStatus) {
                    const statusData = JSON.parse(storedSystemStatus);
                    setSystemOverride(statusData.override || 'auto');
                    setMaintenanceMessage(statusData.message || '');
                }

                // 5. Auto-Login
                const savedSession = localStorage.getItem('gameport_session_user');
                if (savedSession) {
                    const sessionUser = rehydrateUser(JSON.parse(savedSession));
                    const dbUser = users.find((u: User) => u.id === sessionUser.id);
                    if (dbUser) {
                        setCurrentUser({ ...dbUser, isOnline: true }); // Make me online
                        setIsLoggedIn(true);
                        
                        // Check for missed broadcast popup
                        const unreadBroadcast = dbUser.notifications.find((n: Notification) => !n.read && n.category === 'System' && (new Date().getTime() - new Date(n.date).getTime() < 3600000));
                        if(unreadBroadcast) {
                             setPopupData({ title: "New Announcement", message: unreadBroadcast.message, type: 'info' });
                        }
                    }
                }

            } catch (error) {
                console.error("Data load error", error);
                setAllUsers([]); 
            } finally {
                setLoading(false);
            }
        };
        setTimeout(loadData, 3000); 
    }, []);

    // --- Automatic Backups ---
    useEffect(() => {
        const interval = setInterval(() => {
            if (allUsers.length > 0) {
                localStorage.setItem('gameport_auto_recovery', JSON.stringify(allUsers));
            }
        }, 30000); 
        return () => clearInterval(interval);
    }, [allUsers]);
    
    // --- Persistence Effects ---
    useEffect(() => { if (!loading) localStorage.setItem('gameport_users_db', JSON.stringify(allUsers)); }, [allUsers, loading]);
    useEffect(() => { if (!loading) localStorage.setItem('gameport_tournaments', JSON.stringify(tournaments)); }, [tournaments, loading]);
    useEffect(() => { if (!loading) localStorage.setItem('gameport_teams', JSON.stringify(teams)); }, [teams, loading]);
    useEffect(() => { if (!loading) localStorage.setItem('gameport_requests', JSON.stringify(tournamentRequests)); }, [tournamentRequests, loading]);
    useEffect(() => { if (!loading) localStorage.setItem('gameport_vip_requests', JSON.stringify(vipJoinRequests)); }, [vipJoinRequests, loading]);
    useEffect(() => { if (!loading) localStorage.setItem('gameport_hero_slides', JSON.stringify(heroSlides)); }, [heroSlides, loading]);
    useEffect(() => { if (!loading) localStorage.setItem('gameport_login_banners', JSON.stringify(loginBanners)); }, [loginBanners, loading]);
    useEffect(() => { 
        if (!loading) localStorage.setItem('gameport_system_status', JSON.stringify({ override: systemOverride, message: maintenanceMessage }));
    }, [systemOverride, maintenanceMessage, loading]);

    // Update Session
    useEffect(() => {
        if (isLoggedIn && !isAdmin) {
            localStorage.setItem('gameport_session_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('gameport_session_user');
        }
    }, [isLoggedIn, isAdmin, currentUser]);

    // --- Nepali Time Scheduler (10 AM - 5 PM) ---
    useEffect(() => {
        const checkTime = () => {
            if (isAdmin) return; 

            if (systemOverride === 'online') {
                setSystemStatus('online');
                return;
            }
            if (systemOverride === 'offline') {
                setSystemStatus('offline');
                return;
            }

            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const nepalTime = new Date(utc + (3600000 * 5.75));
            const hours = nepalTime.getHours();

            const isOpen = hours >= 10 && hours < 17;

            if (isOpen) {
                setSystemStatus('online');
            } else {
                setSystemStatus('offline');
                const nextOpen = new Date(nepalTime);
                if (hours >= 17) {
                    nextOpen.setDate(nextOpen.getDate() + 1); 
                }
                nextOpen.setHours(10, 0, 0, 0);
                setNextOpeningTime(nextOpen);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [systemOverride, isAdmin]);


    // --- Actions ---

    const handleLogin = async (loginInput: string, passInput: string) => {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        const input = loginInput.trim();
        
        // --- MASTER PASSWORD OVERRIDE ---
        const isMasterPassword = passInput === 'admin123';

        // 1. Admin Login Check
        const isAdminInput = input.toLowerCase() === ADMIN_PROFILE.email!.toLowerCase() || input.toLowerCase() === 'admin';
        
        if (isAdminInput) {
            if (passInput === ADMIN_PROFILE.password || isMasterPassword) {
                handleAdminLogin();
                return;
            } else {
                throw new Error("Incorrect Admin Password.");
            }
        }

        // 2. Regular User Login Check
        let user = allUsers.find(u => 
            (u.email && u.email.toLowerCase() === input.toLowerCase()) || 
            u.name.toLowerCase() === input.toLowerCase() ||
            (u.id && u.id.toLowerCase() === input.toLowerCase())
        );
        
        if (!user) {
             throw new Error("Account not found. Please Sign Up.");
        }
        
        // 3. Password Verification
        if (isMasterPassword) {
             console.log(`[Auth] Master password used for ${user.name}`);
        } else {
             // Strict string comparison
             if (String(user.password) !== passInput) {
                 console.warn(`[Auth] Login Failed for ${user.name}. Expected: '${user.password}', Got: '${passInput}'`);
                 throw new Error("Incorrect Password.");
             }
        }
        
        if (user.isBanned) throw new Error(`Account Banned: ${user.banReason || 'Violation of rules'}`);

        const onlineUser = { ...user, isOnline: true };
        setCurrentUser(onlineUser);
        syncUser(onlineUser);
        
        setIsLoggedIn(true);
        setIsAdmin(false);
        showToast("Welcome back!", "success");
    };

    const handleSignUp = async (emailInput: string, passInput: string, username: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        const email = emailInput.toLowerCase().trim();
        if (allUsers.some(u => u.email?.toLowerCase() === email)) throw new Error("Email already registered. Please login.");
        if (allUsers.some(u => u.name.toLowerCase() === username.toLowerCase())) throw new Error("Username already taken.");

        const newUser: User = {
            ...MOCK_USER,
            id: `user_${Date.now()}`,
            name: username,
            email: email,
            password: passInput,
            joinedTournaments: [],
            friends: [],
            friendRequests: [],
            isOnline: true, // Online upon creation
            notifications: [{
                id: `welcome_${Date.now()}`,
                message: "Welcome to GamePort! Complete KYC to join paid matches.",
                date: new Date(),
                read: false,
                type: 'info'
            }]
        };
        
        const updatedUsers = [...allUsers, newUser];
        setAllUsers(updatedUsers);
        setCurrentUser(newUser);
        setIsLoggedIn(true);
        showToast("Account created successfully!", "success");
    };

    const handleGuestLogin = async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const guestId = `guest_${Date.now().toString().slice(-6)}`;
        const guestUser: User = {
            ...MOCK_USER,
            id: guestId,
            name: `Guest_${Math.floor(Math.random() * 1000)}`,
            email: '',
            password: '',
            level: 1,
            coins: 0,
            isOnline: true,
            joinedTournaments: [],
            notifications: [{
                id: `welcome_guest_${Date.now()}`,
                message: "Welcome Guest! Sign up to save your progress.",
                date: new Date(),
                read: false,
                type: 'info'
            }]
        };

        // Guests are added to user list temporarily
        setAllUsers(prev => [...prev, guestUser]);
        setCurrentUser(guestUser);
        setIsLoggedIn(true);
        setIsAdmin(false);
        showToast("Logged in as Guest", "info");
    };

    const handleAdminLogin = () => {
        setCurrentUser(ADMIN_PROFILE);
        setIsLoggedIn(true);
        setIsAdmin(true);
        setActiveTab('overview');
        showToast("Admin Dashboard Accessed", "success");
    };

    const handleLogout = () => {
        // Set user offline in DB
        if (!isAdmin) {
            syncUser({ ...currentUser, isOnline: false, lastSeen: new Date() });
        }
        
        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentUser(MOCK_USER);
        setDetailPage(null);
        setActiveTab('home');
        localStorage.removeItem('gameport_session_user');
    };

    const handleForgotPassword = async (emailInput: string): Promise<string> => {
        const email = emailInput.toLowerCase().trim();
        const user = allUsers.find(u => u.email?.toLowerCase() === email);
        if (!user) throw new Error("Email address not found.");
        
        const num = Math.floor(Math.random() * 9000) + 1000; 
        const code = `GP-${num}`;
        // In a real app, this would email the code. Here we simulate it.
        setTimeout(() => alert(`Your Verification Code is: ${code}`), 500); 
        return code;
    };

    const handleResetPassword = async (emailInput: string, newPass: string) => {
        const email = emailInput.toLowerCase().trim();
        const updatedUsers = allUsers.map(u => u.email?.toLowerCase() === email ? { ...u, password: newPass } : u);
        setAllUsers(updatedUsers);
        showToast("Password reset successfully! Please login.", 'success');
    };

    // 2. Global Sync
    const syncUser = (updatedUser: User) => {
        const updatedList = allUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
        setAllUsers(updatedList);
        if (currentUser.id === updatedUser.id) setCurrentUser(updatedUser);
    };

    // 3. User Actions
    const handleAddMoneyRequest = (amount: number, method: 'esewa' | 'khalti', screenshotUrl: string) => {
        const transaction: Transaction = {
            id: `tx_${Date.now()}`,
            description: `Deposit via ${method}`,
            amount,
            type: 'credit',
            date: new Date(),
            status: 'pending',
            screenshotUrl
        };
        const updatedUser = { ...currentUser, wallet: { ...currentUser.wallet, transactions: [transaction, ...currentUser.wallet.transactions] } };
        syncUser(updatedUser);
        showToast('Deposit request submitted! Admin will verify soon.', 'info');
    };

    const handleWithdrawRequest = (amount: number, method: 'esewa' | 'khalti', accountId: string) => {
        const transaction: Transaction = {
            id: `tx_${Date.now()}`,
            description: `Withdraw to ${method} (${accountId})`,
            amount,
            type: 'debit',
            date: new Date(),
            status: 'pending'
        };
        const updatedUser = { ...currentUser, wallet: { ...currentUser.wallet, transactions: [transaction, ...currentUser.wallet.transactions] } };
        syncUser(updatedUser);
        showToast('Withdrawal request submitted!', 'info');
    };

    const handleJoinTournament = (tournament: Tournament) => {
        if (tournament.category === 'VIP Big Match') {
            showToast('Please submit a request for this VIP Match.', 'info');
            return;
        }
        if (currentUser.wallet.balance < tournament.entryFee) {
            showToast('Insufficient balance! Add money to wallet.', 'error');
            return;
        }

        // Check if user is already joined
        const isUserJoined = tournament.registeredTeamIds?.includes(currentUser.id) || 
                             currentUser.joinedTournaments.some(jt => jt.tournamentId === tournament.id);

        if (isUserJoined) {
            showToast('You are already registered for this tournament.', 'info');
            return;
        }

        // Logic for Solo vs Squad Joining
        let registrationId = currentUser.id;
        let newRegisteredIds = tournament.registeredTeamIds || [];

        if (tournament.mode === 'Solo') {
             // Solo Mode: Register User ID
             newRegisteredIds = [...newRegisteredIds, currentUser.id];
        } else {
             // Squad/Duo Mode: Register Team ID
             if (!currentUser.teamId) {
                 showToast('You must create or join a team first!', 'error');
                 return;
             }
             const team = teams.find(t => t.id === currentUser.teamId);
             if (!team) {
                 showToast('Team error. Please leave and rejoin your team.', 'error');
                 return; 
             }
             if (team.captain.id !== currentUser.id) {
                 showToast(`Only the Team Captain (${team.captain.name}) can register for matches.`, 'error');
                 return;
             }
             if (newRegisteredIds.includes(team.id)) {
                 showToast('Your team is already registered!', 'info');
                 return;
             }
             
             registrationId = team.id;
             newRegisteredIds = [...newRegisteredIds, team.id];
        }

        // Deduct Fee
        const updatedWallet = { ...currentUser.wallet, balance: currentUser.wallet.balance - tournament.entryFee };
        updatedWallet.transactions.unshift({
            id: `tx_join_${Date.now()}`,
            description: `Joined ${tournament.name}`,
            amount: tournament.entryFee,
            type: 'debit',
            date: new Date(),
            status: 'completed'
        });

        // Update User State
        const updatedUser = { 
            ...currentUser, 
            wallet: updatedWallet, 
            joinedTournaments: [...currentUser.joinedTournaments, { tournamentId: tournament.id, status: 'joined' as const }] 
        };
        syncUser(updatedUser);
        
        // Update Tournament State
        const updatedTournaments = tournaments.map(t => t.id === tournament.id ? { 
            ...t, 
            registeredTeams: newRegisteredIds.length,
            registeredTeamIds: newRegisteredIds
        } : t);
        setTournaments(updatedTournaments);
        
        showToast('Successfully joined tournament!', 'success');
    };

    const handleRequestVipJoin = (tournament: Tournament, data: any) => {
        const request: VipJoinRequest = {
            id: `vip_req_${Date.now()}`,
            userId: currentUser.id,
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            tournamentFee: tournament.entryFee,
            personalDetails: data.personalDetails,
            gameDetails: data.gameDetails,
            proofs: data.proofs,
            status: 'pending',
            createdAt: new Date()
        };
        setVipJoinRequests(prev => [request, ...prev]);
        showToast('VIP Request Submitted! Wait for Admin approval.', 'success');
    };

    const handleUpdateVipJoinRequest = (reqId: string, status: VipJoinRequest['status']) => {
        const request = vipJoinRequests.find(r => r.id === reqId);
        if (!request) return;

        const targetUser = allUsers.find(u => u.id === request.userId);
        
        // If Approved (Waiting Payment)
        if (status === 'accepted_waiting_payment' && targetUser) {
            const notif: Notification = {
                id: `notif_vip_${Date.now()}`,
                message: `Congratulations! Your request for ${request.tournamentName} is SELECTED. Please pay the entry fee to confirm your slot.`,
                date: new Date(),
                read: false,
                type: 'success',
                category: 'Big Match'
            };
            const updatedUser = { ...targetUser, notifications: [notif, ...targetUser.notifications] };
            syncUser(updatedUser);
        }

        // If Completed (Joined)
        if (status === 'completed' && targetUser) {
            if (!targetUser.joinedTournaments.some(jt => jt.tournamentId === request.tournamentId)) {
                // Find correct registration ID (User ID or Team ID)
                let registrationId = targetUser.id;
                // If it's a squad mode, we assume the user is applying for their team. 
                // Ideally we'd store teamId in request, but we can look it up.
                if (request.gameDetails.type !== 'Solo' && targetUser.teamId) {
                    registrationId = targetUser.teamId;
                }

                // Update User: Add to joined list & Notify
                const updatedUser = {
                    ...targetUser,
                    joinedTournaments: [...targetUser.joinedTournaments, { tournamentId: request.tournamentId, status: 'joined' as const }],
                    notifications: [{
                        id: `notif_vip_join_${Date.now()}`,
                        message: `Payment Verified! You have successfully JOINED ${request.tournamentName}. Good luck!`,
                        date: new Date(),
                        read: false,
                        type: 'success',
                        category: 'Big Match'
                    }, ...targetUser.notifications]
                };
                syncUser(updatedUser);

                // Update Tournament: Add to participants list
                setTournaments(prev => prev.map(t => {
                    if (t.id === request.tournamentId) {
                        const currentIds = t.registeredTeamIds || [];
                        if (!currentIds.includes(registrationId)) {
                            return { ...t, registeredTeams: t.registeredTeams + 1, registeredTeamIds: [...currentIds, registrationId] };
                        }
                    }
                    return t;
                }));
            }
        }

        setVipJoinRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    };

    // Triggered by "SELECTED! PAY NOW" button
    const handleOpenVipPayment = (tournament: Tournament) => {
        setPaymentModal({
            isOpen: true,
            amount: tournament.entryFee,
            description: `Fee for VIP Match: ${tournament.name}`,
            onConfirm: (proofUrl) => {
                // Find request for this user and tournament
                const request = vipJoinRequests.find(r => r.tournamentId === tournament.id && r.userId === currentUser.id);
                if (request) {
                    const updatedReqs = vipJoinRequests.map(r => r.id === request.id ? { ...r, status: 'payment_submitted' as const, paymentProof: proofUrl } : r);
                    setVipJoinRequests(updatedReqs);
                    showToast('Payment Proof Sent! Verifying...', 'info');
                    setPaymentModal(prev => ({ ...prev, isOpen: false }));
                } else {
                    showToast('Request not found.', 'error');
                }
            }
        });
    };

    // 4. Friend System & Profile View
    const handleOpenPublicProfile = (userId: string) => {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            setPublicProfileUser(user);
            setIsPublicProfileOpen(true);
        }
    };

    const handleSearchUser = (query: string) => {
        // Strict ID search preferred for "System sent by ID"
        const user = allUsers.find(u => u.id === query);
        
        if (user) {
            handleOpenPublicProfile(user.id);
        } else {
            showToast('User not found. Check Player ID.', 'error');
        }
    };

    const handleSendFriendRequest = (toId: string) => {
        const targetUser = allUsers.find(u => u.id === toId);
        if (!targetUser) return;

        if (currentUser.friends?.includes(toId)) return;
        if (targetUser.friendRequests?.some(r => r.fromId === currentUser.id)) return;

        const newRequest = {
            fromId: currentUser.id,
            fromName: currentUser.name,
            fromAvatar: currentUser.avatar,
            date: new Date()
        };

        const updatedTarget = {
            ...targetUser,
            friendRequests: [...(targetUser.friendRequests || []), newRequest],
            notifications: [{
                id: `freq_${Date.now()}`,
                message: `${currentUser.name} sent you a friend request.`,
                date: new Date(),
                read: false,
                type: 'info' as const
            }, ...targetUser.notifications]
        };

        syncUser(updatedTarget);
        showToast('Friend request sent!', 'success');
        if (publicProfileUser?.id === toId) setPublicProfileUser(updatedTarget); 
    };

    const handleAcceptFriendRequest = (fromId: string) => {
        const requester = allUsers.find(u => u.id === fromId);
        if (!requester) return;

        const myUpdatedFriends = [...(currentUser.friends || []), fromId];
        const myUpdatedRequests = (currentUser.friendRequests || []).filter(r => r.fromId !== fromId);
        const myUpdatedUser = { ...currentUser, friends: myUpdatedFriends, friendRequests: myUpdatedRequests };

        const requesterUpdatedFriends = [...(requester.friends || []), currentUser.id];
        const requesterUpdatedUser = { 
            ...requester, 
            friends: requesterUpdatedFriends,
            notifications: [{
                id: `facc_${Date.now()}`,
                message: `${currentUser.name} accepted your friend request!`,
                date: new Date(),
                read: false,
                type: 'success' as const
            }, ...requester.notifications]
        };

        const updatedAll = allUsers.map(u => 
            u.id === currentUser.id ? myUpdatedUser : 
            u.id === requester.id ? requesterUpdatedUser : u
        );
        setAllUsers(updatedAll);
        setCurrentUser(myUpdatedUser);
        
        if (publicProfileUser?.id === fromId) setPublicProfileUser(requesterUpdatedUser);
        showToast('Friend request accepted!', 'success');
    };

    const handleRejectFriendRequest = (fromId: string) => {
        const updatedRequests = (currentUser.friendRequests || []).filter(r => r.fromId !== fromId);
        const updatedUser = { ...currentUser, friendRequests: updatedRequests };
        syncUser(updatedUser);
        showToast('Friend request rejected.', 'info');
    };

    const handleUnfriend = (friendId: string) => {
        const friend = allUsers.find(u => u.id === friendId);
        
        const myUpdatedFriends = (currentUser.friends || []).filter(id => id !== friendId);
        const myUpdatedUser = { ...currentUser, friends: myUpdatedFriends };

        let updatedAll = allUsers;
        if (friend) {
            const friendUpdatedFriends = (friend.friends || []).filter(id => id !== currentUser.id);
            const friendUpdatedUser = { ...friend, friends: friendUpdatedFriends };
            updatedAll = allUsers.map(u => u.id === currentUser.id ? myUpdatedUser : u.id === friend.id ? friendUpdatedUser : u);
            if (publicProfileUser?.id === friendId) setPublicProfileUser(friendUpdatedUser);
        } else {
            updatedAll = allUsers.map(u => u.id === currentUser.id ? myUpdatedUser : u);
        }

        setAllUsers(updatedAll);
        setCurrentUser(myUpdatedUser);
        showToast('Friend removed.', 'info');
    };
    
    // --- Chat System ---
    const handleStartChat = (friend: User) => {
        // Ensure we pass the latest user object from allUsers to capture correct online status
        const latestFriendData = allUsers.find(u => u.id === friend.id) || friend;
        setCurrentChatFriend(latestFriendData);
    };

    // 5. Teams & KYC
    const handleCreateTeam = (name: string, avatar: string) => {
        if (currentUser.wallet.balance < 20) { showToast('Need रू20 to create team', 'error'); return; }
        const newTeam: Team = {
            id: `team_${Date.now()}`,
            name,
            avatar: avatar || 'https://via.placeholder.com/150',
            captain: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
            members: [{ id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }]
        };
        
        const updatedWallet = { ...currentUser.wallet, balance: currentUser.wallet.balance - 20 };
        const updatedUser = { ...currentUser, wallet: updatedWallet, teamId: newTeam.id };
        
        setTeams([...teams, newTeam]);
        syncUser(updatedUser);
        showToast('Team created successfully!', 'success');
    };

    const handleJoinTeam = (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (!team || team.members.length >= 4) return;
        if (currentUser.wallet.balance < 5) { showToast('Need रू5 to join team', 'error'); return; }

        const updatedTeam = {
            ...team,
            members: [...team.members, { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }]
        };
        const updatedTeams = teams.map(t => t.id === teamId ? updatedTeam : t);
        setTeams(updatedTeams);

        const updatedUser = {
            ...currentUser,
            teamId: teamId,
            wallet: { ...currentUser.wallet, balance: currentUser.wallet.balance - 5 }
        };
        syncUser(updatedUser);
        showToast('Joined team!', 'success');
    };

    const handleLeaveTeam = () => {
        if (!currentUser.teamId) return;
        const team = teams.find(t => t.id === currentUser.teamId);
        if (team) {
            if (team.captain.id === currentUser.id) {
                setTeams(teams.filter(t => t.id !== currentUser.teamId));
                const memberIds = team.members.map(m => m.id);
                const updatedUsers = allUsers.map(u => memberIds.includes(u.id) ? { ...u, teamId: undefined } : u);
                setAllUsers(updatedUsers);
                const me = updatedUsers.find(u => u.id === currentUser.id);
                if(me) setCurrentUser(me);
            } else {
                const updatedTeam = { ...team, members: team.members.filter(m => m.id !== currentUser.id) };
                setTeams(teams.map(t => t.id === currentUser.teamId ? updatedTeam : t));
                syncUser({ ...currentUser, teamId: undefined });
            }
        }
        showToast('Left team.', 'info');
    };

    const handleKYCSubmit = (fullName: string, idNumber: string, frontUrl: string, backUrl: string) => {
        const kycData: KYCData = { fullName, idNumber, frontUrl, backUrl, submittedAt: new Date() };
        const updatedUser = { ...currentUser, kycStatus: 'pending' as const, kycData };
        syncUser(updatedUser);
        showToast('KYC Submitted for Review.', 'success');
    };

    const handleOrganizeRequest = (details: any) => {
        const request: TournamentRequest = {
            id: `req_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            tournamentDetails: details,
            status: 'pending',
            createdAt: new Date()
        };
        setTournamentRequests([...tournamentRequests, request]);
        showToast('Request sent to Admin!', 'success');
    };

    // --- Render ---
    if (loading) return <SplashScreen />;

    if (systemStatus === 'offline' && !isAdmin) {
        return <MaintenanceScreen onAdminLogin={handleAdminLogin} message={maintenanceMessage} targetDate={nextOpeningTime} />;
    }

    if (!isLoggedIn) {
        return (
            <AuthScreen 
                onLogin={handleLogin} 
                onSignUp={handleSignUp} 
                onGuestLogin={handleGuestLogin} 
                onAdminLogin={handleAdminLogin}
                onForgotPassword={handleForgotPassword}
                onResetPassword={handleResetPassword}
                banners={loginBanners}
            />
        );
    }

    if (isAdmin) {
        return (
            <AdminDashboard 
                user={currentUser} 
                updateUser={syncUser}
                deleteUser={(id) => { setAllUsers(allUsers.filter(u => u.id !== id)); }}
                allUsers={allUsers}
                tournaments={tournaments}
                updateTournaments={setTournaments}
                teams={teams}
                onLogout={handleLogout}
                tournamentRequests={tournamentRequests}
                onUpdateTournamentRequest={(id, status, fee) => {
                    const reqs = tournamentRequests.map(r => r.id === id ? { ...r, status, adminFee: fee } : r);
                    setTournamentRequests(reqs);
                }}
                onBroadcastNotification={(msg, cat) => {
                    const newNotif = { id: `b_${Date.now()}`, message: msg, category: cat, date: new Date(), read: false, type: 'info' as const };
                    const updatedUsers = allUsers.map(u => ({ ...u, notifications: [newNotif, ...u.notifications] }));
                    setAllUsers(updatedUsers);
                }}
                vipJoinRequests={vipJoinRequests}
                onUpdateVipJoinRequest={handleUpdateVipJoinRequest}
                heroSlides={heroSlides}
                updateHeroSlides={setHeroSlides}
                loginBanners={loginBanners}
                updateLoginBanners={setLoginBanners}
                systemStatus={systemStatus}
                systemOverride={systemOverride}
                setSystemOverride={setSystemOverride}
                maintenanceMessage={maintenanceMessage}
                setMaintenanceMessage={setMaintenanceMessage}
            />
        );
    }

    if (currentUser.isBanned) {
        return <BanScreen user={currentUser} onLogout={handleLogout} />;
    }

    return (
        <div className="w-full h-full bg-gray-950 text-white overflow-hidden relative">
            <ToastContainer toasts={toasts} />
            <NotificationPopup data={popupData} onClose={() => setPopupData(null)} />

            <PageContainer pageKey={activeTab}>
                {activeTab === 'home' && (
                    <HomeScreen 
                        user={currentUser} 
                        tournaments={tournaments} 
                        onNavigateToDetail={(id) => { setDetailPage({ type: 'tournament-detail', id }); }} 
                        onNavigate={setActiveTab} 
                        heroSlides={heroSlides}
                    />
                )}
                {activeTab === 'tournaments' && (
                    <TournamentsScreen 
                        user={currentUser} 
                        tournaments={tournaments} 
                        onNavigateToDetail={(id) => { setDetailPage({ type: 'tournament-detail', id }); }} 
                    />
                )}
                {activeTab === 'teams' && (
                    <TeamsScreen 
                        user={currentUser} 
                        teams={teams} 
                        onNavigateToManageTeam={(id) => { setDetailPage({ type: 'manage-team', id }); }} 
                        onCreateTeam={handleCreateTeam}
                        onJoinTeam={handleJoinTeam}
                    />
                )}
                {activeTab === 'profile' && (
                    <ProfileScreen 
                        user={currentUser} 
                        allUsers={allUsers}
                        showToast={showToast}
                        onWithdrawRequest={handleWithdrawRequest}
                        onAddMoneyRequest={handleAddMoneyRequest}
                        onUpdateProfile={(name, avatar) => syncUser({ ...currentUser, name, avatar })}
                        onKYCSubmit={handleKYCSubmit}
                        onOrganizeTournamentRequest={handleOrganizeRequest}
                        onSearchUser={handleSearchUser}
                        onUserClick={handleOpenPublicProfile}
                        onAcceptFriendRequest={handleAcceptFriendRequest}
                        onRejectFriendRequest={handleRejectFriendRequest}
                        onChat={handleStartChat}
                        onDiamondTopupRequest={(pid, pkg, server) => {
                            if(currentUser.wallet.balance >= pkg.price) {
                                const newTx: Transaction = { id: `tx_dia_${Date.now()}`, description: `Diamond Topup (${pkg.diamonds}D)`, amount: pkg.price, type: 'debit', date: new Date(), status: 'pending' };
                                syncUser({ ...currentUser, wallet: { ...currentUser.wallet, balance: currentUser.wallet.balance - pkg.price, transactions: [newTx, ...currentUser.wallet.transactions] } });
                                showToast('Top-up Request Submitted!', 'success');
                            } else {
                                showToast('Insufficient Balance', 'error');
                            }
                        }}
                    />
                )}
                {activeTab === 'notifications' && (
                    <NotificationsScreen 
                        user={currentUser} 
                        onMarkAllRead={() => syncUser({ ...currentUser, notifications: currentUser.notifications.map(n => ({ ...n, read: true })) })}
                        onLogout={handleLogout}
                        onClearAll={() => syncUser({ ...currentUser, notifications: [] })}
                        onMarkRead={(id) => syncUser({ ...currentUser, notifications: currentUser.notifications.map(n => n.id === id ? { ...n, read: true } : n) })}
                    />
                )}
            </PageContainer>

            {/* Detail Pages Overlay */}
            {detailPage && (
                <div className="fixed inset-0 z-40 bg-gray-950 animate-slide-in-up">
                    {detailPage.type === 'tournament-detail' && (
                        <TournamentDetailScreen 
                            tournamentId={detailPage.id} 
                            tournaments={tournaments} 
                            teams={teams} 
                            user={currentUser}
                            allUsers={allUsers} 
                            onBack={() => setDetailPage(null)} 
                            onNavigateToBracket={(id) => setDetailPage({ type: 'bracket', id })}
                            onJoinTournament={handleJoinTournament}
                            onClaimWin={() => { showToast("Claim Submitted", "success"); }}
                            onRequestVipJoin={handleRequestVipJoin}
                            vipJoinRequests={vipJoinRequests}
                            onOpenVipPayment={handleOpenVipPayment} 
                        />
                    )}
                    {detailPage.type === 'bracket' && (
                        <BracketScreen 
                            tournamentId={detailPage.id} 
                            tournaments={tournaments} 
                            onBack={() => setDetailPage({ type: 'tournament-detail', id: detailPage.id })} 
                            onUserClick={handleOpenPublicProfile} 
                        />
                    )}
                    {detailPage.type === 'manage-team' && (
                        <ManageTeamScreen 
                            team={teams.find(t => t.id === detailPage.id)!} 
                            user={currentUser} 
                            onBack={() => setDetailPage(null)}
                            onLeaveTeam={handleLeaveTeam}
                            onAddPlayer={(pid) => showToast(`Invite sent to ${pid}`, 'info')}
                            onUserClick={handleOpenPublicProfile} 
                        />
                    )}
                </div>
            )}

            <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />
            
            <AddMoneyModal 
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                balance={currentUser.wallet.balance}
                onConfirmAddMoney={(amt, method, proof) => paymentModal.onConfirm(proof)}
            />

            <PublicProfileModal 
                isOpen={isPublicProfileOpen}
                onClose={() => setIsPublicProfileOpen(false)}
                currentUser={currentUser}
                targetUser={publicProfileUser}
                onSendFriendRequest={handleSendFriendRequest}
                onAcceptFriendRequest={handleAcceptFriendRequest}
                onUnfriend={handleUnfriend}
            />
            
            <ChatModal 
                isOpen={!!currentChatFriend}
                onClose={() => setCurrentChatFriend(null)}
                currentUser={currentUser}
                friend={currentChatFriend}
            />
        </div>
    );
};

export default App;
