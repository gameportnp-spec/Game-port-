
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onConfirmWithdraw: (amount: number, method: 'esewa' | 'khalti', accountId: string) => void;
    kycStatus: User['kycStatus'];
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, balance, onConfirmWithdraw, kycStatus }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'esewa' | 'khalti'>('esewa');
    const [accountId, setAccountId] = useState('');
    const [error, setError] = useState('');

    const isKycVerified = kycStatus === 'verified';

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setAmount('');
            setAccountId('');
            setError('');
            setMethod('esewa');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const numericAmount = parseFloat(amount);
        setError('');

        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (numericAmount < 200) {
            setError('Minimum withdrawal amount is रू200.');
            return;
        }
        if (numericAmount > balance) {
            setError('Withdrawal amount cannot exceed your balance.');
            return;
        }
        if (!accountId.trim() || !/^\d{10}$/.test(accountId.trim())) {
            setError(`Please enter a valid 10-digit ${method === 'esewa' ? 'eSewa' : 'Khalti'} ID (phone number).`);
            return;
        }
        
        // Validation passed
        onConfirmWithdraw(numericAmount, method, accountId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Withdraw Funds</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <p className="text-sm text-gray-400 mb-4">Available Balance: <span className="font-bold text-yellow-400">रू{balance.toLocaleString()}</span></p>

                {!isKycVerified && (
                    <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-lg mb-4 text-sm font-semibold text-center animate-fade-in">
                        KYC verification is required to withdraw funds. Please verify your identity from the profile screen.
                    </div>
                )}

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold animate-fade-in">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-1 block">Amount (रू)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Minimum 200"
                            className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 disabled:opacity-50"
                            disabled={!isKycVerified}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">Payment Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${method === 'esewa' ? 'border-green-500 bg-green-500/10' : 'border-gray-600'} ${isKycVerified ? 'cursor-pointer hover:border-gray-500' : 'opacity-50'}`}>
                                <input type="radio" name="paymentMethod" value="esewa" checked={method === 'esewa'} onChange={() => setMethod('esewa')} className="hidden" disabled={!isKycVerified} />
                                <img src="https://i.ibb.co/rKMWtg76/thumb.jpg" alt="eSewa" className="h-8 w-auto rounded" />
                            </label>
                            <label className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${method === 'khalti' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'} ${isKycVerified ? 'cursor-pointer hover:border-gray-500' : 'opacity-50'}`}>
                                <input type="radio" name="paymentMethod" value="khalti" checked={method === 'khalti'} onChange={() => setMethod('khalti')} className="hidden" disabled={!isKycVerified} />
                                <img src="https://i.ibb.co/27X4sG73/download.png" alt="Khalti" className="h-8 w-auto" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="accountId" className="text-sm font-semibold text-gray-300 mb-1 block capitalize">{method} ID (Phone Number)</label>
                        <input
                            id="accountId"
                            type="tel"
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            placeholder={`Enter your 10-digit number`}
                            className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 disabled:opacity-50"
                            disabled={!isKycVerified}
                        />
                    </div>
                </div>

                <div className="flex space-x-4 mt-6">
                    <button onClick={onClose} className="w-full py-3 bg-gray-700/80 text-white font-semibold rounded-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gray-600">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={!isKycVerified}
                    >
                        Confirm Withdrawal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;