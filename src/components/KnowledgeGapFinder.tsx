"use client";

import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useFilters } from "@/store/filters";
import { fetchGaps } from "@/lib/api";
import type { GapRow } from "@/lib/types";

const TYPE_COLORS = {
  "Dosing": "#8884d8",
  "Mechanism": "#82ca9d", 
  "Trial": "#ffc658",
  "Safety": "#ff7300",
  "Sequencing": "#8dd1e1"
};

export default function KnowledgeGapFinder() {
  const { filters } = useFilters();
  const [data, setData] = useState<GapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGap, setSelectedGap] = useState<GapRow | null>(null);
  const [sortBy, setSortBy] = useState<"severity" | "volume" | "ctr">("severity");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const gaps = await fetchGaps(filters);
        setData(gaps);
      } catch (error) {
        console.error("Failed to fetch gaps data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters]);

  const getGapSeverity = (gap: GapRow) => gap.volume * (1 - gap.ctr);

  const chartData = data.map(gap => ({
    ...gap,
    x: gap.volume,
    y: gap.ctr,
    severity: getGapSeverity(gap)
  }));

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case "severity":
        return getGapSeverity(b) - getGapSeverity(a);
      case "volume":
        return b.volume - a.volume;
      case "ctr":
        return a.ctr - b.ctr; // Lower CTR = higher priority
      default:
        return 0;
    }
  });

  const handlePointClick = (gap: GapRow) => {
    setSelectedGap(gap);
  };

  const getRelatedKeywords = (topic: string) => {
    const baseKeywords = ["mechanism", "dosing", "side effects", "efficacy", "biomarkers", "resistance"];
    return baseKeywords
      .filter(() => Math.random() > 0.5)
      .slice(0, 3)
      .map(keyword => `${topic.toLowerCase()} ${keyword}`);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading knowledge gaps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Knowledge Gap Finder</h2>
      </div>
      
      {/* Enhanced Knowledge Gap Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Knowledge Gap Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">
              Identify high-volume, low-engagement topics that represent knowledge gaps
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Enhanced Scatter Chart Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 border border-slate-200 rounded-2xl shadow-inner p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Gap Visualization</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Lower-right quadrant indicates high-volume, low-engagement topics (biggest opportunities)
                </p>
                
                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                  <span className="text-xs text-gray-500 mr-2">Gap Types:</span>
                  {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-xs font-medium text-gray-600">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <ScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid 
                        strokeDasharray="2 4" 
                        stroke="#e2e8f0" 
                        strokeOpacity={0.6}
                      />
                      <XAxis 
                        dataKey="x" 
                        name="Volume"
                        type="number"
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      />
                      <YAxis 
                        dataKey="y" 
                        name="CTR"
                        type="number"
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload as GapRow & { severity: number };
                            return (
                              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg max-w-xs">
                                <p className="font-semibold text-gray-900 mb-2">{data.topic}</p>
                                <div className="space-y-1 text-sm">
                                  <p className="text-gray-600">Volume: <span className="font-medium">{data.volume.toLocaleString()}</span></p>
                                  <p className="text-gray-600">CTR: <span className="font-medium">{(data.ctr * 100).toFixed(1)}%</span></p>
                                  <p className="text-gray-600">Severity: <span className="font-medium">{data.severity.toFixed(0)}</span></p>
                                  <p className="text-gray-600">Type: <span className="font-medium">{data.type}</span></p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter dataKey="y">
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={TYPE_COLORS[entry.type]}
                            onClick={() => handlePointClick(entry)}
                            className="cursor-pointer hover:opacity-80"
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSortBy("severity")}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    sortBy === "severity" 
                      ? "bg-orange-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Gap Severity
                </button>
                <button
                  onClick={() => setSortBy("volume")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    sortBy === "volume" 
                      ? "bg-orange-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Volume
                </button>
                <button
                  onClick={() => setSortBy("ctr")}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                    sortBy === "ctr" 
                      ? "bg-orange-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Low CTR
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Layout */}
          <div className="flex gap-6">
            {/* Enhanced Gaps Table */}
            <div className="flex-1">
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl shadow-inner overflow-hidden">
                <div className="px-6 py-4 bg-white/50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Knowledge Gaps</h4>
                  <p className="text-sm text-gray-600 mt-1">Click on any gap for detailed analysis</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/60">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Topic</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Volume</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">CTR</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Severity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Region</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/30 divide-y divide-gray-200/50">
                      {sortedData.map((gap, index) => (
                        <tr 
                          key={index}
                          onClick={() => handlePointClick(gap)}
                          className={`cursor-pointer transition-colors hover:bg-white/50 ${
                            selectedGap === gap ? 'bg-orange-50/70' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{gap.topic}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">
                            {gap.volume.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {(gap.ctr * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">
                            {getGapSeverity(gap).toFixed(0)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: TYPE_COLORS[gap.type] }}
                            >
                              {gap.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{gap.region}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Enhanced Side Panel */}
            {selectedGap && (
              <div className="w-80 bg-gradient-to-br from-slate-50 to-orange-50 border border-gray-200 rounded-2xl shadow-inner p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Gap Details</h4>
                  <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Topic</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedGap.topic}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                    <div className="mt-1">
                      <span 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: TYPE_COLORS[selectedGap.type] }}
                      >
                        {selectedGap.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialty</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedGap.specialty}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Region</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedGap.region}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Action</label>
                    <p className="text-sm text-gray-900 mt-1 leading-relaxed">{selectedGap.suggestedAction}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Related Keywords</label>
                    <div className="space-y-1">
                      {getRelatedKeywords(selectedGap.topic).map((keyword, index) => (
                        <div key={index} className="inline-flex items-center px-2 py-1 bg-white/60 rounded-md text-xs font-medium text-gray-700 mr-2 mb-1">
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}