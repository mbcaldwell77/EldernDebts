'use client';

import { useState } from 'react';
import { Debt, Preferences } from '@/types';
import { getDebts, saveDebts, getPreferences, savePreferences, getDefaultPreferences, seedSampleData } from '@/lib/store';
import { nextDueDate } from '@/lib/date';

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [debts, setDebts] = useState<Omit<Debt, 'id' | 'active' | 'paid_this_cycle' | 'nextDueDate'>[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(getDefaultPreferences());
  
  const [newDebt, setNewDebt] = useState({
    name: '',
    balance: '',
    monthly_payment: '',
    due_day: '',
    APR: '',
    autopay: false,
  });
  
  const handleAddDebt = () => {
    if (!newDebt.name || !newDebt.balance || !newDebt.monthly_payment || !newDebt.due_day) {
      return;
    }
    
    const today = new Date();
    const dueDay = parseInt(newDebt.due_day);
    const nextDue = nextDueDate(dueDay, today);
    
    setDebts([
      ...debts,
      {
        name: newDebt.name,
        balance: parseFloat(newDebt.balance),
        monthly_payment: parseFloat(newDebt.monthly_payment),
        due_day: dueDay,
        APR: parseFloat(newDebt.APR) || 0,
        autopay: newDebt.autopay,
      },
    ]);
    
    setNewDebt({
      name: '',
      balance: '',
      monthly_payment: '',
      due_day: '',
      APR: '',
      autopay: false,
    });
  };
  
  const handleComplete = () => {
    const today = new Date();
    const debtsToSave: Debt[] = debts.map((debt, index) => ({
      id: `debt_${Date.now()}_${index}`,
      ...debt,
      active: true,
      paid_this_cycle: 0,
      nextDueDate: nextDueDate(debt.due_day, today).toISOString(),
    }));
    
    saveDebts(debtsToSave);
    savePreferences(preferences);
    onComplete();
  };
  
  const handleUseSample = () => {
    seedSampleData();
    onComplete();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-smooth">
      <div className="glass-card rounded-card-lg shadow-elegant-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-smooth">
        <div className="p-10">
          <h2 className="text-4xl font-bold mb-3 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Welcome to Eldern Debts</h2>
          <p className="text-gray-400 mb-10 text-lg font-medium">Let's set up your debt tracking dashboard</p>
          
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Step 1: Add Your Debts</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Debt Name</label>
                    <input
                      type="text"
                      value={newDebt.name}
                      onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      className="w-full glass-card rounded-card px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
                      placeholder="e.g., Credit Card A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Balance</label>
                    <input
                      type="number"
                      value={newDebt.balance}
                      onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                      className="w-full glass-card rounded-card px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Monthly Payment</label>
                    <input
                      type="number"
                      value={newDebt.monthly_payment}
                      onChange={(e) => setNewDebt({ ...newDebt, monthly_payment: e.target.value })}
                      className="w-full glass-card rounded-card px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Due Day (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newDebt.due_day}
                      onChange={(e) => setNewDebt({ ...newDebt, due_day: e.target.value })}
                      className="w-full glass-card rounded-card px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">APR (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newDebt.APR}
                      onChange={(e) => setNewDebt({ ...newDebt, APR: e.target.value })}
                      className="w-full glass-card rounded-card px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-smooth"
                      placeholder="24.99"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDebt.autopay}
                        onChange={(e) => setNewDebt({ ...newDebt, autopay: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-400">Autopay enabled</span>
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleAddDebt}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full px-6 py-3 font-semibold text-white transition-smooth shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                >
                  Add Debt
                </button>
              </div>
              
              {debts.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2">Added Debts:</h4>
                  <div className="space-y-2">
                    {debts.map((debt, index) => (
                      <div key={index} className="glass-card rounded-card p-4 flex justify-between items-center">
                        <span>{debt.name}</span>
                        <span className="font-mono text-sm">
                          ${debt.balance.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleUseSample}
                  className="px-6 py-3 glass-card hover:border-gray-600 rounded-full font-semibold text-gray-300 hover:text-white transition-smooth"
                >
                  Use Sample Data
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={debts.length === 0}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full font-semibold text-white transition-smooth shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Preferences
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Step 2: Set Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Week Start</label>
                  <div className="flex gap-2">
                    {(['mon', 'sun'] as const).map((day) => (
                      <button
                        key={day}
                        onClick={() => setPreferences({ ...preferences, weekStart: day })}
                        className={`px-6 py-3 rounded-full text-sm font-semibold transition-smooth ${
                          preferences.weekStart === day
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'glass-card text-gray-300 hover:text-white hover:shadow-elegant'
                        }`}
                      >
                        {day === 'mon' ? 'Monday' : 'Sunday'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Currency</label>
                  <input
                    type="text"
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Default Strategy</label>
                  <div className="flex gap-2">
                    {(['snowball', 'avalanche', 'hybrid'] as const).map((strategy) => (
                      <button
                        key={strategy}
                        onClick={() => setPreferences({ ...preferences, strategy })}
                        className={`px-6 py-3 rounded-full text-sm font-semibold transition-smooth ${
                          preferences.strategy === strategy
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'glass-card text-gray-300 hover:text-white hover:shadow-elegant'
                        }`}
                      >
                        {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 glass-card hover:border-gray-600 rounded-full font-semibold text-gray-300 hover:text-white transition-smooth"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full font-semibold text-white transition-smooth shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Step 3: Review</h3>
              
              <div>
                <h4 className="font-semibold mb-2">Debts ({debts.length})</h4>
                <div className="space-y-2 glass-card rounded-card p-5">
                  {debts.map((debt, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{debt.name}</span>
                      <span className="font-mono">
                        ${debt.balance.toLocaleString()} / ${debt.monthly_payment.toLocaleString()}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Preferences</h4>
                <div className="glass-card rounded-card p-5 space-y-2 text-sm">
                  <div>Week Start: {preferences.weekStart === 'mon' ? 'Monday' : 'Sunday'}</div>
                  <div>Currency: {preferences.currency}</div>
                  <div>Strategy: {preferences.strategy}</div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 glass-card hover:border-gray-600 rounded-full font-semibold text-gray-300 hover:text-white transition-smooth"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-full font-semibold text-white transition-smooth shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                >
                  Start Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

