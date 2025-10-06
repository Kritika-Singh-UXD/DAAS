'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { SignalCard } from '@/types';
import { TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function EmergingSignals() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const { setPartial } = useFilters();

  const signals = useMemo(() => {
    // Generate emerging signals based on recent activity
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get data for last 30 days and previous 30 days
    const last30Days = filteredData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= thirtyDaysAgo && itemDate <= now;
    });

    const previous30Days = filteredData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= sixtyDaysAgo && itemDate < thirtyDaysAgo;
    });

    // Calculate signals for drugs
    const drugSignals = new Map<string, { current: number; previous: number; contexts: Set<string> }>();
    
    last30Days.forEach(item => {
      item.drugNames.forEach(drug => {
        if (!drugSignals.has(drug)) {
          drugSignals.set(drug, { current: 0, previous: 0, contexts: new Set() });
        }
        const signal = drugSignals.get(drug)!;
        signal.current++;
        signal.contexts.add(`${item.therapeuticAreas[0] || 'Unknown'} · ${item.country}`);
      });
    });

    previous30Days.forEach(item => {
      item.drugNames.forEach(drug => {
        if (!drugSignals.has(drug)) {
          drugSignals.set(drug, { current: 0, previous: 0, contexts: new Set() });
        }
        drugSignals.get(drug)!.previous++;
      });
    });

    // Calculate signals for therapeutic areas
    const taSignals = new Map<string, { current: number; previous: number; contexts: Set<string> }>();
    
    last30Days.forEach(item => {
      item.therapeuticAreas.forEach(ta => {
        if (!taSignals.has(ta)) {
          taSignals.set(ta, { current: 0, previous: 0, contexts: new Set() });
        }
        const signal = taSignals.get(ta)!;
        signal.current++;
        signal.contexts.add(`${item.specialty} · ${item.country}`);
      });
    });

    previous30Days.forEach(item => {
      item.therapeuticAreas.forEach(ta => {
        if (!taSignals.has(ta)) {
          taSignals.set(ta, { current: 0, previous: 0, contexts: new Set() });
        }
        taSignals.get(ta)!.previous++;
      });
    });

    // Generate signal cards
    const allSignals: SignalCard[] = [];

    // Drug signals
    drugSignals.forEach((data, drug) => {
      const pctChange = data.previous > 0 
        ? ((data.current - data.previous) / data.previous) * 100
        : data.current > 0 ? 100 : 0;

      if (pctChange > 20 && data.current >= 3) { // Only show significant increases
        allSignals.push({
          id: `drug-${drug}`,
          title: drug,
          context: Array.from(data.contexts).slice(0, 2).join(', '),
          pctChange,
          apply: { drug: [drug] },
        });
      }
    });

    // Therapeutic area signals
    taSignals.forEach((data, ta) => {
      const pctChange = data.previous > 0 
        ? ((data.current - data.previous) / data.previous) * 100
        : data.current > 0 ? 100 : 0;

      if (pctChange > 20 && data.current >= 5) { // Only show significant increases
        allSignals.push({
          id: `ta-${ta}`,
          title: ta,
          context: Array.from(data.contexts).slice(0, 2).join(', '),
          pctChange,
          apply: { therapeuticArea: [ta] },
        });
      }
    });

    // Sort by percentage change and take top 6
    return allSignals
      .sort((a, b) => b.pctChange - a.pctChange)
      .slice(0, 6);
  }, [filteredData]);

  const handleExploreSignal = (signal: SignalCard) => {
    setPartial(signal.apply);
    
    // Scroll to trends section
    setTimeout(() => {
      const trendsElement = document.querySelector('[data-section="trends"]');
      if (trendsElement) {
        trendsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (signals.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Emerging Signals</h3>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="p-4 bg-white rounded-lg inline-block mb-4">
            <Zap className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-base mb-2">
            No significant emerging signals detected in the current filtered dataset.
          </p>
          <p className="text-gray-500 text-sm">
            Signals are generated based on 30-day activity spikes compared to previous periods.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Emerging Signals</h3>
          </div>
          <p className="text-sm text-gray-600">
            Trending topics based on recent activity spikes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signals.map((signal) => (
          <div
            key={signal.id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-purple-700">
                  {signal.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {signal.context}
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                +{signal.pctChange.toFixed(0)}%
              </div>
            </div>
            
            <button
              onClick={() => handleExploreSignal(signal)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors group-hover:bg-purple-600 group-hover:text-white"
            >
              Explore this signal
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <p className="text-sm text-purple-700">
          <strong>Methodology:</strong> Signals are identified by comparing activity in the last 30 days 
          vs. the previous 30 days. Only items with significant increases (&gt;20%) and minimum 
          activity thresholds are shown.
        </p>
      </div>
    </div>
  );
}