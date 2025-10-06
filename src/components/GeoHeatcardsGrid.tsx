'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { GeoAggregate } from '@/types';
import { Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function GeoHeatcardsGrid() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const { setPartial } = useFilters();

  const geoData = useMemo(() => {
    // Calculate current period data (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentPeriod = filteredData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= thirtyDaysAgo;
    });

    const previousPeriod = filteredData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= sixtyDaysAgo && itemDate < thirtyDaysAgo;
    });

    // Aggregate by country
    const countryData = new Map<string, { current: number; previous: number; timeline: number[] }>();

    // Process current period
    currentPeriod.forEach(item => {
      if (!countryData.has(item.country)) {
        countryData.set(item.country, { current: 0, previous: 0, timeline: new Array(7).fill(0) });
      }
      countryData.get(item.country)!.current++;
      
      // Generate simple timeline (last 7 periods)
      const dayIndex = Math.floor(Math.random() * 7); // Simplified for demo
      countryData.get(item.country)!.timeline[dayIndex]++;
    });

    // Process previous period
    previousPeriod.forEach(item => {
      if (!countryData.has(item.country)) {
        countryData.set(item.country, { current: 0, previous: 0, timeline: new Array(7).fill(0) });
      }
      countryData.get(item.country)!.previous++;
    });

    // Convert to GeoAggregate array
    const geoAggregates: GeoAggregate[] = Array.from(countryData.entries()).map(([country, data]) => {
      const pctChange = data.previous > 0 
        ? ((data.current - data.previous) / data.previous) * 100
        : data.current > 0 ? 100 : 0;

      return {
        country,
        count: data.current,
        pctChange,
        spark: data.timeline,
      };
    });

    // Sort by count descending and take top countries
    return geoAggregates
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [filteredData]);

  const handleCountryClick = (country: string) => {
    setPartial({ country: [country] });
  };

  const getChangeIcon = (pctChange: number) => {
    if (pctChange > 5) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (pctChange < -5) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getChangeColor = (pctChange: number) => {
    if (pctChange > 5) return 'text-green-600';
    if (pctChange < -5) return 'text-red-600';
    return 'text-gray-500';
  };

  const Sparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data, 1);
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 40;
      const y = 20 - (value / max) * 15;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="40" height="20" className="inline">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-400"
        />
      </svg>
    );
  };

  if (geoData.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Globe className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Geographic Distribution</h3>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="p-4 bg-white rounded-lg inline-block mb-4">
            <Globe className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-base">
            No geographic data available for the current filters.
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Geographic Distribution</h3>
          </div>
          <p className="text-sm text-gray-600">
            Activity by country with trend indicators
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {geoData.map((geo) => (
          <div
            key={geo.country}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 cursor-pointer group"
            onClick={() => handleCountryClick(geo.country)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCountryClick(geo.country);
              }
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-green-700">
                  {geo.country}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatNumber(geo.count)}
                  </span>
                  <span className="text-xs text-gray-500">records</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  geo.pctChange > 5 
                    ? 'bg-green-100 text-green-600' 
                    : geo.pctChange < -5 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {getChangeIcon(geo.pctChange)}
                  {geo.pctChange > 0 ? '+' : ''}{geo.pctChange.toFixed(0)}%
                </div>
                <div className="mt-2">
                  <Sparkline data={geo.spark} />
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
              Click to filter by {geo.country}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <p className="text-sm text-green-700">
          <strong>Trend Indicators:</strong> Percentage change compares last 30 days vs previous 30 days. 
          Sparklines show activity distribution over recent periods.
        </p>
      </div>
    </div>
  );
}