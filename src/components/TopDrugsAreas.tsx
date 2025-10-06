'use client';

import { useMemo, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { Pill, Activity, BarChart3, PieChart } from 'lucide-react';

export default function TopDrugsAreas() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const [view, setView] = useState<'drugs' | 'therapeutic'>('drugs');
  const [showPercentage, setShowPercentage] = useState(false);
  
  const chartData = useMemo(() => {
    const counts = new Map<string, number>();
    
    if (view === 'drugs') {
      filteredData.forEach(item => {
        item.drugNames.forEach(drug => {
          counts.set(drug, (counts.get(drug) || 0) + 1);
        });
      });
    } else {
      filteredData.forEach(item => {
        item.therapeuticAreas.forEach(area => {
          counts.set(area, (counts.get(area) || 0) + 1);
        });
      });
    }
    
    const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(counts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        count,
        percentage: (count / total) * 100,
        displayValue: showPercentage ? formatPercentage(count, total) : count
      }));
  }, [filteredData, view, showPercentage]);
  
  const colors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#8B5A2B'
  ];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-sm text-gray-900">{payload[0].payload.fullName}</p>
          <p className="text-sm text-gray-600">
            Count: {formatNumber(payload[0].payload.count)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Pill className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Top {view === 'drugs' ? 'Drugs' : 'Therapeutic Areas'}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Most frequently mentioned in Q&A pairs
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPercentage(!showPercentage)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showPercentage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            {showPercentage ? <PieChart className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
            {showPercentage ? 'Percentage' : 'Count'}
          </button>
          
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setView('drugs')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                view === 'drugs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Pill className="h-4 w-4" />
              Drugs
            </button>
            <button
              onClick={() => setView('therapeutic')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                view === 'therapeutic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Activity className="h-4 w-4" />
              Therapeutic
            </button>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={showPercentage ? 'percentage' : 'count'} radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-medium text-blue-700 mb-2">Total Unique {view === 'drugs' ? 'Drugs' : 'Areas'}</p>
          <p className="text-2xl font-bold text-blue-900">
            {view === 'drugs' 
              ? new Set(filteredData.flatMap(d => d.drugNames)).size
              : new Set(filteredData.flatMap(d => d.therapeuticAreas)).size
            }
          </p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-medium text-green-700 mb-2">Average per Q&A</p>
          <p className="text-2xl font-bold text-green-900">
            {view === 'drugs'
              ? (filteredData.reduce((sum, d) => sum + d.drugCount, 0) / filteredData.length).toFixed(1)
              : (filteredData.reduce((sum, d) => sum + d.therapeuticAreas.length, 0) / filteredData.length).toFixed(1)
            }
          </p>
        </div>
      </div>
    </div>
  );
}