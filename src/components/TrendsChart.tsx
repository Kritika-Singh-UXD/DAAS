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
  
  // Enhanced sample data with realistic trends
  const trendData = useMemo(() => {
    const now = new Date();
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    
    // Generate sample trend data based on type
    const sampleData = {
      drug: {
        items: ['Adalimumab', 'Bevacizumab', 'Rituximab', 'Trastuzumab', 'Infliximab'],
        patterns: [
          [45, 52, 48, 58, 65, 72, 68, 75, 82, 78, 85, 92], // Adalimumab - growing
          [38, 42, 46, 44, 49, 53, 57, 61, 59, 64, 68, 72], // Bevacizumab - steady growth
          [52, 48, 51, 47, 50, 46, 49, 52, 48, 51, 55, 53], // Rituximab - stable
          [28, 32, 35, 39, 42, 45, 48, 52, 55, 58, 61, 65], // Trastuzumab - rapid growth
          [41, 39, 37, 35, 38, 36, 34, 37, 35, 33, 36, 34], // Infliximab - declining
        ]
      },
      therapeutic: {
        items: ['Oncology', 'Immunology', 'Cardiology', 'Neurology', 'Endocrinology'],
        patterns: [
          [125, 132, 128, 138, 145, 152, 148, 155, 162, 158, 165, 172],
          [98, 102, 106, 104, 109, 113, 117, 121, 119, 124, 128, 132],
          [87, 85, 88, 86, 89, 87, 90, 92, 88, 91, 95, 93],
          [65, 68, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99],
          [54, 52, 55, 53, 56, 54, 57, 59, 56, 58, 61, 59],
        ]
      },
      icd: {
        items: ['C78', 'I25', 'E11', 'G20', 'M06'],
        patterns: [
          [32, 35, 33, 37, 40, 43, 41, 44, 47, 45, 48, 51],
          [28, 26, 29, 27, 30, 28, 31, 33, 30, 32, 35, 33],
          [22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55],
          [18, 19, 17, 20, 18, 21, 19, 22, 20, 23, 21, 24],
          [15, 14, 16, 15, 17, 16, 18, 19, 17, 18, 20, 19],
        ]
      }
    };
    
    const currentData = sampleData[trendType];
    const monthLabels = Array.from({ length: months }, (_, i) => {
      const date = subMonths(now, months - 1 - i);
      return format(date, 'MMM yyyy');
    });
    
    return {
      data: monthLabels.map((month, monthIndex) => {
        const dataPoint: any = { month };
        currentData.items.forEach((item, itemIndex) => {
          const pattern = currentData.patterns[itemIndex];
          const startIndex = Math.max(0, pattern.length - months);
          dataPoint[item] = pattern[startIndex + monthIndex] || 0;
        });
        return dataPoint;
      }),
      items: currentData.items,
      stats: {
        total: currentData.patterns.reduce((sum, pattern) => sum + pattern[pattern.length - 1], 0),
        growth: calculateGrowth(currentData.patterns),
        trending: getTrendingItems(currentData.items, currentData.patterns)
      }
    };
  }, [trendType, timeRange]);
  
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
  
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
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    ? "bg-blue-600 text-white"
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
      <div className="w-full h-80 bg-white">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={trendData.data} 
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
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