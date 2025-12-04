
import type { User, Tournament, Notification, Transaction, Team } from './types';

// Start with empty data to force "Real" data creation via Admin/User interaction
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [];

// Base Template for new users
export const MOCK_USER: User = {
    id: 'user_template',
    name: 'New Player',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    level: 1,
    coins: 0, 
    joinedTournaments: [],
    notifications: [],
    wallet: {
        balance: 0,
        transactions: []
    },
    kycStatus: 'unverified',
};

// Start empty - Admin must create everything
export const MOCK_TOURNAMENTS: Tournament[] = [];
export const MOCK_TEAMS: Team[] = [];
