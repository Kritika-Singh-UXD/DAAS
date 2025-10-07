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
    const intensity = Math.floor(engagement * 255);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  };

  const chartData = data
    .filter(topic => selectedTopics.includes(topic.topic))
    .map(topic => ({
      topic: topic.topic.length > 15 ? topic.topic.substring(0, 15) + "..." : topic.topic,
      engagement: topic.engagement,
      searchVolume: topic.searchVolume
    }));

  if (loading) {
    return <div style={{ padding: 20 }}>Loading therapeutic data...</div>;
  }

  return (
    <div>
      <h2>Therapeutic Explorer</h2>
      
      {/* Heatmap Grid */}
      <div style={{ marginBottom: 24 }}>
        <h3>Topic Engagement Heatmap</h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: 8,
          marginBottom: 16
        }}>
          {data.map(topic => (
            <div
              key={topic.topic}
              style={{
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 4,
                backgroundColor: getHeatmapColor(topic.engagement),
                cursor: "pointer",
                textAlign: "center",
                fontSize: 12,
                minHeight: 80,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}
              onClick={() => handleTopicToggle(topic.topic)}
              title={`${topic.topic}\nEngagement: ${(topic.engagement * 100).toFixed(1)}%\nVolume: ${topic.searchVolume}\nTop Specialty: ${topic.topSpecialty}`}
            >
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                {topic.topic}
              </div>
              <div style={{ fontSize: 10 }}>
                {(topic.engagement * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 10 }}>
                {topic.searchVolume} searches
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Selection */}
      <div style={{ marginBottom: 16 }}>
        <h4>Compare Topics (select multiple):</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.map(topic => (
            <label key={topic.topic} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={selectedTopics.includes(topic.topic)}
                onChange={() => handleTopicToggle(topic.topic)}
              />
              <span style={{ fontSize: 14 }}>{topic.topic}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Engagement Chart */}
      <div style={{ marginBottom: 24 }}>
        <h3>Topic Engagement Comparison</h3>
        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === "engagement" ? `${(value * 100).toFixed(1)}%` : value?.toLocaleString(),
                  name === "engagement" ? "Engagement" : "Search Volume"
                ]}
              />
              <Bar dataKey="engagement" fill="#8884d8" name="engagement" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}