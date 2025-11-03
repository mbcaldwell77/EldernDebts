'use client';

import { Debt } from '@/types';
import { parseISO, isSameDay } from 'date-fns';
import { daysUntilDue } from '@/lib/date';

interface TodayBannerProps {
  debts: Debt[];
  onPaymentClick: (debtId: string) => void;
}

export function TodayBanner({ debts, onPaymentClick }: TodayBannerProps) {
  const today = new Date();
  const activeDebts = debts.filter(d => d.active);
  
  const dueToday = activeDebts.filter(debt => {
    const dueDate = parseISO(debt.nextDueDate);
    return isSameDay(dueDate, today);
  });
  
  if (dueToday.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-r from-orange-900/60 to-orange-800/40 backdrop-blur-sm border border-orange-700/50 rounded-card-lg p-6 shadow-elegant-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-orange-200 mb-2 tracking-tight">
            {dueToday.length} {dueToday.length === 1 ? 'debt' : 'debts'} due today
          </h3>
          <p className="text-sm text-orange-300/90 font-medium">
            Mark them as paid to update your totals
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {dueToday.map((debt) => (
            <button
              key={debt.id}
              onClick={() => onPaymentClick(debt.id)}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 rounded-full text-sm font-semibold text-white transition-smooth shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
            >
              Mark {debt.name} Paid
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

