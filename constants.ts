
import type { User, Tournament, Notification, Transaction, Team } from './types';

// Initial empty states for the real system
export const INITIAL_NOTIFICATIONS: Notification[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Base Template for new users
export const INITIAL_USER_STATE: User = {
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
export const INITIAL_TOURNAMENTS: Tournament[] = [];
export const INITIAL_TEAMS: Team[] = [];
