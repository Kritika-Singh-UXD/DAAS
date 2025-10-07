'use client';

import { useMemo, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, subMonths } from 'date-fns';
type TrendType = 'therapeutic' | 'drug' | 'icd';

// Helper functions
const calculateGrowth = (patterns: number[][]) => {
  let totalGrowth = 0;
  patterns.forEach(pattern => {
    if (pattern.length > 1) {
      const start = pattern[pattern.length - 2];
      const end = pattern[pattern.length - 1];
      if (start > 0) {
        totalGrowth += ((end - start) / start) * 100;
      }
    }
  });
  return totalGrowth / patterns.length;
};

const getTrendingItems = (items: string[], patterns: number[][]) => {
  return items.map((item, index) => {
    const pattern = patterns[index];
    const recent = pattern.slice(-3);
    const growth = recent.length > 1 ? 
      ((recent[recent.length - 1] - recent[0]) / recent[0]) * 100 : 0;
    return { item, growth };
  }).sort((a, b) => b.growth - a.growth);
};

export default function TrendsChart() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const [trendType, setTrendType] = useState<TrendType>('drug');
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m');
  
  // Generate trend data from filtered data
  const trendData = useMemo(() => {
    const now = new Date();
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    
    // Group filtered data by the selected trend type
    const grouped: { [key: string]: any[] } = {};
    
    filteredData.forEach(item => {
      let key: string;
      switch (trendType) {
        case 'drug':
          item.drugNames.forEach(drug => {
            if (!grouped[drug]) grouped[drug] = [];
            grouped[drug].push(item);
          });
          break;
        case 'therapeutic':
          item.therapeuticAreas.forEach(area => {
            if (!grouped[area]) grouped[area] = [];
            grouped[area].push(item);
          });
          break;
        case 'icd':
          if (item.icdCodes) {
            item.icdCodes.forEach(code => {
              if (!grouped[code]) grouped[code] = [];
              grouped[code].push(item);
            });
          }
          break;
      }
    });
    
    // Get top 5 items by data volume
    const sortedItems = Object.entries(grouped)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5)
      .map(([key]) => key);
    
    // Generate month labels
    const monthLabels = Array.from({ length: months }, (_, i) => {
      const date = subMonths(now, months - 1 - i);
      return format(date, 'MMM yyyy');
    });
    
    // Generate patterns for each item
    const patterns: number[][] = [];
    const chartData = monthLabels.map((monthLabel, monthIndex) => {
      const date = subMonths(now, months - 1 - monthIndex);
      const monthStart = startOfMonth(date);
      const nextMonthStart = startOfMonth(subMonths(date, -1));
      
      const dataPoint: any = { month: monthLabel };
      
      sortedItems.forEach((item, itemIndex) => {
        const itemData = grouped[item] || [];
        const monthCount = itemData.filter(d => {
          const itemDate = new Date(d.timestamp);
          return itemDate >= monthStart && itemDate < nextMonthStart;
        }).length;
        
        dataPoint[item] = monthCount;
        
        // Initialize pattern array if not exists
        if (!patterns[itemIndex]) patterns[itemIndex] = [];
        patterns[itemIndex][monthIndex] = monthCount;
      });
      
      return dataPoint;
    });
    
    // Calculate stats
    const totalCurrent = sortedItems.reduce((sum, item) => {
      const itemData = grouped[item] || [];
      return sum + itemData.length;
    }, 0);
    
    const growth = patterns.length > 0 ? calculateGrowth(patterns) : 0;
    const trending = patterns.length > 0 ? getTrendingItems(sortedItems, patterns) : [];
    
    return {
      data: chartData,
      items: sortedItems,
      stats: {
        total: totalCurrent,
        growth,
        trending
      }
    };
  }, [filteredData, trendType, timeRange]);
  
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  
  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Trends Over Time</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>Total: {trendData.stats.total.toLocaleString()}</span>
            <span className={cn(
              "flex items-center gap-1",
              trendData.stats.growth >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {trendData.stats.growth >= 0 ? '↗' : '↘'} {trendData.stats.growth.toFixed(1)}%
            </span>
            <span>Top: {trendData.stats.trending[0]?.item}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={trendType}
            onChange={(e) => setTrendType(e.target.value as TrendType)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="drug">Drugs</option>
            <option value="therapeutic">Therapeutic Areas</option>
            <option value="icd">ICD Categories</option>
          </select>
          <div className="flex border border-gray-300 rounded-md">
            {(['3m', '6m', '12m'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-2 py-1.5 text-xs",
                  timeRange === range
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-50",
                  range === '3m' ? 'rounded-l-md' : range === '12m' ? 'rounded-r-md' : ''
                )}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="w-full h-80 bg-white px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={trendData.data} 
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#E6EDF5" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '12px 16px'
              }}
              cursor={{ stroke: '#C2D4E6', strokeWidth: 1 }}
            />
            {trendData.items.map((item, index) => (
              <Line
                key={item}
                type="monotone"
                dataKey={item}
                stroke={colors[index]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: colors[index] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Trending Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-5 gap-3 text-sm">
          {trendData.stats.trending.map((item, index) => (
            <div key={item.item} className="flex items-center gap-2 min-w-0">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="truncate text-gray-700">{item.item}</span>
              <span className={cn(
                "text-xs font-medium flex-shrink-0",
                item.growth >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}