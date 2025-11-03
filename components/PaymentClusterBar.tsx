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
  
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
  
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Payment Schedule</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="day"
            type="number"
            scale="linear"
            domain={[1, 31]}
            tickCount={16}
            stroke="#9ca3af"
          />
          <YAxis
            stroke="#9ca3af"
            tickFormatter={(value) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(value)
            }
          />
          <Legend />
          {creditorNames.map((name, index) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

