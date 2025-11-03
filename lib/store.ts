import { Debt, Payment, Preferences } from '@/types';

const DEBTS_KEY = 'dcd_debts_v1';
const PAYMENTS_KEY = 'dcd_payments_v1';
const PREFERENCES_KEY = 'dcd_preferences_v1';

export function getDebts(): Debt[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DEBTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveDebts(debts: Debt[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEBTS_KEY, JSON.stringify(debts));
}

export function getPayments(): Payment[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PAYMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePayments(payments: Payment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function getPreferences(): Preferences | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(PREFERENCES_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function savePreferences(preferences: Preferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function getDefaultPreferences(): Preferences {
  return {
    weekStart: 'mon',
    currency: 'USD',
    theme: 'dark',
    showNextMonthPreview: false,
    strategy: 'hybrid',
    extraCash: 0,
  };
}

export function seedSampleData(): void {
  const today = new Date();
  const debts: Debt[] = [
    {
      id: '1',
      name: 'Credit Card A',
      balance: 5000,
      monthly_payment: 150,
      due_day: 15,
      APR: 24.99,
      active: true,
      paid_this_cycle: 0,
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(),
      autopay: false,
    },
    {
      id: '2',
      name: 'Student Loan',
      balance: 15000,
      monthly_payment: 300,
      due_day: 5,
      APR: 6.5,
      active: true,
      paid_this_cycle: 0,
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), 5).toISOString(),
      autopay: true,
    },
    {
      id: '3',
      name: 'Car Loan',
      balance: 12000,
      monthly_payment: 400,
      due_day: 22,
      APR: 5.75,
      active: true,
      paid_this_cycle: 0,
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), 22).toISOString(),
      autopay: true,
    },
    {
      id: '4',
      name: 'Credit Card B',
      balance: 2500,
      monthly_payment: 75,
      due_day: 28,
      APR: 18.99,
      active: true,
      paid_this_cycle: 0,
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), 28).toISOString(),
      autopay: false,
    },
  ];

  saveDebts(debts);
  
  const preferences = getDefaultPreferences();
  savePreferences(preferences);
}

