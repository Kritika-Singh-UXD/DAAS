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
    return <div style={{ padding: 20 }}>Loading knowledge gaps...</div>;
  }

  return (
    <div>
      <h2>Knowledge Gap Finder</h2>
      
      {/* Gap Scatter Chart */}
      <div style={{ marginBottom: 24 }}>
        <h3>Gap Analysis (Volume vs CTR)</h3>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          Lower-right quadrant indicates high-volume, low-engagement topics (biggest gaps)
        </p>
        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                name="Volume"
                type="number"
              />
              <YAxis 
                dataKey="y" 
                name="CTR"
                type="number"
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === "y" ? `${(value * 100).toFixed(1)}%` : value?.toLocaleString(),
                  name === "y" ? "CTR" : "Volume"
                ]}
                labelFormatter={() => ""}
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload as GapRow & { severity: number };
                    return (
                      <div style={{ 
                        backgroundColor: "white", 
                        padding: 12, 
                        border: "1px solid #ddd", 
                        borderRadius: 4,
                        maxWidth: 200
                      }}>
                        <p style={{ fontWeight: "bold", margin: 0 }}>{data.topic}</p>
                        <p style={{ margin: "4px 0" }}>Volume: {data.volume.toLocaleString()}</p>
                        <p style={{ margin: "4px 0" }}>CTR: {(data.ctr * 100).toFixed(1)}%</p>
                        <p style={{ margin: "4px 0" }}>Severity: {data.severity.toFixed(0)}</p>
                        <p style={{ margin: "4px 0" }}>Type: {data.type}</p>
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
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2 }}></div>
              <span style={{ fontSize: 12 }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div style={{ marginBottom: 16 }}>
        <h4>Sort by:</h4>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setSortBy("severity")}
            style={{
              padding: "8px 16px",
              backgroundColor: sortBy === "severity" ? "#007bff" : "#f8f9fa",
              color: sortBy === "severity" ? "white" : "black",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          >
            Gap Severity
          </button>
          <button
            onClick={() => setSortBy("volume")}
            style={{
              padding: "8px 16px",
              backgroundColor: sortBy === "volume" ? "#007bff" : "#f8f9fa",
              color: sortBy === "volume" ? "white" : "black",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          >
            Volume
          </button>
          <button
            onClick={() => setSortBy("ctr")}
            style={{
              padding: "8px 16px",
              backgroundColor: sortBy === "ctr" ? "#007bff" : "#f8f9fa",
              color: sortBy === "ctr" ? "white" : "black",
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          >
            Low CTR
          </button>
        </div>
      </div>

      {/* Gaps Table */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <h3>Knowledge Gaps</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Topic</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>Volume</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>CTR</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>Severity</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Type</th>
                  <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Region</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((gap, index) => (
                  <tr 
                    key={index}
                    onClick={() => handlePointClick(gap)}
                    style={{ 
                      cursor: "pointer",
                      backgroundColor: selectedGap === gap ? "#e3f2fd" : "transparent"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedGap !== gap) {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedGap !== gap) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>{gap.topic}</td>
                    <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                      {gap.volume.toLocaleString()}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                      {(gap.ctr * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                      {getGapSeverity(gap).toFixed(0)}
                    </td>
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>
                      <span style={{ 
                        padding: "2px 6px", 
                        backgroundColor: TYPE_COLORS[gap.type], 
                        color: "white", 
                        borderRadius: 3, 
                        fontSize: 12 
                      }}>
                        {gap.type}
                      </span>
                    </td>
                    <td style={{ padding: 8, border: "1px solid #ddd" }}>{gap.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        {selectedGap && (
          <div style={{ 
            width: 300, 
            padding: 16, 
            border: "1px solid #ddd", 
            borderRadius: 8, 
            backgroundColor: "#f9f9f9",
            height: "fit-content"
          }}>
            <h4>Gap Details</h4>
            <p><strong>Topic:</strong> {selectedGap.topic}</p>
            <p><strong>Type:</strong> {selectedGap.type}</p>
            <p><strong>Specialty:</strong> {selectedGap.specialty}</p>
            <p><strong>Region:</strong> {selectedGap.region}</p>
            <p><strong>Suggested Action:</strong> {selectedGap.suggestedAction}</p>
            
            <h5>Related Keywords:</h5>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {getRelatedKeywords(selectedGap.topic).map((keyword, index) => (
                <li key={index} style={{ fontSize: 14, marginBottom: 4 }}>{keyword}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}