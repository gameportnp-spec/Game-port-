
import React, { useState, useEffect } from 'react';
import PinEntryModal from './PinEntryModal';
import type { LoginBanner } from '../types';

const defaultSliderImages = [
    'https://i.ibb.co/N6f3nKdG/freefire-india-diwali-bundle-pics-v0-jfzuyyo8tduf1.png',
    'https://i.ibb.co/SDd1J9p1/freefire-india-diwali-bundle-pics-v0-5rtiaqx8tduf1.png',
    'https://i.ibb.co/dJ48kRn0/freefire-india-diwali-bundle-pics-v0-lpxqjz29tduf1.png',
];

interface AuthScreenProps {
    onLogin: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string, username: string) => Promise<void>;
    onGuestLogin: () => Promise<void>;
    onAdminLogin: () => void;
    onForgotPassword: (email: string) => Promise<string>;
    onResetPassword: (email: string, newPass: string) => Promise<void>;
    banners?: LoginBanner[];
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignUp, onGuestLogin, onAdminLogin, onForgotPassword, onResetPassword, banners = [] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Password Visibility Toggle
    const [showPassword, setShowPassword] = useState(false);
    
    // Forgot Password Flow State
    const [resetStep, setResetStep] = useState<0 | 1 | 2>(0); // 0: Request, 1: Verify, 2: Reset
    const [generatedCode, setGeneratedCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Admin Pin State
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const overallLoading = formLoading || guestLoading;
    const activeImages = banners.length > 0 ? banners.map(b => b.imageUrl) : defaultSliderImages;

    useEffect(() => {
        if (activeImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeImages.length]);

    // Reset error when switching modes
    useEffect(() => {
        setError(null);
        setEmail('');
        setPassword('');
        setUsername('');
    }, [authMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (overallLoading) return;
        setFormLoading(true);
        setError(null);

        try {
            if (authMode === 'signup') {
                if (password.length < 6) throw new Error("Password must be at least 6 characters.");
                if (username.trim().length < 3) throw new Error("Username must be at least 3 characters.");
                // Email is passed as first arg in signup
                await onSignUp(email, password.trim(), username);
            } else if (authMode === 'login') {
                // Email field is used for Email or Username in Login Mode
                await onLogin(email, password.trim());
            } else if (authMode === 'forgot') {
                // Step 0: Request Code
                if (resetStep === 0) {
                    if (!email) throw new Error("Please enter your email.");
                    const code = await onForgotPassword(email);
                    setGeneratedCode(code);
                    setResetStep(1); // Move to Verify Step
                } 
                // Step 1: Verify Code
                else if (resetStep === 1) {
                    if (inputCode.trim().toUpperCase() === generatedCode.trim().toUpperCase()) {
                        setResetStep(2); // Move to Password Step
                    } else {
                        throw new Error("Invalid Verification Code.");
                    }
                } 
                // Step 2: Reset Password
                else if (resetStep === 2) {
                    if (newPassword.length < 6) {
                        throw new Error("Password must be at least 6 characters.");
                    } else {
                        await onResetPassword(email, newPassword.trim());
                        // Reset all states
                        setAuthMode('login');
                        setResetStep(0);
                        setInputCode('');
                        setGeneratedCode('');
                        setNewPassword('');
                    }
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setFormLoading(false);
        }
    };
    
    const handleGuestSubmit = async () => {
        if (overallLoading) return;
        setGuestLoading(true);
        setError(null);
        try {
            await onGuestLogin();
        } catch (error: any) {
             console.error(error);
             setError(error.message || "Guest login failed.");
             setGuestLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden flex flex-col">
            {/* Hero Slider */}
            {activeImages.map((src, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div 
                        className="w-full h-full bg-cover bg-center animate-kenburns"
                        style={{ backgroundImage: `url(${src})` }}
                    />
                </div>
            ))}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

            {/* Slider Dots */}
            {activeImages.length > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
                    {activeImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-orange-500 scale-125' : 'bg-white/50 hover:bg-white'}`}
                            disabled={overallLoading}
                        />
                    ))}
                </div>
            )}

            {/* Auth Form */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-4 animate-fade-in overflow-y-auto">
                <div className="text-center mb-6 animate-slide-in-down">
                     <h2 className="text-2xl md:text-3xl font-rajdhani font-medium text-gray-300 tracking-wider">
                        welcome To
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white tracking-widest mt-1">
                        Game - Port
                    </h1>
                </div>

                <div className="w-full max-w-sm backdrop-blur-md p-8 rounded-2xl border border-white/20 animate-slide-in-up bg-black/40">
                    <h2 className="text-2xl font-bold text-center text-white mb-6 font-orbitron">
                        {authMode === 'signup' ? 'PLAYER SIGN UP' : authMode === 'forgot' ? 'RESET PASSWORD' : 'PLAYER LOGIN'}
                    </h2>
                    
                    {error && (
                        <div className="mb-4 bg-red-500/20 border border-red-500 rounded p-2 text-center shadow-lg shadow-red-500/10">
                            <p className="text-sm text-red-200 font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                         {authMode === 'signup' && (
                             <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Create Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/70 border-2 border-transparent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 disabled:opacity-50"
                                    required
                                    disabled={overallLoading}
                                />
                            </div>
                        )}
                        
                        {/* Logic for Normal Login/Signup Email Input */}
                        {(authMode !== 'forgot' || (authMode === 'forgot' && resetStep === 0)) && (
                            <div className="mb-4">
                                <input
                                    type={authMode === 'signup' || authMode === 'forgot' ? "email" : "text"}
                                    placeholder={authMode === 'signup' ? "Email Address" : authMode === 'forgot' ? "Enter Registered Email" : "Email or Username"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/70 border-2 border-transparent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 disabled:opacity-50"
                                    required
                                    disabled={overallLoading || (authMode === 'forgot' && resetStep > 0)}
                                />
                            </div>
                        )}

                        {/* Logic for Normal Password Input */}
                        {authMode !== 'forgot' && (
                            <div className="mb-2 relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/70 border-2 border-transparent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 disabled:opacity-50 pr-10"
                                    required
                                    disabled={overallLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                                    disabled={overallLoading}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Forgot Password Flow Inputs */}
                        {authMode === 'forgot' && resetStep === 1 && (
                            <div className="mb-4 animate-fade-in">
                                <p className="text-sm text-green-400 mb-2 text-center">Code sent to {email}</p>
                                <input
                                    type="text"
                                    placeholder="Enter Code (e.g. GP-1234)"
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/70 border-2 border-transparent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                    required
                                />
                            </div>
                        )}

                        {authMode === 'forgot' && resetStep === 2 && (
                            <div className="mb-4 animate-fade-in relative">
                                <p className="text-sm text-green-400 mb-2 text-center">Code Verified!</p>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/70 border-2 border-transparent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-white focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}

                        {authMode === 'login' && (
                            <div className="flex justify-end mb-6">
                                <button 
                                    type="button" 
                                    onClick={() => { setAuthMode('forgot'); setResetStep(0); }}
                                    className="text-xs text-orange-400 hover:text-orange-300 hover:underline disabled:opacity-50"
                                    disabled={overallLoading}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                        
                        <div className={authMode === 'login' ? '' : 'mt-6'}>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 flex justify-center items-center disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
                                disabled={overallLoading}
                            >
                                 {formLoading ? (
                                     <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                     </div>
                                 ) : (
                                     authMode === 'signup' ? 'SIGN UP' : 
                                     authMode === 'forgot' ? (resetStep === 0 ? 'SEND RESET CODE' : resetStep === 1 ? 'VERIFY CODE' : 'RESET PASSWORD') 
                                     : 'LOG IN'
                                 )}
                            </button>
                        </div>
                    </form>

                    {authMode !== 'forgot' && (
                        <>
                            <div className="text-center text-gray-400 my-4">OR</div>
                            <button
                                onClick={handleGuestSubmit}
                                className="w-full py-3 bg-gray-700/80 text-white font-semibold rounded-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gray-600 disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100 disabled:hover:animate-none flex justify-center items-center"
                                disabled={overallLoading}
                            >
                                {guestLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                        <span>Logging In...</span>
                                    </div>
                                ) : 'CONTINUE AS GUEST'}
                            </button>
                        </>
                    )}

                    <div className="text-center mt-6">
                        {authMode === 'forgot' ? (
                            <button 
                                onClick={() => { setAuthMode('login'); setResetStep(0); }} 
                                className="text-sm font-semibold text-gray-400 hover:text-white"
                                disabled={overallLoading}
                            >
                                ← Back to Login
                            </button>
                        ) : (
                            <p className="text-sm text-gray-500">
                                {authMode === 'signup' ? "Already have an account?" : "Don't have an account?"}{' '}
                                <button 
                                    onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')} 
                                    className="font-semibold bg-transparent border-none text-orange-400 hover:underline p-0 disabled:opacity-50" 
                                    disabled={overallLoading}
                                >
                                     {authMode === 'signup' ? 'Log In' : 'Sign Up'}
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Login Button - Fixed at bottom */}
            <div className="relative z-20 pb-6 px-4 flex justify-center w-full">
                <button 
                    onClick={() => setIsPinModalOpen(true)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group opacity-70 hover:opacity-100"
                >
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                    <span className="text-xs uppercase tracking-[0.2em] font-orbitron group-hover:underline">GamePort Official Private Account</span>
                </button>
            </div>

            <PinEntryModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                onSuccess={onAdminLogin}
            />
        </div>
    );
};

export default AuthScreen;
