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
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import GlassCard from '@/components/GlassCard';
import { GlowPanel } from '@/components/GlowPanel';

export default function DebtDashboard() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [logPaymentDebtId, setLogPaymentDebtId] = useState<string | null>(null);
  const [editDebtId, setEditDebtId] = useState<string | null>(null);
  const [filteredDebtId, setFilteredDebtId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="flex min-h-screen relative">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <div className="flex-1 p-8 overflow-y-auto relative z-10">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">🏠</span>
              <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
            </div>
            
            <div className="flex gap-3 mb-8">
              {['All', 'Withdrawal', 'Savings', 'Deposit'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-smooth ${
                    tab === 'All'
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#252525] text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <TodayBanner debts={debts} onPaymentClick={setLogPaymentDebtId} />

            <GlassCard className="p-4">
              <HeroCounters
                thisWeek={totals.thisWeek}
                nextWeek={totals.nextWeek}
                thisMonth={totals.thisMonth}
                yearTotal={yearTotal}
                totalDebt={totals.totalDebt}
              />
            </GlassCard>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7 space-y-6">
                <GlassCard className="p-6">
                  <StrategyPanel
                    debts={debts}
                    preferences={preferences}
                    onPreferencesChange={handlePreferencesChange}
                  />
                </GlassCard>
                <PaymentClusterBar
                  debts={debts}
                  showNextMonth={preferences.showNextMonthPreview}
                />
              </div>
              <div className="col-span-5 space-y-6">
                <GlowPanel />
                <GlassCard className="p-6">
                  <DebtRing
                    debts={debts}
                    onDebtClick={setFilteredDebtId}
                    selectedDebtId={filteredDebtId}
                  />
                </GlassCard>
              </div>
            </div>

            <AccountsRail
              debts={debts}
              filteredDebtId={filteredDebtId}
              onLogPayment={setLogPaymentDebtId}
              onEdit={setEditDebtId}
            />
          </div>
        </div>
      </div>

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
  );
}

