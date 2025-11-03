'use client';

import { Debt } from '@/types';
import { parseISO, addMonths, isSameMonth } from 'date-fns';
import { nextDueDate } from '@/lib/date';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PaymentClusterBarProps {
  debts: Debt[];
  showNextMonth: boolean;
}

export function PaymentClusterBar({ debts, showNextMonth }: PaymentClusterBarProps) {
  const today = new Date();
  const activeDebts = debts.filter(d => d.active);

  // Build data for days 1-31
  const monthData: Record<number, Array<{ name: string; amount: number }>> = {};

  // Initialize all days
  for (let day = 1; day <= 31; day++) {
    monthData[day] = [];
  }

  // Current month
  activeDebts.forEach(debt => {
    const dueDate = parseISO(debt.nextDueDate);
    if (isSameMonth(dueDate, today)) {
      const day = dueDate.getDate();
      if (monthData[day]) {
        monthData[day].push({
          name: debt.name,
          amount: debt.monthly_payment,
        });
      }
    }
  });

  // Next month if enabled
  if (showNextMonth) {
    const nextMonth = addMonths(today, 1);
    activeDebts.forEach(debt => {
      const currentDue = parseISO(debt.nextDueDate);
      const nextDue = nextDueDate(debt.due_day, addMonths(currentDue, 1));
      if (isSameMonth(nextDue, nextMonth)) {
        const day = nextDue.getDate();
        if (monthData[day]) {
          monthData[day].push({
            name: `${debt.name} (next)`,
            amount: debt.monthly_payment,
          });
        }
      }
    });
  }

  // Transform to chart format
  const chartData = Object.entries(monthData).map(([day, payments]) => {
    const base: Record<string, number | string> = { day: parseInt(day) };
    payments.forEach(payment => {
      base[payment.name] = payment.amount;
    });
    return base;
  });

  // Get unique creditor names for colors
  const creditorNames = Array.from(
    new Set(activeDebts.map(d => d.name).concat(
      showNextMonth ? activeDebts.map(d => `${d.name} (next)`) : []
    ))
  );

  const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="glass-card rounded-xl p-6 shadow-elegant transition-smooth">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight">Payment Schedule</h2>
        <span className="text-xs text-gray-400 cursor-pointer hover:text-[#10b981] transition-smooth">View all →</span>
      </div>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
          <defs>
            {creditorNames.map((name, index) => (
              <linearGradient key={name} id={`barFill${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(18,225,185,0.85)" />
                <stop offset="100%" stopColor="rgba(158,247,233,0.35)" />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="day"
            type="number"
            scale="linear"
            domain={[1, 31]}
            tickCount={16}
            stroke="#7E8B86"
            tick={{ fill: '#7E8B86', fontSize: 12 }}
          />
          <YAxis
            stroke="#7E8B86"
            tick={{ fill: '#7E8B86', fontSize: 12 }}
            tickFormatter={(value) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
              }).format(value)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(24,36,31,0.9)',
              border: '1px solid #1D2B25',
              borderRadius: '0.75rem',
              backdropFilter: 'blur(12px)',
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(value)
            }
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          {creditorNames.map((name, index) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="a"
              fill={`url(#barFill${index})`}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

