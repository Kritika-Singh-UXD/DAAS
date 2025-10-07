"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFilters } from "@/store/filters";
import { fetchEvidence } from "@/lib/api";
import type { EvidenceImpact, EvidenceNode } from "@/lib/types";

const TYPE_COLORS = {
  "Guideline": "#8884d8",
  "Research": "#82ca9d",
  "DrugDB": "#ffc658",
  "ClinicalTrial": "#ff7300"
};

export default function EvidenceImpactTracker() {
  const { filters } = useFilters();
  const [data, setData] = useState<EvidenceImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<EvidenceNode | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const evidence = await fetchEvidence(filters);
        setData(evidence);
      } catch (error) {
        console.error("Failed to fetch evidence data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filters]);

  const getNetworkLayout = () => {
    if (!data) return { nodePositions: {}, centerX: 400, centerY: 200 };
    
    const { nodes, edges } = data;
    const nodePositions: Record<string, { x: number; y: number }> = {};
    
    const centerX = 400;
    const centerY = 200;
    const radius = 150;
    
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      nodePositions[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    return { nodePositions, centerX, centerY };
  };

  const handleNodeClick = (node: EvidenceNode) => {
    setSelectedNode(node);
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading evidence data...</div>;
  }

  if (!data) {
    return <div style={{ padding: 20 }}>Failed to load evidence data</div>;
  }

  const { nodePositions } = getNetworkLayout();

  return (
    <div>
      <h2>Evidence Impact Tracker</h2>
      
      {/* Timeline Chart */}
      <div style={{ marginBottom: 24 }}>
        <h3>Evidence Engagement Timeline</h3>
        <div style={{ height: 200, width: "100%" }}>
          <ResponsiveContainer>
            <AreaChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [value?.toFixed(2), "Engagement"]}
              />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evidence Network */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>Evidence Network</h3>
          <div style={{ 
            position: "relative", 
            width: "100%", 
            height: 400, 
            border: "1px solid #ddd", 
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <svg width="100%" height="100%" viewBox="0 0 800 400">
              {/* Edges */}
              {data.edges.map((edge, index) => {
                const source = nodePositions[edge.sourceId];
                const target = nodePositions[edge.targetId];
                if (!source || !target) return null;
                
                return (
                  <line
                    key={index}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#ddd"
                    strokeWidth={edge.weight * 3}
                    opacity={0.6}
                  />
                );
              })}
              
              {/* Nodes */}
              {data.nodes.map((node) => {
                const position = nodePositions[node.id];
                if (!position) return null;
                
                const radius = 5 + node.engagement * 15; // Size based on engagement
                
                return (
                  <g key={node.id}>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={radius}
                      fill={TYPE_COLORS[node.type]}
                      stroke="#333"
                      strokeWidth={selectedNode?.id === node.id ? 3 : 1}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleNodeClick(node)}
                    />
                    <text
                      x={position.x}
                      y={position.y - radius - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333"
                      style={{ pointerEvents: "none" }}
                    >
                      {node.title.substring(0, 15)}...
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: "50%" }}></div>
                <span style={{ fontSize: 12 }}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node Details */}
        {selectedNode && (
          <div style={{ 
            width: 300, 
            padding: 16, 
            border: "1px solid #ddd", 
            borderRadius: 8, 
            backgroundColor: "#f9f9f9",
            height: "fit-content"
          }}>
            <h4>Evidence Details</h4>
            <p><strong>Title:</strong> {selectedNode.title}</p>
            <p><strong>Type:</strong> {selectedNode.type}</p>
            <p><strong>Engagement:</strong> {(selectedNode.engagement * 100).toFixed(1)}%</p>
            <p><strong>Released:</strong> {new Date(selectedNode.releasedOn).toLocaleDateString()}</p>
            {selectedNode.doi && (
              <p><strong>DOI:</strong> <a href={`https://doi.org/${selectedNode.doi}`} target="_blank" rel="noopener noreferrer">{selectedNode.doi}</a></p>
            )}
          </div>
        )}
      </div>

      {/* Top Publications */}
      <div>
        <h3>Top Publications</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>Title</th>
                <th style={{ padding: 8, border: "1px solid #ddd", textAlign: "left" }}>DOI</th>
              </tr>
            </thead>
            <tbody>
              {data.topPublications.map((pub, index) => (
                <tr key={index}>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>{pub.title}</td>
                  <td style={{ padding: 8, border: "1px solid #ddd" }}>
                    {pub.doi ? (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
                        {pub.doi}
                      </a>
                    ) : (
                      "N/A"
                    )}
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