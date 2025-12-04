
// A robust mock of Firebase Realtime Database using LocalStorage
// This allows the app to function "real-time" across tabs/components without external config issues.

import type { ChatMessage } from "../types";

const STORAGE_KEY_PREFIX = 'firebase_db_';

export const database = {}; // Mock database instance

// Mock Reference
export const ref = (db: any, path: string) => {
    return { path };
};

// Mock Set
export const set = (reference: { path: string }, value: any): Promise<void> => {
    return new Promise((resolve) => {
        const fullKey = STORAGE_KEY_PREFIX + reference.path;
        localStorage.setItem(fullKey, JSON.stringify(value));
        
        // Dispatch event for local updates
        window.dispatchEvent(new CustomEvent('firebase-value', { 
            detail: { path: reference.path, val: () => value } 
        }));
        
        resolve();
    });
};

// Mock onValue
export const onValue = (reference: { path: string }, callback: (snapshot: { val: () => any }) => void) => {
    const fullKey = STORAGE_KEY_PREFIX + reference.path;
    
    // Initial read
    const initialData = localStorage.getItem(fullKey);
    if (initialData) {
        callback({ val: () => JSON.parse(initialData) });
    } else {
        callback({ val: () => null });
    }

    // Listener
    const handler = (e: any) => {
        // Check if it's our custom event
        if (e.type === 'firebase-value' && e.detail.path === reference.path) {
            callback({ val: e.detail.val });
        }
    };

    window.addEventListener('firebase-value', handler);

    // Return unsubscribe function
    return () => window.removeEventListener('firebase-value', handler);
};

// Chat Helpers

// Generates a consistent Chat ID for two users regardless of who initiates
export const getChatId = (user1Id: string, user2Id: string) => {
    return [user1Id, user2Id].sort().join('_');
};

export const sendChatMessage = async (chatId: string, senderId: string, text: string) => {
    const path = `chats/${chatId}`;
    const key = STORAGE_KEY_PREFIX + path;
    
    const existingDataStr = localStorage.getItem(key);
    let messages: ChatMessage[] = existingDataStr ? JSON.parse(existingDataStr) : [];
    
    const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId,
        text,
        timestamp: Date.now()
    };
    
    messages.push(newMessage);
    
    // Save
    await set(ref(database, path), messages);
};

// Initialize default data if empty (for demo purposes)
export const initDefaultTournamentData = (tournamentId: string) => {
    const path = `tournaments/${tournamentId}`;
    const key = STORAGE_KEY_PREFIX + path;
    if (!localStorage.getItem(key)) {
        const defaultData = {
            matches: {
                qf1: { id: 'qf1', nextMatchId: 'semi1', player1: 'TBD', player2: 'TBD', score1: 0, score2: 0 },
                qf2: { id: 'qf2', nextMatchId: 'semi1', player1: 'TBD', player2: 'TBD', score1: 0, score2: 0 },
                qf3: { id: 'qf3', nextMatchId: 'semi2', player1: 'TBD', player2: 'TBD', score1: 0, score2: 0 },
                qf4: { id: 'qf4', nextMatchId: 'semi2', player1: 'TBD', player2: 'TBD', score1: 0, score2: 0 },
                semi1: { id: 'semi1', nextMatchId: 'final', player1: 'TBD', player2: 'TBD', score1: 0, score2: 0 },
                semi2: { id: 'semi2', nextMatchId: 'final', player1: 'TBD', player2: 'TBD', score1: 0, score2: 0 },
                final: { id: 'final', nextMatchId: null, player1: 'TBD', player2: 'TBD', score1: 0, score2: 0 }
            },
            leaderboard: []
        };
        localStorage.setItem(key, JSON.stringify(defaultData));
    }
}
