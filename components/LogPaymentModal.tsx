'use client';

import { useState, useEffect } from 'react';
import { getDebts } from '@/lib/store';
import { logPayment } from '@/lib/payments';
import { Debt } from '@/types';

interface LogPaymentModalProps {
  debtId: string;
  onClose: () => void;
}

export function LogPaymentModal({ debtId, onClose }: LogPaymentModalProps) {
  const [debt, setDebt] = useState<Debt | null>(null);
  const [amount, setAmount] = useState('');
  const [countTowardCycle, setCountTowardCycle] = useState(true);
  
  useEffect(() => {
    const debts = getDebts();
    const found = debts.find(d => d.id === debtId);
    setDebt(found || null);
    if (found) {
      setAmount(found.monthly_payment.toString());
    }
  }, [debtId]);
  
  const handleSubmit = () => {
    if (!debt || !amount || parseFloat(amount) <= 0) {
      return;
    }
    
    logPayment(debtId, parseFloat(amount), new Date(), countTowardCycle);
    onClose();
  };
  
  if (!debt) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-smooth">
      <div className="glass-card rounded-card-lg shadow-elegant-lg max-w-md w-full transition-smooth">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 tracking-tight">Log Payment</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium tracking-wide">Debt</label>
              <div className="text-xl font-bold">{debt.name}</div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-3 font-medium tracking-wide">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full glass-card rounded-card px-5 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
                placeholder="0.00"
              />
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-card glass-card">
              <input
                type="checkbox"
                id="count-toward-cycle"
                checked={countTowardCycle}
                onChange={(e) => setCountTowardCycle(e.target.checked)}
                className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
              />
              <label htmlFor="count-toward-cycle" className="text-sm text-gray-300 cursor-pointer hover:text-white transition-smooth">
                Count toward this payment cycle
              </label>
            </div>
            
            <div className="pt-4 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 glass-card hover:border-gray-600 rounded-full font-semibold text-gray-300 hover:text-white transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full font-semibold text-white transition-smooth shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                Log Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

