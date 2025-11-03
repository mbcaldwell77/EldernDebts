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
    { label: 'This Week', value: thisWeek, accent: 'blue' },
    { label: 'Next Week', value: nextWeek, accent: 'purple' },
    { label: 'This Month', value: thisMonth, accent: 'green' },
    { label: 'Year Estimate', value: yearTotal, accent: 'blue' },
    { label: 'Total Debt', value: totalDebt, accent: 'red' },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card rounded-xl p-6 shadow-elegant transition-smooth"
        >
          <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
            {card.label}
          </div>
          <div className={`text-2xl font-mono font-bold tracking-tight ${
            card.label === 'Total Debt' 
              ? 'text-red-400' 
              : card.accent === 'blue'
              ? 'text-[#10b981]'
              : card.accent === 'purple'
              ? 'text-slate-400'
              : 'text-[#10b981]'
          }`}>
            {formatCurrency(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

