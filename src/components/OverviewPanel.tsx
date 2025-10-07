"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { useFilters } from "@/store/filters";
import { fetchOverview } from "@/lib/api";
import KPI from "./KPI";
import type { KPIOverview } from "@/lib/types";

export default function OverviewPanel() {
  const { filters } = useFilters();
  const [data, setData] = useState<KPIOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const overview = await fetchOverview(filters);
        setData(overview);
      } catch (error) {
        console.error("Failed to fetch overview:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters]);

  const scrollToDrugTrends = () => {
    const element = document.getElementById("drugtrends");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading overview...</div>;
  }

  if (!data) {
    return <div style={{ padding: 20 }}>Failed to load overview data</div>;
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div>
      <h2>Overview</h2>
      
      {/* KPI Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 16, 
        marginBottom: 24 
      }}>
        <KPI 
          title="Total Sessions" 
          value={data.totalSessions}
          subtitle="Physician interactions"
        />
        <KPI 
          title="Active Doctors" 
          value={data.activeDoctors}
          subtitle="Unique physicians"
        />
        <KPI 
          title="Top Drugs" 
          value={data.topDrugs.join(", ")}
          subtitle="Most searched"
          onClick={scrollToDrugTrends}
        />
        <KPI 
          title="Top Areas" 
          value={data.topTherapeuticAreas.join(", ")}
          subtitle="Therapeutic focus"
        />
        <KPI 
          title="Avg Session Duration" 
          value={formatDuration(data.avgSessionDurationSec)}
          subtitle="Time per session"
        />
      </div>

      {/* Trend Chart */}
      <div style={{ marginBottom: 24 }}>
        <h3>Search Trend</h3>
        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [value?.toLocaleString(), "Searches"]}
              />
              <Line 
                type="monotone" 
                dataKey="searches" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={false}
              />
              {data.trend
                .filter(point => point.note)
                .map((point, index) => (
                  <ReferenceDot 
                    key={index}
                    x={point.date} 
                    y={point.searches} 
                    r={6} 
                    fill="#ff7300"
                    label={{ value: point.note, position: "top" }}
                  />
                ))
              }
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}