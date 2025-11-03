'use client';

import { Debt } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DebtRingProps {
  debts: Debt[];
  onDebtClick: (debtId: string | null) => void;
  selectedDebtId: string | null;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export function DebtRing({ debts, onDebtClick, selectedDebtId }: DebtRingProps) {
  const activeDebts = debts.filter(d => d.active && d.balance > 0);
  
  const data = activeDebts.map((debt) => ({
    name: debt.name,
    value: debt.balance,
    id: debt.id,
  }));

  const handleClick = (data: any) => {
    if (data && data.id) {
      if (selectedDebtId === data.id) {
        onDebtClick(null);
      } else {
        onDebtClick(data.id);
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Debt Distribution</h2>
      {data.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No active debts</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={selectedDebtId === null || selectedDebtId === entry.id ? 1 : 0.3}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value)
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

