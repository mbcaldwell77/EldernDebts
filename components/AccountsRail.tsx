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
    <div className="glass-card rounded-card-lg p-8 shadow-elegant transition-smooth">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">
        Accounts {filteredDebtId && <span className="text-sm text-gray-400 font-normal">(filtered)</span>}
      </h2>
      <div className="space-y-4">
        {sortedDebts.length === 0 ? (
          <div className="text-gray-500 text-center py-12 text-lg">No active debts</div>
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
                className="glass-card rounded-card p-6 border border-gray-700/50 hover:border-gray-600/50 transition-smooth glass-card-hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-bold text-lg">{debt.name}</h3>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${badge.color} text-white shadow-lg`}>
                        {badge.text}
                      </span>
                      {debt.autopay && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30">
                          Autopay
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-4 font-medium">
                      Due: {formatDate(debt.nextDueDate)}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div>
                        <span className="text-gray-400">Payment: </span>
                        <span className="font-mono font-bold text-blue-400">
                          {formatCurrency(debt.monthly_payment)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Balance: </span>
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(debt.balance)}
                        </span>
                      </div>
                      {debt.APR > 0 && (
                        <div>
                          <span className="text-gray-400">APR: </span>
                          <span className="font-mono font-semibold text-red-400">{debt.APR}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-800/50 rounded-full h-3 mb-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/30"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 ml-6">
                    <button
                      onClick={() => onLogPayment(debt.id)}
                      className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full text-white transition-smooth shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                    >
                      Log
                    </button>
                    <button
                      onClick={() => onEdit(debt.id)}
                      className="px-5 py-2.5 text-sm font-semibold glass-card hover:border-gray-600 rounded-full text-gray-300 hover:text-white transition-smooth"
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

