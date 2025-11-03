export interface Debt {
  id: string;
  name: string;
  balance: number;
  monthly_payment: number;
  due_day: number;
  APR: number;
  active: boolean;
  paid_this_cycle: number;
  nextDueDate: string; // ISO date string
  autopay: boolean;
}

export interface Payment {
  id: string;
  debt_id: string;
  amount: number;
  paid_on: string; // ISO date string
  count_toward_cycle: boolean;
}

export interface Preferences {
  weekStart: 'mon' | 'sun';
  currency: string;
  theme: 'dark' | 'light';
  showNextMonthPreview: boolean;
  strategy: 'snowball' | 'avalanche' | 'hybrid';
  extraCash: number;
}

export interface SimulationResult {
  monthsToZero: number;
  totalInterest: number;
  payoffOrder: string[];
  firstPayoffInMonths: number;
  monthlySchedule?: Array<{
    monthIndex: number;
    payments: Array<{
      debt_id: string;
      amount: number;
    }>;
  }>;
}

