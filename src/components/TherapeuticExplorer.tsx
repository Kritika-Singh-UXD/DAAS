"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFilters } from "@/store/filters";
import { fetchTherapeutic } from "@/lib/api";
import type { TherapeuticTopic } from "@/lib/types";

export default function TherapeuticExplorer() {
  const { filters } = useFilters();
  const [data, setData] = useState<TherapeuticTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const topics = await fetchTherapeutic(filters);
        setData(topics);
        setSelectedTopics(topics.slice(0, 5).map(t => t.topic));
      } catch (error) {
        console.error("Failed to fetch therapeutic data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const getHeatmapColor = (engagement: number) => {
    const intensity = engagement;
    if (intensity >= 0.8) return 'from-blue-600 to-blue-700 text-white';
    if (intensity >= 0.6) return 'from-blue-500 to-blue-600 text-white';
    if (intensity >= 0.4) return 'from-blue-400 to-blue-500 text-white';
    if (intensity >= 0.2) return 'from-blue-300 to-blue-400 text-gray-800';
    return 'from-blue-100 to-blue-200 text-gray-700';
  };

  const getIntensityLabel = (engagement: number) => {
    if (engagement >= 0.8) return 'Very High';
    if (engagement >= 0.6) return 'High';
    if (engagement >= 0.4) return 'Medium';
    if (engagement >= 0.2) return 'Low';
    return 'Very Low';
  };

  const chartData = data
    .filter(topic => selectedTopics.includes(topic.topic))
    .map(topic => ({
      topic: topic.topic.length > 15 ? topic.topic.substring(0, 15) + "..." : topic.topic,
      engagement: topic.engagement,
      searchVolume: topic.searchVolume
    }));

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading therapeutic data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Therapeutic Explorer</h2>
      </div>
      
      {/* Minimal Engagement Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Clean Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Topic Engagement Analysis</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedTopics.length === 0 
                  ? "Click topics below to compare their engagement levels" 
                  : `Comparing ${selectedTopics.length} selected topics`
                }
              </p>
            </div>
            {selectedTopics.length > 0 && (
              <button
                onClick={() => setSelectedTopics([])}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
          {/* Quick Selection Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm font-medium text-gray-700">Quick select:</span>
            <button
              onClick={() => setSelectedTopics(data.sort((a, b) => b.engagement - a.engagement).slice(0, 5).map(t => t.topic))}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Top 5
            </button>
            <button
              onClick={() => setSelectedTopics(data.map(t => t.topic))}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              All ({data.length})
            </button>
            
            {/* Legend moved inline */}
            <div className="flex items-center space-x-3 text-xs ml-auto">
              <span className="text-gray-600">Engagement:</span>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full"></div>
                <span className="text-gray-500">Low</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                <span className="text-gray-500">High</span>
              </div>
            </div>
          </div>

          {/* Improved Heatmap Grid with better visual hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-8">
            {data.map(topic => (
              <div
                key={topic.topic}
                className={`
                  group relative p-4 rounded-lg cursor-pointer transition-all duration-200 ease-out
                  ${selectedTopics.includes(topic.topic) 
                    ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300 ring-offset-2' 
                    : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300 hover:shadow-md'
                  }
                  active:scale-95
                `}
                onClick={() => handleTopicToggle(topic.topic)}
              >
                {selectedTopics.includes(topic.topic) && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    ✓
                  </div>
                )}
                
                {/* Topic title with fixed typography */}
                <div className="mb-4">
                  <h4 className={`font-medium text-sm leading-relaxed line-clamp-3 break-words ${
                    selectedTopics.includes(topic.topic) ? 'text-white' : 'text-gray-900'
                  }`}>
                    {topic.topic}
                  </h4>
                </div>
                
                {/* Engagement percentage with clean layout */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <div className={`text-xl font-bold tracking-tight ${
                      selectedTopics.includes(topic.topic) ? 'text-white' : 'text-blue-600'
                    }`}>
                      {(topic.engagement * 100).toFixed(1)}%
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-md ${
                      selectedTopics.includes(topic.topic) 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getIntensityLabel(topic.engagement)}
                    </div>
                  </div>
                </div>
                
                {/* Search volume with clean design */}
                <div className={`flex items-center text-xs font-medium ${
                  selectedTopics.includes(topic.topic) ? 'text-white' : 'text-gray-500'
                }`}>
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span>{topic.searchVolume.toLocaleString()}</span>
                </div>
                
              </div>
            ))}
          </div>

          {/* Clean Chart Section */}
          <div className={`transition-all duration-700 ease-in-out ${
            selectedTopics.length > 0 
              ? 'max-h-[500px] opacity-100 mb-0' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}>
            {selectedTopics.length > 0 && (
              <div className="relative p-6 bg-gray-50 border border-gray-200 rounded-lg">
                {/* Clean Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Engagement Comparison
                    </h4>
                    <p className="text-sm text-gray-500">
                      Analyzing {selectedTopics.length} selected topic{selectedTopics.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 bg-white px-3 py-1.5 rounded-md border border-gray-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Engagement Level
                  </div>
                </div>
                
                {/* Clean Chart container */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart 
                        data={chartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid 
                          strokeDasharray="2 4" 
                          stroke="#e2e8f0" 
                          strokeOpacity={0.6}
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="topic" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          tickLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          tickLine={{ stroke: '#cbd5e1' }}
                          domain={[0, 'dataMax']}
                        />
                        <Tooltip 
                          formatter={(value: any, name: string) => [
                            name === "engagement" ? `${(value * 100).toFixed(1)}%` : value?.toLocaleString(),
                            name === "engagement" ? "Engagement Level" : "Search Volume"
                          ]}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Bar 
                          dataKey="engagement" 
                          fill="url(#enhancedBlueGradient)"
                          name="engagement"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={60}
                        />
                        <defs>
                          <linearGradient id="enhancedBlueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#1e40af" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Quick insights */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>
                      Highest: {Math.max(...chartData.map(d => d.engagement * 100)).toFixed(1)}%
                    </span>
                    <span>
                      Average: {(chartData.reduce((sum, d) => sum + d.engagement, 0) / chartData.length * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Hover bars for detailed metrics
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