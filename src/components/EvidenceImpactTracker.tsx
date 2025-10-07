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
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading evidence data...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-red-500">Failed to load evidence data</div>
        </div>
      </div>
    );
  }

  const { nodePositions } = getNetworkLayout();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Evidence Impact Tracker</h2>
      </div>
      
      {/* Minimal Evidence Impact Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Clean Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Evidence Impact Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">
              Track evidence engagement patterns and publication network relationships
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Clean Timeline Chart */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Evidence Engagement Timeline</h4>
              <p className="text-sm text-gray-500">
                Track how evidence engagement has evolved over time
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <AreaChart data={data.timeline} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid 
                      strokeDasharray="2 4" 
                      stroke="#e2e8f0" 
                      strokeOpacity={0.6}
                    />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                      axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any) => [value?.toFixed(2), "Engagement"]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="url(#purpleGradient)"
                      fill="url(#purpleAreaGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="purpleAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Enhanced Evidence Network */}
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Evidence Network</h4>
                  <p className="text-sm text-gray-500 mt-1">Interactive network showing relationships between evidence sources</p>
                </div>
                
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="relative w-full h-96 overflow-hidden rounded-lg">
                      <svg width="100%" height="100%" viewBox="0 0 800 400">
                        {/* Enhanced Edges */}
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
                              stroke="#cbd5e1"
                              strokeWidth={Math.max(1, edge.weight * 3)}
                              opacity={0.6}
                              className="transition-opacity hover:opacity-80"
                            />
                          );
                        })}
                        
                        {/* Enhanced Nodes */}
                        {data.nodes.map((node) => {
                          const position = nodePositions[node.id];
                          if (!position) return null;
                          
                          const radius = 8 + node.engagement * 20;
                          
                          return (
                            <g key={node.id} className="cursor-pointer">
                              <circle
                                cx={position.x}
                                cy={position.y}
                                r={radius + 3}
                                fill="rgba(255, 255, 255, 0.8)"
                                opacity={selectedNode?.id === node.id ? 1 : 0}
                                className="transition-opacity"
                              />
                              <circle
                                cx={position.x}
                                cy={position.y}
                                r={radius}
                                fill={TYPE_COLORS[node.type]}
                                stroke={selectedNode?.id === node.id ? "#6366f1" : "#ffffff"}
                                strokeWidth={selectedNode?.id === node.id ? 3 : 2}
                                className="hover:opacity-80 transition-all duration-200"
                                onClick={() => handleNodeClick(node)}
                              />
                              <text
                                x={position.x}
                                y={position.y - radius - 8}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#374151"
                                fontWeight="500"
                                className="pointer-events-none"
                              >
                                {node.title.substring(0, 12)}...
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                  
                  {/* Enhanced Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
                    <span className="text-xs text-gray-500 mr-2">Evidence Types:</span>
                    {Object.entries(TYPE_COLORS).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs font-medium text-gray-600">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Node Details */}
            {selectedNode && (
              <div className="w-80 bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Evidence Details</h4>
                  <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</label>
                    <p className="text-sm font-medium text-gray-900 mt-1 leading-relaxed">{selectedNode.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                    <div className="mt-1">
                      <span 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: TYPE_COLORS[selectedNode.type] }}
                      >
                        {selectedNode.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</label>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {(selectedNode.engagement * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Released</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(selectedNode.releasedOn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedNode.doi && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">DOI</label>
                      <p className="text-sm mt-1">
                        <a 
                          href={`https://doi.org/${selectedNode.doi}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          {selectedNode.doi}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clean Top Publications */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Top Publications</h4>
              <p className="text-sm text-gray-500 mt-1">Most influential publications in your research area</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">DOI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topPublications.map((pub, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {pub.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {pub.doi ? (
                          <a 
                            href={`https://doi.org/${pub.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                          >
                            {pub.doi}
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
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