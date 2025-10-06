'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { ExternalLink } from 'lucide-react';

export default function CitationExplorer() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  
  const insights = useMemo(() => {
    let totalCitations = 0;
    let answersWithCitations = 0;
    let answersWithoutCitations = 0;
    const allDOIs: string[] = [];
    
    filteredData.forEach(item => {
      if (item.citationCount > 0) {
        answersWithCitations++;
        totalCitations += item.citationCount;
        if (item.doiList) {
          allDOIs.push(...item.doiList);
        }
      } else {
        answersWithoutCitations++;
      }
    });
    
    const uniqueDOIs = [...new Set(allDOIs)];
    const averageCitationsPerAnswer = answersWithCitations > 0 ? (totalCitations / answersWithCitations).toFixed(1) : '0';
    const evidenceBasedPercentage = filteredData.length > 0 ? Math.round((answersWithCitations / filteredData.length) * 100) : 0;
    
    return {
      totalAnswers: filteredData.length,
      answersWithCitations,
      answersWithoutCitations,
      totalCitations,
      uniqueDOIs: uniqueDOIs.length,
      averageCitationsPerAnswer,
      evidenceBasedPercentage,
      sampleDOIs: uniqueDOIs.slice(0, 8)
    };
  }, [filteredData]);
  
  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Evidence-Based Answers</h3>
        <p className="text-sm text-gray-600 mt-1">
          How many medical answers include scientific citations and references
        </p>
      </div>
      
      {/* Key Insights */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-2 min-w-0">
          <div className="text-lg font-bold text-green-900 truncate">{insights.evidenceBasedPercentage}%</div>
          <div className="text-xs text-green-700 truncate">Evidence-Based</div>
        </div>
        
        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-2 min-w-0">
          <div className="text-lg font-bold text-blue-900 truncate">{insights.averageCitationsPerAnswer}</div>
          <div className="text-xs text-blue-700 truncate">Avg Citations</div>
        </div>
      </div>
      
      {/* Citation Breakdown */}
      <div className="mb-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-xs font-medium text-green-900 truncate">With Citations</div>
              <div className="text-xs text-green-600 truncate">{insights.totalCitations} total</div>
            </div>
            <div className="text-sm font-bold text-green-900">{insights.answersWithCitations}</div>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-xs font-medium text-gray-700 truncate">Opinion Based</div>
              <div className="text-xs text-gray-500 truncate">No citations</div>
            </div>
            <div className="text-sm font-bold text-gray-700">{insights.answersWithoutCitations}</div>
          </div>
        </div>
      </div>
      
      {/* Sample Research Sources */}
      {insights.sampleDOIs.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-900 mb-1">Sample Sources</h4>
          <div className="space-y-1">
            {insights.sampleDOIs.slice(0, 4).map((doi, index) => (
              <div key={doi} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
                <code className="text-xs text-gray-600 font-mono truncate flex-1 min-w-0">{doi}</code>
                <a
                  href={`https://doi.org/${doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 flex-shrink-0"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* What This Means */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
        <div className="text-xs">
          <div className="font-medium text-gray-900 mb-1">What this shows:</div>
          <div className="text-gray-600 space-y-0.5">
            <div>• Evidence-based answers cite scientific papers</div>
            <div>• Higher % = more scientific backing</div>
            <div>• DOIs link to actual research studies</div>
          </div>
        </div>
      </div>
    </div>
  );
}