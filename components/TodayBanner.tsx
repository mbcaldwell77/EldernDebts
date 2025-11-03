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
    <div className="bg-orange-900/50 border border-orange-800 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-orange-200 mb-1">
            {dueToday.length} {dueToday.length === 1 ? 'debt' : 'debts'} due today
          </h3>
          <p className="text-sm text-orange-300">
            Mark them as paid to update your totals
          </p>
        </div>
        <div className="flex gap-2">
          {dueToday.map((debt) => (
            <button
              key={debt.id}
              onClick={() => onPaymentClick(debt.id)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors duration-150"
            >
              Mark {debt.name} Paid
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

