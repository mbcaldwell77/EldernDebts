'use client';

interface HeroCountersProps {
  thisWeek: number;
  nextWeek: number;
  thisMonth: number;
  yearTotal: number;
  totalDebt: number;
}

export function HeroCounters({
  thisWeek,
  nextWeek,
  thisMonth,
  yearTotal,
  totalDebt,
}: HeroCountersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    { label: 'This Week', value: thisWeek },
    { label: 'Next Week', value: nextWeek },
    { label: 'This Month', value: thisMonth },
    { label: 'Year Estimate', value: yearTotal },
    { label: 'Total Debt', value: totalDebt },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg transition-all duration-200"
        >
          <div className="text-sm text-gray-400 mb-2">{card.label}</div>
          <div className={`text-2xl font-mono font-bold ${card.label === 'Total Debt' ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

