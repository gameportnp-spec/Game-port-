
// FIX: Removed incorrect circular import of TournamentMode.
// import type { TournamentMode } from './types';

// FIX: Added the missing TournamentMode type definition.
export type TournamentMode = 'Solo' | 'Duo' | 'Squad';
export type Server = 'BD' | 'IN';
export type TournamentCategory = 'Normal Match' | 'VIP Match' | 'VIP Big Match';

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    date: Date;
    status: 'pending' | 'completed' | 'rejected';
    garenaTransactionId?: string;
    screenshotUrl?: string;
}

export interface Wallet {
    balance: number;
    transactions: Transaction[];
}

export type NotificationCategory = 'Big Match' | 'Normal Match' | 'System';

export interface Notification {
    id: string;
    message: string;
    date: Date;
    read: boolean;
    type: 'success' | 'warning' | 'error' | 'info';
    category?: NotificationCategory;
}

export interface TeamMember {
    id:string;
    name: string;
    avatar: string;
    }

export interface Team {
    id: string;
    name: string;
    avatar: string;
    captain: TeamMember;
    members: TeamMember[];
}

export interface JoinedTournament {
    tournamentId: string;
    status: 'joined' | 'pending_claim' | 'claimed' | 'rejected_claim';
    claimSubmitted?: {
        screenshotUrl: string;
        submittedAt: Date;
    };
}

export interface KYCData {
    fullName: string;
    idNumber: string;
    frontUrl: string;
    backUrl: string;
    submittedAt: Date;
}

export interface FriendRequest {
    fromId: string;
    fromName: string;
    fromAvatar: string;
    date: Date;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
}

export interface User {
    id:string;
    name: string;
    avatar: string;
    level: number;
    coins: number;
    joinedTournaments: JoinedTournament[];
    notifications: Notification[];
    wallet: Wallet;
    teamId?: string;
    kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
    kycData?: KYCData;
    isBanned?: boolean;
    banReason?: string;
    email?: string;
    password?: string;
    // Friend System
    friends?: string[]; // Array of User IDs
    friendRequests?: FriendRequest[];
    // Online Status System
    isOnline?: boolean;
    lastSeen?: Date;
}

export interface Tournament {
    id: string;
    name: string;
    bannerUrl: string;
    prizePool: number;
    entryFee: number;
    registeredTeams: number;
    maxTeams: number;
    startDate: Date;
    createdAt?: Date;
    status: 'Live' | 'Upcoming' | 'Finished';
    mode: TournamentMode;
    roomId?: string;
    roomPassword?: string;
    winnerTeamId?: string;
    registeredTeamIds?: string[];
    isVip?: boolean; 
    category?: TournamentCategory;
    bracketUrl?: string; // Legacy/Fallback
    leaderboardUrl?: string; // Legacy/Fallback
}

export interface TournamentRequest {
    id: string;
    userId: string;
    userName: string;
    tournamentDetails: {
        gameName: string;
        name: string;
        contact: string;
        description: string;
        prizePool?: number;
        entryFee?: number;
        startDate?: Date;
    };
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    adminFee?: number;
    paymentProof?: string;
    createdAt: Date;
}

export interface VipJoinRequest {
    id: string;
    userId: string;
    tournamentId: string;
    tournamentName: string;
    tournamentFee: number;
    personalDetails: {
        fullName: string;
        phone: string;
        city: string;
    };
    gameDetails: {
        gameId: string;
        type: TournamentMode;
        teamMemberIds?: string[]; // For Duo/Squad partners
    };
    proofs: {
        selfieUrl: string;
        profileScreenshotUrl: string;
    };
    status: 'pending' | 'accepted_waiting_payment' | 'payment_submitted' | 'completed' | 'rejected';
    paymentProof?: string;
    createdAt: Date;
}

export interface HeroSlide {
    id: string;
    imageUrl: string;
    title: string;
    dateLabel: string;
    tournamentId?: string; 
}

export interface LoginBanner {
    id: string;
    imageUrl: string;
}

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

// --- Bracket & Leaderboard Types ---

export interface BracketMatch {
    id: string; // e.g., 'm1', 'm2', 'semi1', 'final'
    nextMatchId?: string;
    player1: string; // Name
    player2: string; // Name
    score1: number;
    score2: number;
    winner?: 'player1' | 'player2';
}

export interface LeaderboardEntry {
    id: string;
    rank: number;
    username: string;
    avatar: string;
    score: number;
    coins: number;
}

export interface TournamentData {
    matches: Record<string, BracketMatch>;
    leaderboard: LeaderboardEntry[];
}
