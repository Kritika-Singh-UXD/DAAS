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
    return <div style={{ padding: 20 }}>Loading geographic data...</div>;
  }

  if (!data) {
    return <div style={{ padding: 20 }}>Failed to load geographic data</div>;
  }

  return (
    <div>
      <h2>Geographic & Specialty Analysis</h2>
      
      <div style={{ display: "flex", gap: 16 }}>
        {/* Map */}
        <div style={{ flex: 2 }}>
          <h3>Regional Intensity Map</h3>
          <div style={{ 
            width: "100%", 
            height: 400, 
            border: "1px solid #ddd", 
            borderRadius: 8,
            position: "relative"
          }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 700,
                center: [10, 45] // Center on Southern Europe
              }}
              width={800}
              height={400}
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
                        fill={isTargetCountry ? "#e0e0e0" : "#f9f9f9"}
                        stroke="#d0d0d0"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: isTargetCountry ? "#d0d0d0" : "#f0f0f0" },
                          pressed: { outline: "none" }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
              
              {/* Markers for data points */}
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
                        fill={getIntensityColor(point.value)}
                        stroke="#333"
                        strokeWidth={1}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedPoint(point)}
                      />
                    </Marker>
                  );
                })
              }
            </ComposableMap>

            {/* Tooltip for selected point */}
            {selectedPoint && (
              <div style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "white",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                fontSize: 12,
                minWidth: 200
              }}>
                <h4 style={{ margin: "0 0 8px 0" }}>{selectedPoint.region}</h4>
                <p style={{ margin: "4px 0" }}>Intensity: {(selectedPoint.value * 100).toFixed(1)}%</p>
                <p style={{ margin: "4px 0" }}>Top Drug: {selectedPoint.topDrug}</p>
                <p style={{ margin: "4px 0" }}>Avg Sessions/Doctor: {selectedPoint.avgSessionsPerDoctor}</p>
                <p style={{ margin: "4px 0" }}>Dominant Specialty: {selectedPoint.dominantSpecialty}</p>
              </div>
            )}
          </div>
        </div>

        {/* Specialty Chart */}
        <div style={{ flex: 1 }}>
          <h3>Engagement by Specialty</h3>
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart 
                data={data.bySpecialty}
                layout="horizontal"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="specialty" width={90} />
                <Tooltip 
                  formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, "Engagement"]}
                />
                <Bar dataKey="engagement" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Data Table */}
      <div style={{ marginTop: 24 }}>
        <h3>Regional Summary</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Region</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>Intensity</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Top Drug</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>Avg Sessions/Doctor</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Dominant Specialty</th>
              </tr>
            </thead>
            <tbody>
              {data.points.map((point, index) => (
                <tr 
                  key={index}
                  onClick={() => setSelectedPoint(point)}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: 8, border: "1px solid #ddd", fontWeight: "bold" }}>
                    {point.region}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                    {(point.value * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {point.topDrug}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd", textAlign: "right" }}>
                    {point.avgSessionsPerDoctor}
                  </td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {point.dominantSpecialty}
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