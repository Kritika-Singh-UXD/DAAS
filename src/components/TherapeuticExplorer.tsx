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
      
      {/* Unified Engagement Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Topic Engagement Analysis</h3>
          
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-gray-600">Engagement Level:</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded"></div>
              <span className="text-gray-500">Low</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
              <span className="text-gray-500">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded"></div>
              <span className="text-gray-500">High</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
          {data.map(topic => (
            <div
              key={topic.topic}
              className={`
                p-4 border border-gray-200 rounded-lg cursor-pointer text-white
                bg-gradient-to-br ${getHeatmapColor(topic.engagement)}
                transition-all duration-200 hover:shadow-md
                ${selectedTopics.includes(topic.topic) ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => handleTopicToggle(topic.topic)}
            >
              <div className="font-medium text-sm mb-2 line-clamp-2">
                {topic.topic}
              </div>
              
              <div className="text-lg font-bold mb-1">
                {(topic.engagement * 100).toFixed(1)}%
              </div>
              
              <div className="text-xs opacity-90">
                {topic.searchVolume.toLocaleString()} searches
              </div>
            </div>
          ))}
        </div>

        {/* Selected Topics Section */}
        {selectedTopics.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-blue-900">Selected Topics ({selectedTopics.length})</h4>
              <button
                onClick={() => setSelectedTopics([])}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map(topic => {
                const topicData = data.find(t => t.topic === topic);
                return (
                  <div
                    key={topic}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm"
                  >
                    <span className="font-medium text-blue-900">{topic}</span>
                    <span className="text-blue-600">
                      {topicData ? (topicData.engagement * 100).toFixed(1) : 0}%
                    </span>
                    <button
                      onClick={() => handleTopicToggle(topic)}
                      className="ml-1 text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Chart */}
        {selectedTopics.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Engagement Comparison</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="topic" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === "engagement" ? `${(value * 100).toFixed(1)}%` : value?.toLocaleString(),
                      name === "engagement" ? "Engagement" : "Search Volume"
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="engagement" 
                    fill="#3b82f6" 
                    name="engagement"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTopics(data.sort((a, b) => b.engagement - a.engagement).slice(0, 3).map(t => t.topic))}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 border border-yellow-500 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Top 3
            </button>
            <button
              onClick={() => setSelectedTopics(data.sort((a, b) => b.engagement - a.engagement).slice(0, 5).map(t => t.topic))}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
              Top 5
            </button>
            <button
              onClick={() => setSelectedTopics(data.map(t => t.topic))}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              All ({data.length})
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${selectedTopics.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="font-medium text-gray-600">
              {selectedTopics.length} selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}