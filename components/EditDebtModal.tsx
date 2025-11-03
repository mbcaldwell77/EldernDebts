'use client';

import { useState, useEffect } from 'react';
import { getDebts, saveDebts } from '@/lib/store';
import { nextDueDate } from '@/lib/date';
import { Debt } from '@/types';

interface EditDebtModalProps {
  debtId: string;
  onClose: () => void;
}

export function EditDebtModal({ debtId, onClose }: EditDebtModalProps) {
  const [debt, setDebt] = useState<Debt | null>(null);
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [apr, setApr] = useState('');
  
  useEffect(() => {
    const debts = getDebts();
    const found = debts.find(d => d.id === debtId);
    setDebt(found || null);
    if (found) {
      setMonthlyPayment(found.monthly_payment.toString());
      setDueDay(found.due_day.toString());
      setApr(found.APR.toString());
    }
  }, [debtId]);
  
  const handleSave = () => {
    if (!debt) return;
    
    const debts = getDebts();
    const index = debts.findIndex(d => d.id === debtId);
    if (index === -1) return;
    
    const updatedDebt = { ...debts[index] };
    updatedDebt.monthly_payment = Math.max(0, parseFloat(monthlyPayment) || 0);
    
    // Clamp due day to 1-31
    const newDueDay = Math.max(1, Math.min(31, parseInt(dueDay) || 1));
    updatedDebt.due_day = newDueDay;
    updatedDebt.APR = Math.max(0, parseFloat(apr) || 0);
    
    // Recalculate nextDueDate if due day changed
    if (updatedDebt.due_day !== debt.due_day) {
      const today = new Date();
      updatedDebt.nextDueDate = nextDueDate(updatedDebt.due_day, today).toISOString();
    }
    
    // Clamp minimum payment to balance if needed
    if (updatedDebt.monthly_payment > updatedDebt.balance && updatedDebt.balance > 0) {
      updatedDebt.monthly_payment = updatedDebt.balance;
    }
    
    debts[index] = updatedDebt;
    saveDebts(debts);
    onClose();
  };
  
  if (!debt) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-smooth">
      <div className="glass-card rounded-card-lg shadow-elegant-lg max-w-md w-full transition-smooth">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 tracking-tight">Edit Debt</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium tracking-wide">Debt Name</label>
              <div className="text-xl font-bold">{debt.name}</div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-3 font-medium tracking-wide">Monthly Payment</label>
              <input
                type="number"
                step="0.01"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="w-full glass-card rounded-card px-5 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-3 font-medium tracking-wide">Due Day (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full glass-card rounded-card px-5 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-3 font-medium tracking-wide">APR (%)</label>
              <input
                type="number"
                step="0.01"
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                className="w-full glass-card rounded-card px-5 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
              />
            </div>
            
            <div className="pt-4 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 glass-card hover:border-gray-600 rounded-full font-semibold text-gray-300 hover:text-white transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full font-semibold text-white transition-smooth shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

