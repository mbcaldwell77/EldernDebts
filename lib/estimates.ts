import { Debt, Preferences } from '@/types';
import { parseISO } from 'date-fns';
import { inThisWeek, inNextWeek, inThisMonth, isDateInRange, daysUntilDue } from './date';

export function estimatedYearTotal(debts: Debt[]): number {
  const activeDebts = debts.filter(d => d.active);
  return activeDebts.reduce((total, debt) => {
    return total + (debt.monthly_payment * 12);
  }, 0);
}

export function calculateDueTotals(
  debts: Debt[],
  today: Date,
  preferences: Preferences
): { thisWeek: number; nextWeek: number; thisMonth: number; totalDebt: number } {
  const activeDebts = debts.filter(d => d.active);
  
  const [thisWeekStart, thisWeekEnd] = inThisWeek(today, preferences.weekStart);
  const [nextWeekStart, nextWeekEnd] = inNextWeek(today, preferences.weekStart);
  const [monthStart, monthEnd] = inThisMonth(today);
  
  let thisWeekTotal = 0;
  let nextWeekTotal = 0;
  let thisMonthTotal = 0;
  
  activeDebts.forEach(debt => {
    const dueDate = parseISO(debt.nextDueDate);
    const daysUntil = daysUntilDue(dueDate, today);
    
    // Check if debt cycle is satisfied (paid_this_cycle >= monthly_payment)
    // If satisfied, exclude from totals until nextDueDate advances
    const isSatisfied = debt.paid_this_cycle >= debt.monthly_payment;
    
    if (isSatisfied && daysUntil > 0) {
      // Skip satisfied debts until next cycle
      return;
    }
    
    if (isDateInRange(dueDate, thisWeekStart, thisWeekEnd)) {
      thisWeekTotal += debt.monthly_payment;
    }
    
    if (isDateInRange(dueDate, nextWeekStart, nextWeekEnd)) {
      nextWeekTotal += debt.monthly_payment;
    }
    
    if (isDateInRange(dueDate, monthStart, monthEnd)) {
      thisMonthTotal += debt.monthly_payment;
    }
  });
  
  const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.balance, 0);
  
  return {
    thisWeek: thisWeekTotal,
    nextWeek: nextWeekTotal,
    thisMonth: thisMonthTotal,
    totalDebt,
  };
}

