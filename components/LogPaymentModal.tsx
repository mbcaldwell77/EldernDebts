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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Log Payment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Debt</label>
              <div className="text-lg font-semibold">{debt.name}</div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
                placeholder="0.00"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="count-toward-cycle"
                checked={countTowardCycle}
                onChange={(e) => setCountTowardCycle(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="count-toward-cycle" className="text-sm text-gray-400 cursor-pointer">
                Count toward this payment cycle
              </label>
            </div>
            
            <div className="pt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-150"
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

