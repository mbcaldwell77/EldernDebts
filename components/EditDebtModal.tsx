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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Edit Debt</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Debt Name</label>
              <div className="text-lg font-semibold">{debt.name}</div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monthly Payment</label>
              <input
                type="number"
                step="0.01"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Day (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">APR (%)</label>
              <input
                type="number"
                step="0.01"
                value={apr}
                onChange={(e) => setApr(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
              />
            </div>
            
            <div className="pt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-150"
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

