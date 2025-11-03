import { Debt, Payment } from '@/types';
import { getDebts, saveDebts, getPayments, savePayments } from './store';
import { nextDueDate } from './date';
import { parseISO, addMonths } from 'date-fns';

export function logPayment(
  debtId: string,
  amount: number,
  paidOn: Date,
  countTowardCycle: boolean
): void {
  const debts = getDebts();
  const payments = getPayments();
  
  const debtIndex = debts.findIndex(d => d.id === debtId);
  if (debtIndex === -1) return;
  
  const debt = debts[debtIndex];
  
  // Create payment record
  const payment: Payment = {
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    debt_id: debtId,
    amount,
    paid_on: paidOn.toISOString(),
    count_toward_cycle: countTowardCycle,
  };
  
  payments.push(payment);
  savePayments(payments);
  
  // Update debt balance
  debt.balance = Math.max(0, debt.balance - amount);
  
  // Track cycle payment if counting toward cycle
  if (countTowardCycle) {
    debt.paid_this_cycle += amount;
    
    // Check if cycle is satisfied
    if (debt.paid_this_cycle >= debt.monthly_payment && debt.active) {
      // Advance nextDueDate by one month
      const currentDue = parseISO(debt.nextDueDate);
      const nextDue = addMonths(currentDue, 1);
      debt.nextDueDate = nextDueDate(debt.due_day, nextDue).toISOString();
      
      // Reset paid_this_cycle for next cycle
      debt.paid_this_cycle = 0;
    }
  }
  
  // Handle overpayment and zeroing
  if (debt.balance <= 0) {
    debt.balance = 0;
    debt.active = false;
    debt.paid_this_cycle = 0;
    
    // Warn if autopay is enabled (UI should handle this)
  }
  
  // Clamp minimum payment if it exceeds balance
  if (debt.monthly_payment > debt.balance && debt.balance > 0) {
    // Don't modify monthly_payment here - let EditDebtModal handle it
    // But ensure we don't over-pay
    if (countTowardCycle && debt.paid_this_cycle > debt.balance) {
      debt.paid_this_cycle = debt.balance;
    }
  }
  
  debts[debtIndex] = debt;
  saveDebts(debts);
}

