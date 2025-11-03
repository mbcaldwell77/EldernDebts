import { Debt, SimulationResult } from '@/types';

interface SimulatedDebt {
  id: string;
  balance: number;
  monthly_payment: number;
  APR: number;
}

function applyInterest(balance: number, apr: number): number {
  if (apr === 0) return balance;
  const monthlyRate = apr / 100 / 12;
  return balance * (1 + monthlyRate);
}

function simulatePayoff(
  debts: SimulatedDebt[],
  payoffOrder: string[],
  extraCash: number
): SimulationResult {
  const debtMap = new Map<string, SimulatedDebt>();
  debts.forEach(d => debtMap.set(d.id, { ...d }));
  
  let totalInterest = 0;
  let monthsToZero = 0;
  const monthlySchedule: Array<{
    monthIndex: number;
    payments: Array<{ debt_id: string; amount: number }>;
  }> = [];
  
  let firstPayoffInMonths = -1;
  let allZeroed = false;
  
  while (!allZeroed && monthsToZero < 1000) {
    // Apply interest
    debtMap.forEach(debt => {
      const interest = applyInterest(debt.balance, debt.APR) - debt.balance;
      debt.balance = applyInterest(debt.balance, debt.APR);
      totalInterest += interest;
    });
    
    const monthPayments: Array<{ debt_id: string; amount: number }> = [];
    let remainingExtra = extraCash;
    
    // Pay minimums and allocate extra in payoff order
    for (const debtId of payoffOrder) {
      const debt = debtMap.get(debtId);
      if (!debt || debt.balance <= 0) continue;
      
      const payment = Math.min(debt.monthly_payment, debt.balance);
      debt.balance -= payment;
      
      if (payment > 0) {
        monthPayments.push({ debt_id: debtId, amount: payment });
      }
      
      // Allocate extra cash
      if (remainingExtra > 0 && debt.balance > 0) {
        const extraPayment = Math.min(remainingExtra, debt.balance);
        debt.balance -= extraPayment;
        remainingExtra -= extraPayment;
        
        const existingPayment = monthPayments.find(p => p.debt_id === debtId);
        if (existingPayment) {
          existingPayment.amount += extraPayment;
        } else {
          monthPayments.push({ debt_id: debtId, amount: extraPayment });
        }
      }
      
      // Track first payoff
      if (debt.balance <= 0 && firstPayoffInMonths === -1) {
        firstPayoffInMonths = monthsToZero + 1;
      }
    }
    
    if (monthPayments.length > 0) {
      monthlySchedule.push({
        monthIndex: monthsToZero,
        payments: monthPayments,
      });
    }
    
    monthsToZero++;
    
    // Check if all debts are zeroed
    allZeroed = Array.from(debtMap.values()).every(d => d.balance <= 0);
  }
  
  return {
    monthsToZero,
    totalInterest,
    payoffOrder,
    firstPayoffInMonths: firstPayoffInMonths === -1 ? monthsToZero : firstPayoffInMonths,
    monthlySchedule,
  };
}

export function simulateSnowball(debts: Debt[], extraCash: number): SimulationResult {
  const activeDebts = debts.filter(d => d.active && d.balance > 0);
  
  // Order by balance ascending
  const sorted = [...activeDebts].sort((a, b) => a.balance - b.balance);
  const payoffOrder = sorted.map(d => d.id);
  
  const simulatedDebts: SimulatedDebt[] = activeDebts.map(d => ({
    id: d.id,
    balance: d.balance,
    monthly_payment: d.monthly_payment,
    APR: d.APR,
  }));
  
  return simulatePayoff(simulatedDebts, payoffOrder, extraCash);
}

export function simulateAvalanche(debts: Debt[], extraCash: number): SimulationResult {
  const activeDebts = debts.filter(d => d.active && d.balance > 0);
  
  // Order by APR descending, tie-break by smaller balance
  const sorted = [...activeDebts].sort((a, b) => {
    if (b.APR !== a.APR) return b.APR - a.APR;
    return a.balance - b.balance;
  });
  const payoffOrder = sorted.map(d => d.id);
  
  const simulatedDebts: SimulatedDebt[] = activeDebts.map(d => ({
    id: d.id,
    balance: d.balance,
    monthly_payment: d.monthly_payment,
    APR: d.APR,
  }));
  
  return simulatePayoff(simulatedDebts, payoffOrder, extraCash);
}

export function simulateHybrid(debts: Debt[], extraCash: number): SimulationResult {
  const activeDebts = debts.filter(d => d.active && d.balance > 0);
  
  // Quick-win check: any debt that can be cleared in ≤2 months with (extraCash + minimum)
  const totalMonthly = activeDebts.reduce((sum, d) => sum + d.monthly_payment, 0);
  const availablePerMonth = extraCash + totalMonthly;
  
  let quickWinId: string | null = null;
  for (const debt of activeDebts) {
    const monthsToClear = Math.ceil(
      debt.balance / (debt.monthly_payment + extraCash)
    );
    if (monthsToClear <= 2 && debt.balance <= availablePerMonth * 2) {
      quickWinId = debt.id;
      break;
    }
  }
  
  // If quick win found, prioritize it, then use avalanche logic
  const remainingDebts = activeDebts.filter(d => d.id !== quickWinId);
  const sorted = [...remainingDebts].sort((a, b) => {
    if (b.APR !== a.APR) return b.APR - a.APR;
    return a.balance - b.balance;
  });
  
  const payoffOrder = quickWinId
    ? [quickWinId, ...sorted.map(d => d.id)]
    : sorted.map(d => d.id);
  
  const simulatedDebts: SimulatedDebt[] = activeDebts.map(d => ({
    id: d.id,
    balance: d.balance,
    monthly_payment: d.monthly_payment,
    APR: d.APR,
  }));
  
  return simulatePayoff(simulatedDebts, payoffOrder, extraCash);
}

