'use client';

import { useMemo, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth } from 'date-fns';
import { TrendingUp, Calendar, Percent } from 'lucide-react';

type TrendType = 'therapeutic' | 'drug' | 'icd';

export default function TrendsChart() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const [trendType, setTrendType] = useState<TrendType>('drug');
  const [showGrowthRate, setShowGrowthRate] = useState(false);
  
  const trendData = useMemo(() => {
    // Group data by month
    const monthlyData = new Map<string, Map<string, number>>();
    
    filteredData.forEach(item => {
      const month = format(startOfMonth(new Date(item.timestamp)), 'yyyy-MM');
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, new Map());
      }
      
      const monthMap = monthlyData.get(month)!;
      
      if (trendType === 'therapeutic') {
        item.therapeuticAreas.forEach(area => {
          monthMap.set(area, (monthMap.get(area) || 0) + 1);
        });
      } else if (trendType === 'drug') {
        item.drugNames.forEach(drug => {
          monthMap.set(drug, (monthMap.get(drug) || 0) + 1);
        });
      } else if (trendType === 'icd') {
        const icdCategory = item.icd10Code.substring(0, 3);
        monthMap.set(icdCategory, (monthMap.get(icdCategory) || 0) + 1);
      }
    });
    
    // Get top 5 items across all months
    const allItems = new Map<string, number>();
    monthlyData.forEach(monthMap => {
      monthMap.forEach((count, item) => {
        allItems.set(item, (allItems.get(item) || 0) + count);
      });
    });
    
    const topItems = Array.from(allItems.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([item]) => item);
    
    // Format data for chart
    const chartData = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, items]) => {
        const dataPoint: any = { month: format(new Date(month + '-01'), 'MMM yyyy') };
        topItems.forEach(item => {
          dataPoint[item] = items.get(item) || 0;
        });
        return dataPoint;
      });
    
    // Calculate growth rates if needed
    if (showGrowthRate && chartData.length > 1) {
      for (let i = 1; i < chartData.length; i++) {
        topItems.forEach(item => {
          const current = chartData[i][item] || 0;
          const previous = chartData[i - 1][item] || 0;
          if (previous > 0) {
            chartData[i][`${item}_growth`] = ((current - previous) / previous * 100).toFixed(1);
          }
        });
      }
    }
    
    return { data: chartData, items: topItems };
  }, [filteredData, trendType, showGrowthRate]);
  
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Trends Over Time</h3>
          <p className="text-sm text-gray-600 mt-1">Track mentions and activity patterns</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGrowthRate(!showGrowthRate)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
              showGrowthRate
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            )}
          >
            <Percent className="h-4 w-4" />
            Growth Rate
          </button>
          
          <select
            value={trendType}
            onChange={(e) => setTrendType(e.target.value as TrendType)}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="drug">Top Drugs</option>
            <option value="therapeutic">Therapeutic Areas</option>
            <option value="icd">ICD Categories</option>
          </select>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#374151',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: '#374151' }}
            iconType="line"
          />
          {trendData.items.map((item, index) => (
            <Line
              key={item}
              type="monotone"
              dataKey={item}
              stroke={colors[index]}
              strokeWidth={2}
              dot={{ r: 3, fill: colors[index], stroke: colors[index] }}
              activeDot={{ r: 5, fill: colors[index], stroke: 'white', strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {showGrowthRate && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Growth Rate Analysis</p>
          </div>
          <p className="text-sm text-blue-700">
            Percentage change shown relative to previous month. Positive growth indicates increased mentions.
          </p>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}