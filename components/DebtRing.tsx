'use client';

import { Debt } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DebtRingProps {
  debts: Debt[];
  onDebtClick: (debtId: string | null) => void;
  selectedDebtId: string | null;
}

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

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
    <div className="glass-card rounded-xl p-6 shadow-elegant transition-smooth">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-tight">Debt Distribution</h2>
        <span className="text-xs text-gray-400 cursor-pointer hover:text-[#10b981] transition-smooth">View all →</span>
      </div>
      {data.length === 0 ? (
        <div className="text-gray-500 text-center py-12 text-lg">No active debts</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={selectedDebtId === null || selectedDebtId === entry.id ? 1 : 0.25}
                  style={{ filter: selectedDebtId === null || selectedDebtId === entry.id ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'none' }}
                />
              ))}
            </Pie>
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
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

