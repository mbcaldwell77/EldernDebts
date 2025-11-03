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
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Payoff Strategy</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Strategy
                    </label>
                    <div className="flex gap-2">
                        {(['snowball', 'avalanche', 'hybrid'] as const).map((strategy) => (
                            <button
                                key={strategy}
                                onClick={() => handleStrategyChange(strategy)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${preferences.strategy === strategy
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Extra Cash per Month: {formatCurrency(preferences.extraCash)}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1500"
                        step="50"
                        value={preferences.extraCash}
                        onChange={(e) => handleExtraCashChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$0</span>
                        <span>$1,500</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="next-month-preview"
                        checked={preferences.showNextMonthPreview}
                        onChange={(e) => handleNextMonthPreviewChange(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="next-month-preview" className="text-sm text-gray-400 cursor-pointer">
                        Show next month preview in payment schedule
                    </label>
                </div>

                {simulation && (
                    <div className="space-y-3 pt-4 border-t border-gray-800">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Months to Zero:</span>
                            <span className="font-mono font-semibold">{simulation.monthsToZero}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total Interest:</span>
                            <span className="font-mono font-semibold text-red-400">
                                {formatCurrency(simulation.totalInterest)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">First Payoff:</span>
                            <span className="font-mono font-semibold text-green-400">
                                {simulation.firstPayoffInMonths} months
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

