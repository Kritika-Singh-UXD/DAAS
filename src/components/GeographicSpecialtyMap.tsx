"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFilters } from "@/store/filters";
import { fetchGeography } from "@/lib/api";
import type { GeoPayload, GeoPoint } from "@/lib/types";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@3/countries-50m.json";

const REGION_COORDS: Record<string, { latitude: number; longitude: number }> = {
  "Italy": { latitude: 41.8719, longitude: 12.5674 },
  "Spain": { latitude: 40.4637, longitude: -3.7492 },
  "Portugal": { latitude: 39.3999, longitude: -8.2245 },
  "Southern Europe": { latitude: 42.0, longitude: 12.0 }
};

export default function GeographicSpecialtyMap() {
  const { filters } = useFilters();
  const [data, setData] = useState<GeoPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const geography = await fetchGeography(filters);
        setData(geography);
      } catch (error) {
        console.error("Failed to fetch geography data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters]);

  const getIntensityColor = (value: number) => {
    const intensity = Math.min(value, 1.0);
    const blue = Math.floor(255 * intensity);
    return `rgb(${255 - blue}, ${255 - blue}, 255)`;
  };

  const getMarkerSize = (value: number) => {
    return 8 + value * 12; // Scale marker size
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading geographic data...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-red-500">Failed to load geographic data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Geographic & Specialty Analysis</h2>
      </div>
      
      {/* Enhanced Geographic Analysis Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Geographic & Specialty Distribution</h3>
            <p className="text-sm text-gray-600 mt-1">
              Analyze regional patterns and specialty-specific engagement trends
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Enhanced Map and Chart Layout */}
          <div className="flex gap-6">
            {/* Enhanced Map Section */}
            <div className="flex-[2]">
              <div className="bg-gradient-to-br from-slate-50 to-green-50 border border-gray-200 rounded-2xl shadow-inner overflow-hidden">
                <div className="px-6 py-4 bg-white/50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Regional Intensity Map</h4>
                  <p className="text-sm text-gray-600 mt-1">Interactive map showing engagement patterns across regions</p>
                </div>
                
                <div className="p-6">
                  <div className="relative bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 overflow-hidden">
                    <div className="relative w-full h-96">
                      <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                          scale: 700,
                          center: [10, 45] // Center on Southern Europe
                        }}
                        width={800}
                        height={400}
                        className="w-full h-full"
                      >
                        <Geographies geography={geoUrl}>
                          {({ geographies }) =>
                            geographies.map((geo) => {
                              const countryName = geo.properties.NAME;
                              const isTargetCountry = ["Italy", "Spain", "Portugal"].includes(countryName);
                              
                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={isTargetCountry ? "#e2e8f0" : "#f8fafc"}
                                  stroke="#cbd5e1"
                                  strokeWidth={0.5}
                                  style={{
                                    default: { outline: "none" },
                                    hover: { outline: "none", fill: isTargetCountry ? "#cbd5e1" : "#f1f5f9" },
                                    pressed: { outline: "none" }
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>
                        
                        {/* Enhanced Markers */}
                        {data.points
                          .filter(point => REGION_COORDS[point.region])
                          .map((point, index) => {
                            const coords = REGION_COORDS[point.region];
                            return (
                              <Marker
                                key={index}
                                coordinates={[coords.longitude, coords.latitude]}
                              >
                                <circle
                                  r={getMarkerSize(point.value)}
                                  fill="url(#greenGradient)"
                                  stroke="#10b981"
                                  strokeWidth={selectedPoint === point ? 3 : 2}
                                  className="cursor-pointer hover:opacity-80 transition-all duration-200"
                                  onClick={() => setSelectedPoint(point)}
                                />
                              </Marker>
                            );
                          })
                        }
                        <defs>
                          <radialGradient id="greenGradient" cx="0.3" cy="0.3">
                            <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                          </radialGradient>
                        </defs>
                      </ComposableMap>

                      {/* Enhanced Tooltip */}
                      {selectedPoint && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-lg max-w-xs">
                          <h5 className="font-semibold text-gray-900 mb-3">{selectedPoint.region}</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Intensity:</span>
                              <span className="font-medium text-green-700">{(selectedPoint.value * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Top Drug:</span>
                              <span className="font-medium">{selectedPoint.topDrug}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Sessions:</span>
                              <span className="font-medium">{selectedPoint.avgSessionsPerDoctor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Specialty:</span>
                              <span className="font-medium">{selectedPoint.dominantSpecialty}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Specialty Chart */}
            <div className="flex-1">
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl shadow-inner overflow-hidden h-full">
                <div className="px-6 py-4 bg-white/50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Engagement by Specialty</h4>
                  <p className="text-sm text-gray-600 mt-1">Specialty-specific engagement metrics</p>
                </div>
                
                <div className="p-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50">
                    <div className="h-80 w-full">
                      <ResponsiveContainer>
                        <BarChart 
                          data={data.bySpecialty}
                          layout="horizontal"
                          margin={{ left: 120, right: 30, top: 20, bottom: 20 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="2 4" 
                            stroke="#e2e8f0" 
                            strokeOpacity={0.6}
                            horizontal={true}
                            vertical={false}
                          />
                          <XAxis 
                            type="number" 
                            domain={[0, 1]} 
                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                            axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="specialty" 
                            width={110}
                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                            axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, "Engagement"]}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          />
                          <Bar 
                            dataKey="engagement" 
                            fill="url(#specialtyGradient)"
                            radius={[0, 4, 4, 0]}
                          />
                          <defs>
                            <linearGradient id="specialtyGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#34d399" stopOpacity={0.9} />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Regional Data Table */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl shadow-inner overflow-hidden">
            <div className="px-6 py-4 bg-white/50 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Regional Summary</h4>
              <p className="text-sm text-gray-600 mt-1">Detailed breakdown of regional performance metrics</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/60">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Intensity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Top Drug</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dominant Specialty</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200/50">
                  {data.points.map((point, index) => (
                    <tr 
                      key={index}
                      onClick={() => setSelectedPoint(point)}
                      className={`cursor-pointer transition-colors hover:bg-white/50 ${
                        selectedPoint === point ? 'bg-green-50/70' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {point.region}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {(point.value * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {point.topDrug}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right font-medium">
                        {point.avgSessionsPerDoctor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {point.dominantSpecialty}
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