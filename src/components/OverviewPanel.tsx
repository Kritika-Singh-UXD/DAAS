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
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading overview...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Failed to load overview data</div>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Trend</h3>
        <div className="h-80 w-full">
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
                stroke="#3b82f6" 
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
                    fill="#f59e0b"
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