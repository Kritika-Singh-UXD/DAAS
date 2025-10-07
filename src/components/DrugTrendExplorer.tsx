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
    return <div style={{ padding: 20 }}>Loading drug trends...</div>;
  }

  return (
    <div>
      <h2>Drug Trend Explorer</h2>
      
      {/* View Mode Toggle */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setViewMode("volume")}
          style={{
            padding: "8px 16px",
            backgroundColor: viewMode === "volume" ? "#007bff" : "#f8f9fa",
            color: viewMode === "volume" ? "white" : "black",
            border: "1px solid #ddd",
            borderRadius: "4px 0 0 4px"
          }}
        >
          Search Volume
        </button>
        <button
          onClick={() => setViewMode("ctr")}
          style={{
            padding: "8px 16px",
            backgroundColor: viewMode === "ctr" ? "#007bff" : "#f8f9fa",
            color: viewMode === "ctr" ? "white" : "black",
            border: "1px solid #ddd",
            borderRadius: "0 4px 4px 0"
          }}
        >
          Click-Through Rate
        </button>
      </div>

      {/* Drug Selection */}
      <div style={{ marginBottom: 16 }}>
        <h4>Select Drugs to Compare:</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.map(drug => (
            <label key={drug.drug} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="checkbox"
                checked={selectedDrugs.includes(drug.drug)}
                onChange={() => handleDrugToggle(drug.drug)}
              />
              <span style={{ fontSize: 14 }}>{drug.drug}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div style={{ marginBottom: 24 }}>
        <h3>{viewMode === "volume" ? "Search Volume Trends" : "Click-Through Rate Trends"}</h3>
        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [
                  viewMode === "volume" ? value?.toLocaleString() : `${(value * 100).toFixed(1)}%`,
                  name
                ]}
              />
              {selectedDrugs.map((drug, index) => (
                <Line
                  key={drug}
                  type="monotone"
                  dataKey={drug}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div>
        <h3>Drug Performance Summary</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Drug</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>Total Queries</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>CTR</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>Avg Session Time</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Top Region</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Top Specialty</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Co-searched Terms</th>
              </tr>
            </thead>
            <tbody>
              {data.map(drug => (
                <tr key={drug.drug}>
                  <td style={{ padding: 8, border: "1px solid #ddd", fontWeight: "bold" }}>
                    {drug.drug}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                    {drug.totalQueries.toLocaleString()}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                    {(drug.ctr * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                    {Math.floor(drug.avgSessionTimeSec / 60)}m {drug.avgSessionTimeSec % 60}s
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {drug.topRegion}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {drug.topSpecialty}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {drug.coSearched.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}