
import React, { useState, useEffect, useRef } from 'react';
import type { User, ChatMessage } from '../types';
import { database, ref, onValue, sendChatMessage, getChatId } from '../services/mockFirebase';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    friend: User | null;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, currentUser, friend }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessageText, setNewMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatId = friend ? getChatId(currentUser.id, friend.id) : null;

    useEffect(() => {
        if (!isOpen || !chatId) return;

        // Listen for messages
        const chatRef = ref(database, `chats/${chatId}`);
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setMessages(data);
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [isOpen, chatId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessageText.trim() || !chatId) return;

        const text = newMessageText.trim();
        setNewMessageText(''); // Clear input immediately
        
        await sendChatMessage(chatId, currentUser.id, text);
    };

    if (!isOpen || !friend) return null;

    // Helper to format "Last Seen"
    const getLastSeenText = () => {
        if (friend.isOnline) return 'Online';
        if (!friend.lastSeen) return 'Offline';
        
        const now = new Date();
        const diff = now.getTime() - new Date(friend.lastSeen).getTime();
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Last seen just now';
        if (minutes < 60) return `Last seen ${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Last seen ${hours}h ago`;
        return 'Offline';
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150] flex justify-center items-end md:items-center animate-fade-in">
            <div className="bg-gray-900 w-full md:max-w-md h-[95vh] md:h-[80vh] md:rounded-2xl shadow-2xl flex flex-col border border-gray-700 animate-slide-in-up">
                
                {/* Header */}
                <div className="bg-gray-800 p-4 rounded-t-2xl flex items-center justify-between border-b border-gray-700 shadow-md z-10">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img src={friend.avatar} alt={friend.name} className={`w-10 h-10 rounded-full border-2 object-cover ${friend.isOnline ? 'border-green-500' : 'border-gray-500'}`} />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        </div>
                        <div>
                            <h2 className="text-white font-bold font-orbitron text-lg">{friend.name}</h2>
                            <div className="flex items-center">
                                {friend.isOnline ? (
                                    <p className="text-xs text-green-400 flex items-center font-bold">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></span>
                                        Active Now
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 font-medium">
                                        {getLastSeenText()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-700 rounded-full text-white hover:bg-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-sm">Start the conversation with {friend.name}</p>
                        </div>
                    )}
                    
                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm relative shadow-md ${
                                        isMe 
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-br-none' 
                                        : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                    }`}
                                >
                                    <p className="break-words leading-relaxed">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-orange-200' : 'text-gray-500'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-gray-800 border-t border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input 
                            type="text" 
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-900 text-white rounded-full px-4 py-3 border border-gray-600 focus:border-orange-500 focus:outline-none placeholder-gray-500"
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessageText.trim()}
                            className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition-transform active:scale-95 shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
