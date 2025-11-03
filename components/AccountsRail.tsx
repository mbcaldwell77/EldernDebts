'use client';

import { Debt } from '@/types';
import { parseISO, format } from 'date-fns';
import { daysUntilDue } from '@/lib/date';

interface AccountsRailProps {
  debts: Debt[];
  filteredDebtId: string | null;
  onLogPayment: (debtId: string) => void;
  onEdit: (debtId: string) => void;
}

export function AccountsRail({
  debts,
  filteredDebtId,
  onLogPayment,
  onEdit,
}: AccountsRailProps) {
  const activeDebts = debts.filter(d => d.active);
  
  // Filter if a debt is selected
  const displayedDebts = filteredDebtId
    ? activeDebts.filter(d => d.id === filteredDebtId)
    : activeDebts;
  
  // Sort by days until due
  const sortedDebts = [...displayedDebts].sort((a, b) => {
    const today = new Date();
    const daysA = daysUntilDue(parseISO(a.nextDueDate), today);
    const daysB = daysUntilDue(parseISO(b.nextDueDate), today);
    return daysA - daysB;
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d');
  };
  
  const getDaysUntilBadge = (dueDate: Date, today: Date) => {
    const days = daysUntilDue(dueDate, today);
    if (days === 0) return { text: 'Due Today', color: 'bg-red-600' };
    if (days <= 3) return { text: `${days}d`, color: 'bg-orange-600' };
    if (days <= 7) return { text: `${days}d`, color: 'bg-yellow-600' };
    return { text: `${days}d`, color: 'bg-gray-600' };
  };
  
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        Accounts {filteredDebtId && <span className="text-sm text-gray-400">(filtered)</span>}
      </h2>
      <div className="space-y-3">
        {sortedDebts.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No active debts</div>
        ) : (
          sortedDebts.map((debt) => {
            const today = new Date();
            const dueDate = parseISO(debt.nextDueDate);
            const days = daysUntilDue(dueDate, today);
            const badge = getDaysUntilBadge(dueDate, today);
            const progress = Math.min(100, (debt.balance / (debt.balance + debt.paid_this_cycle)) * 100);
            
            return (
              <div
                key={debt.id}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-150"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{debt.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${badge.color} text-white`}>
                        {badge.text}
                      </span>
                      {debt.autopay && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white">
                          Autopay
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-2">
                      Due: {formatDate(debt.nextDueDate)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-400">Payment: </span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(debt.monthly_payment)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Balance: </span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(debt.balance)}
                        </span>
                      </div>
                      {debt.APR > 0 && (
                        <div>
                          <span className="text-gray-400">APR: </span>
                          <span className="font-mono">{debt.APR}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onLogPayment(debt.id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-150"
                    >
                      Log
                    </button>
                    <button
                      onClick={() => onEdit(debt.id)}
                      className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-150"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

