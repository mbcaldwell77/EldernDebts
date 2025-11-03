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
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="day"
            type="number"
            scale="linear"
            domain={[1, 31]}
            tickCount={16}
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
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
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
              fill={COLORS[index % COLORS.length]}
              radius={[0, 0, 4, 4]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

