'use client';

import { useMemo, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { FileText, BookOpen, ExternalLink, Copy, Check } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function CitationExplorer() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const [copiedDOI, setCopiedDOI] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  
  const citationStats = useMemo(() => {
    const doiCounts = new Map<string, number>();
    const journalCounts = new Map<string, number>();
    const guidelineCounts = new Map<string, number>();
    
    let totalCitations = 0;
    let totalQAwithCitations = 0;
    
    filteredData.forEach(item => {
      if (item.citationCount > 0) {
        totalQAwithCitations++;
      }
      totalCitations += item.citationCount;
      
      item.doiList.forEach(doi => {
        doiCounts.set(doi, (doiCounts.get(doi) || 0) + 1);
        
        // Extract journal name from DOI (simplified)
        const journalMatch = doi.match(/10\.\d+\/([^.]+)/);
        if (journalMatch) {
          const journal = journalMatch[1];
          journalCounts.set(journal, (journalCounts.get(journal) || 0) + 1);
        }
      });
      
      item.sourceTypes.forEach(type => {
        if (type === 'guideline') {
          guidelineCounts.set('Clinical Guidelines', (guidelineCounts.get('Clinical Guidelines') || 0) + 1);
        }
      });
    });
    
    const topDOIs = Array.from(doiCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    const topJournals = Array.from(journalCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
    
    const avgCitationsPerQA = filteredData.length > 0 
      ? (totalCitations / filteredData.length).toFixed(2)
      : '0';
    
    const percentWithCitations = filteredData.length > 0
      ? ((totalQAwithCitations / filteredData.length) * 100).toFixed(1)
      : '0';
    
    return {
      totalCitations,
      totalQAwithCitations,
      avgCitationsPerQA,
      percentWithCitations,
      topDOIs,
      topJournals,
      uniqueDOIs: doiCounts.size,
      uniqueJournals: journalCounts.size,
    };
  }, [filteredData]);
  
  const copyDOI = (doi: string) => {
    navigator.clipboard.writeText(doi);
    setCopiedDOI(doi);
    setTimeout(() => setCopiedDOI(null), 2000);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Citation Explorer</h3>
        </div>
        <p className="text-sm text-gray-600">Track sources and references across Q&A pairs</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">Total Citations</p>
              <p className="text-2xl font-bold text-orange-900">{formatNumber(citationStats.totalCitations)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Unique DOIs</p>
              <p className="text-2xl font-bold text-blue-900">{citationStats.uniqueDOIs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Avg per Q&A</p>
              <p className="text-2xl font-bold text-green-900">{citationStats.avgCitationsPerQA}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg text-2xl">📊</div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">Q&A with Citations</p>
              <p className="text-2xl font-bold text-purple-900">{citationStats.percentWithCitations}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg text-2xl">📚</div>
          </div>
        </div>
      </div>
      
      {/* Top Journals */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Journals & Sources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {citationStats.topJournals.map(([journal, count]) => (
            <button
              key={journal}
              onClick={() => setSelectedJournal(selectedJournal === journal ? null : journal)}
              className={`p-4 border rounded-xl text-left transition-all ${
                selectedJournal === journal
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/50'
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 capitalize">{journal}</p>
                <p className="text-xs text-gray-600 mt-1">{count} citations</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* DOI List */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Cited DOIs</h4>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {citationStats.topDOIs.map(([doi, count]) => (
            <div
              key={doi}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-200 hover:bg-orange-50/50 transition-all"
            >
              <div className="flex-1 mr-4">
                <code className="text-sm text-gray-700 break-all font-mono">{doi}</code>
                <p className="text-sm text-gray-500 mt-2">Cited {count} times</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyDOI(doi)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copy DOI"
                >
                  {copiedDOI === doi ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <a
                  href={`https://doi.org/${doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Open DOI"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Citation Distribution */}
      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-orange-900">Citation Impact</p>
            <p className="text-sm text-orange-700 mt-2">
              {citationStats.uniqueJournals} unique journals referenced across {formatNumber(citationStats.totalQAwithCitations)} Q&A pairs,
              demonstrating broad evidence-based responses with an average of {citationStats.avgCitationsPerQA} citations per answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}