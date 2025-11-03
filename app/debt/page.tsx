'use client';

import { Debt, Preferences } from '@/types';
import { getDebts, getPreferences, getDefaultPreferences } from '@/lib/store';
import { calculateDueTotals, estimatedYearTotal } from '@/lib/estimates';
import { useState, useEffect } from 'react';
import { HeroCounters } from '@/components/HeroCounters';
import { StrategyPanel } from '@/components/StrategyPanel';
import { DebtRing } from '@/components/DebtRing';
import { PaymentClusterBar } from '@/components/PaymentClusterBar';
import { AccountsRail } from '@/components/AccountsRail';
import { TodayBanner } from '@/components/TodayBanner';
import { OnboardingModal } from '@/components/OnboardingModal';
import { LogPaymentModal } from '@/components/LogPaymentModal';
import { EditDebtModal } from '@/components/EditDebtModal';

export default function DebtDashboard() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [logPaymentDebtId, setLogPaymentDebtId] = useState<string | null>(null);
  const [editDebtId, setEditDebtId] = useState<string | null>(null);
  const [filteredDebtId, setFilteredDebtId] = useState<string | null>(null);

  useEffect(() => {
    const loadedDebts = getDebts();
    const loadedPreferences = getPreferences();
    
    setDebts(loadedDebts);
    
    if (!loadedPreferences) {
      setIsFirstRun(true);
      setPreferences(getDefaultPreferences());
    } else {
      setPreferences(loadedPreferences);
    }
  }, []);

  const refreshDebts = () => {
    setDebts(getDebts());
  };

  const handlePreferencesChange = (newPreferences: Preferences) => {
    setPreferences(newPreferences);
  };

  if (isFirstRun) {
    return (
      <OnboardingModal
        onComplete={() => {
          setIsFirstRun(false);
          setDebts(getDebts());
          const prefs = getPreferences();
          if (prefs) setPreferences(prefs);
        }}
      />
    );
  }

  if (!preferences) {
    return null;
  }

  const today = new Date();
  const totals = calculateDueTotals(debts, today, preferences);
  const yearTotal = estimatedYearTotal(debts);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Eldern Debts</h1>
          <p className="text-gray-400 mt-2">Debt tracking and payoff simulation</p>
        </header>

        <TodayBanner debts={debts} onPaymentClick={setLogPaymentDebtId} />

        <HeroCounters
          thisWeek={totals.thisWeek}
          nextWeek={totals.nextWeek}
          thisMonth={totals.thisMonth}
          yearTotal={yearTotal}
          totalDebt={totals.totalDebt}
        />

        <div className="grid grid-cols-2 gap-8">
          <StrategyPanel
            debts={debts}
            preferences={preferences}
            onPreferencesChange={handlePreferencesChange}
          />
          <DebtRing
            debts={debts}
            onDebtClick={setFilteredDebtId}
            selectedDebtId={filteredDebtId}
          />
        </div>

        <PaymentClusterBar
          debts={debts}
          showNextMonth={preferences.showNextMonthPreview}
        />

        <AccountsRail
          debts={debts}
          filteredDebtId={filteredDebtId}
          onLogPayment={setLogPaymentDebtId}
          onEdit={setEditDebtId}
        />

        {logPaymentDebtId && (
          <LogPaymentModal
            debtId={logPaymentDebtId}
            onClose={() => {
              setLogPaymentDebtId(null);
              refreshDebts();
            }}
          />
        )}

        {editDebtId && (
          <EditDebtModal
            debtId={editDebtId}
            onClose={() => {
              setEditDebtId(null);
              refreshDebts();
            }}
          />
        )}
      </div>
    </div>
  );
}

