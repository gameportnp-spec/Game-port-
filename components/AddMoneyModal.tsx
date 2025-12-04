
import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';

interface AddMoneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onConfirmAddMoney: (amount: number, method: 'esewa' | 'khalti', screenshotUrl: string) => void;
}

const PAYMENT_DETAILS = {
    esewa: {
        id: '9704007111',
        name: 'Game-port Np'
    },
    khalti: {
        id: '9704007111',
        name: 'Game-port Np'
    }
};

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ isOpen, onClose, balance, onConfirmAddMoney }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'esewa' | 'khalti'>('esewa');
    const [screenshotUrl, setScreenshotUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setAmount('');
            setScreenshotUrl('');
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
        if (numericAmount < 50) {
            setError('Minimum deposit amount is रू50.');
            return;
        }
        if (!screenshotUrl) {
            setError('Please upload the payment screenshot.');
            return;
        }
        
        // Validation passed
        onConfirmAddMoney(numericAmount, method, screenshotUrl);
    };

    if (!isOpen) return null;

    const selectedPaymentDetails = PAYMENT_DETAILS[method];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md m-4 p-6 shadow-2xl animate-slide-in-up max-h-[90vh] overflow-y-auto" style={{ opacity: 0 }} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Add Money</h2>
                    <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <p className="text-sm text-gray-400 mb-4">Current Balance: <span className="font-bold text-yellow-400">रू{balance.toLocaleString()}</span></p>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm font-semibold animate-fade-in">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-1 block">Amount (रू)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Minimum 50"
                            className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">Payment Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${method === 'esewa' ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                <input type="radio" name="paymentMethod" value="esewa" checked={method === 'esewa'} onChange={() => setMethod('esewa')} className="hidden" />
                                <img src="https://i.ibb.co/rKMWtg76/thumb.jpg" alt="eSewa" className="h-8 w-auto rounded" />
                            </label>
                            <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${method === 'khalti' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                <input type="radio" name="paymentMethod" value="khalti" checked={method === 'khalti'} onChange={() => setMethod('khalti')} className="hidden" />
                                <img src="https://i.ibb.co/27X4sG73/download.png" alt="Khalti" className="h-8 w-auto" />
                            </label>
                        </div>
                    </div>
                    
                    <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-300">Please send <strong className="text-white">रू{parseFloat(amount) || '...'}</strong> to our {method === 'esewa' ? 'eSewa' : 'Khalti'} account:</p>
                        <p className="font-mono text-lg font-bold text-orange-400 mt-1">{selectedPaymentDetails.id}</p>
                        <p className="text-xs text-gray-400">({selectedPaymentDetails.name})</p>
                    </div>

                    <div>
                         <FileUploader 
                            label="Payment Screenshot" 
                            onFileSelect={(base64) => setScreenshotUrl(base64)} 
                            placeholder="Upload Screenshot"
                         />
                    </div>
                </div>

                <div className="flex space-x-4 mt-6">
                    <button onClick={onClose} className="w-full py-3 bg-gray-700/80 text-white font-semibold rounded-lg transform transition-transform duration-200 hover:scale-105 active:scale-95 hover:bg-gray-600">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg ripple transform transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
                    >
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMoneyModal;
