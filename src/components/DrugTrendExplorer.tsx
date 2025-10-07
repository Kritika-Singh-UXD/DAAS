"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFilters } from "@/store/filters";
import { fetchDrugTrends } from "@/lib/api";
import type { DrugTrendRow } from "@/lib/types";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1", "#d084d0"];

export default function DrugTrendExplorer() {
  const { filters } = useFilters();
  const [data, setData] = useState<DrugTrendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"volume" | "ctr">("volume");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const trends = await fetchDrugTrends(filters);
        setData(trends);
        setSelectedDrugs(trends.slice(0, 3).map(d => d.drug));
      } catch (error) {
        console.error("Failed to fetch drug trends:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters]);

  const handleDrugToggle = (drug: string) => {
    setSelectedDrugs(prev => 
      prev.includes(drug) 
        ? prev.filter(d => d !== drug)
        : [...prev, drug]
    );
  };

  const getChartData = () => {
    if (data.length === 0 || selectedDrugs.length === 0) return [];

    const selectedData = data.filter(d => selectedDrugs.includes(d.drug));
    
    const allDates = new Set<string>();
    selectedData.forEach(drug => {
      drug.series.forEach(point => allDates.add(point.date));
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map(date => {
      const point: any = { date };
      selectedData.forEach(drug => {
        const seriesPoint = drug.series.find(p => p.date === date);
        if (viewMode === "volume") {
          point[drug.drug] = seriesPoint?.volume || 0;
        } else {
          point[drug.drug] = seriesPoint ? drug.ctr : 0;
        }
      });
      return point;
    });
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading drug trends...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Drug Trend Explorer</h2>
      </div>
      
      {/* Enhanced Drug Trend Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header with guidance */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Drug Trend Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDrugs.length === 0 
                  ? "Select drugs below to analyze their trends over time" 
                  : `Tracking ${selectedDrugs.length} selected drug${selectedDrugs.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            {selectedDrugs.length > 0 && (
              <button
                onClick={() => setSelectedDrugs([])}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
                Clear Selection
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">View mode:</span>
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50">
                <button
                  onClick={() => setViewMode("volume")}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    viewMode === "volume" 
                      ? "bg-blue-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Search Volume
                </button>
                <button
                  onClick={() => setViewMode("ctr")}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    viewMode === "ctr" 
                      ? "bg-blue-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Click-Through Rate
                </button>
              </div>
            </div>

            {/* Quick Selection Actions */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quick select:</span>
              <button
                onClick={() => setSelectedDrugs(data.slice(0, 3).map(d => d.drug))}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                Top 3
              </button>
              <button
                onClick={() => setSelectedDrugs(data.map(d => d.drug))}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                All ({data.length})
              </button>
            </div>
          </div>

          {/* Drug Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 mb-8">
            {data.map((drug, index) => (
              <div
                key={drug.drug}
                className={`
                  relative p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out
                  bg-gradient-to-br from-emerald-400 to-teal-500 text-white
                  hover:shadow-lg hover:-translate-y-0.5
                  ${selectedDrugs.includes(drug.drug) 
                    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white shadow-lg' 
                    : 'shadow-sm hover:shadow-md'
                  }
                  active:scale-95
                `}
                onClick={() => handleDrugToggle(drug.drug)}
              >
                {selectedDrugs.includes(drug.drug) && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    ✓
                  </div>
                )}
                
                <div className="mb-3">
                  <h4 className="font-medium text-sm leading-relaxed text-white line-clamp-2 break-words">
                    {drug.drug}
                  </h4>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold tracking-tight text-white">
                      {(drug.ctr * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs font-medium bg-black/10 text-white px-2 py-1 rounded-md">
                      CTR
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-xs font-medium text-white">
                  <svg className="w-3.5 h-3.5 mr-1.5 opacity-80 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{drug.totalQueries.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Chart Section */}
          <div className={`transition-all duration-700 ease-in-out ${
            selectedDrugs.length > 0 
              ? 'max-h-[500px] opacity-100 mb-8' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            {selectedDrugs.length > 0 && (
              <div className="relative p-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 border border-slate-200 rounded-2xl shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {viewMode === "volume" ? "Search Volume Trends" : "Click-Through Rate Trends"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Analyzing {selectedDrugs.length} selected drug{selectedDrugs.length !== 1 ? 's' : ''} over time
                    </p>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 bg-white/50 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    {viewMode === "volume" ? "Search Volume" : "CTR Percentage"}
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
                  <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid 
                          strokeDasharray="2 4" 
                          stroke="#e2e8f0" 
                          strokeOpacity={0.6}
                        />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                        />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                          formatter={(value: any, name: string) => [
                            viewMode === "volume" ? value?.toLocaleString() : `${(value * 100).toFixed(1)}%`,
                            name
                          ]}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        />
                        {selectedDrugs.map((drug, index) => (
                          <Line
                            key={drug}
                            type="monotone"
                            dataKey={drug}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Data Table */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl shadow-inner overflow-hidden">
            <div className="px-6 py-4 bg-white/50 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Drug Performance Summary</h4>
              <p className="text-sm text-gray-600 mt-1">Comprehensive metrics for all available drugs</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Drug</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Queries</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">CTR</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Session</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Top Region</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Top Specialty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Co-searched Terms</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/50">
                  {data.map((drug, index) => (
                    <tr key={drug.drug} className="hover:bg-white/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {drug.drug}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">
                        {drug.totalQueries.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {(drug.ctr * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {Math.floor(drug.avgSessionTimeSec / 60)}m {drug.avgSessionTimeSec % 60}s
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {drug.topRegion}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {drug.topSpecialty}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xs truncate" title={drug.coSearched.join(", ")}>
                          {drug.coSearched.join(", ")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}