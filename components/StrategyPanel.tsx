'use client';

import { Debt, Preferences } from '@/types';
import { simulateSnowball, simulateAvalanche, simulateHybrid } from '@/lib/simulators';
import { savePreferences } from '@/lib/store';
import { useMemo } from 'react';

interface StrategyPanelProps {
    debts: Debt[];
    preferences: Preferences;
    onPreferencesChange: (prefs: Preferences) => void;
}

export function StrategyPanel({
    debts,
    preferences,
    onPreferencesChange,
}: StrategyPanelProps) {
    const simulation = useMemo(() => {
        const activeDebts = debts.filter(d => d.active && d.balance > 0);
        if (activeDebts.length === 0) {
            return null;
        }

        let result;
        switch (preferences.strategy) {
            case 'snowball':
                result = simulateSnowball(debts, preferences.extraCash);
                break;
            case 'avalanche':
                result = simulateAvalanche(debts, preferences.extraCash);
                break;
            case 'hybrid':
                result = simulateHybrid(debts, preferences.extraCash);
                break;
        }

        return {
            monthsToZero: result.monthsToZero,
            totalInterest: result.totalInterest,
            firstPayoffInMonths: result.firstPayoffInMonths,
        };
    }, [debts, preferences.strategy, preferences.extraCash]);

    const handleStrategyChange = (strategy: 'snowball' | 'avalanche' | 'hybrid') => {
        const newPrefs = { ...preferences, strategy };
        savePreferences(newPrefs);
        onPreferencesChange(newPrefs);
    };

    const handleExtraCashChange = (extraCash: number) => {
        const newPrefs = { ...preferences, extraCash };
        savePreferences(newPrefs);
        onPreferencesChange(newPrefs);
    };

    const handleNextMonthPreviewChange = (showNextMonthPreview: boolean) => {
        const newPrefs = { ...preferences, showNextMonthPreview };
        savePreferences(newPrefs);
        onPreferencesChange(newPrefs);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="glass-card rounded-card-lg p-8 shadow-elegant transition-smooth">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Payoff Strategy</h2>

            <div className="space-y-8">
                <div>
                    <label className="block text-sm text-gray-400 mb-4 font-medium tracking-wide">
                        Strategy
                    </label>
                    <div className="flex gap-3">
                        {(['snowball', 'avalanche', 'hybrid'] as const).map((strategy) => (
                            <button
                                key={strategy}
                                onClick={() => handleStrategyChange(strategy)}
                                className={`px-6 py-3 rounded-full text-sm font-semibold transition-smooth ${preferences.strategy === strategy
                                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
                                    : 'glass-card text-slate-300 hover:text-white hover:shadow-elegant'
                                    }`}
                            >
                                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-4 font-medium tracking-wide">
                        Extra Cash per Month: <span className="text-green-400 font-mono font-bold">{formatCurrency(preferences.extraCash)}</span>
                    </label>
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="1500"
                            step="50"
                            value={preferences.extraCash}
                            onChange={(e) => handleExtraCashChange(Number(e.target.value))}
                            className="w-full h-3 bg-gray-800/50 rounded-full appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, rgba(22, 163, 74, 0.6) 0%, rgba(22, 163, 74, 0.6) ${(preferences.extraCash / 1500) * 100}%, rgba(255, 255, 255, 0.1) ${(preferences.extraCash / 1500) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>$0</span>
                        <span>$1,500</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-card glass-card">
                    <input
                        type="checkbox"
                        id="next-month-preview"
                        checked={preferences.showNextMonthPreview}
                        onChange={(e) => handleNextMonthPreviewChange(e.target.checked)}
                        className="w-5 h-5 rounded accent-green-600 cursor-pointer"
                    />
                    <label htmlFor="next-month-preview" className="text-sm text-gray-300 cursor-pointer hover:text-white transition-smooth">
                        Show next month preview in payment schedule
                    </label>
                </div>

                {simulation && (
                    <div className="space-y-4 pt-6 border-t border-gray-700/50">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Months to Zero:</span>
                            <span className="font-mono font-bold text-xl text-white">{simulation.monthsToZero}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">Total Interest:</span>
                            <span className="font-mono font-bold text-xl text-red-400">
                                {formatCurrency(simulation.totalInterest)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-medium">First Payoff:</span>
                            <span className="font-mono font-bold text-xl text-green-400">
                                {simulation.firstPayoffInMonths} months
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

