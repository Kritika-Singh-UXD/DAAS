'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { formatNumber } from '@/lib/utils';
import { Activity, Users, Pill, FileText, TrendingUp, Globe, AlertCircle } from 'lucide-react';
import HelpTooltip from '@/components/HelpTooltip';
import EmptyStates from '@/components/EmptyStates';

export default function OverviewCards() {
  const { data, filteredData } = useDashboardStore();
  const { filters, setPartial } = useFilters();
  
  // Check if filters are applied
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'dateFrom' || key === 'dateTo') return false;
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  
  // If no data, show empty state
  if (filteredData.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-900">No Data Available</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your current filters returned no results. Try adjusting your filters or use the templates above.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate metrics
  const totalQA = filteredData.length;
  const totalDataset = data.length;
  const percentageOfTotal = totalDataset > 0 ? Math.round((totalQA / totalDataset) * 100) : 0;
  
  // Specialty analysis
  const specialtyCount = filteredData.reduce((acc, item) => {
    acc[item.specialty] = (acc[item.specialty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topSpecialty = Object.entries(specialtyCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  const specialtyPercentage = specialtyCount[topSpecialty] 
    ? Math.round((specialtyCount[topSpecialty] / totalQA) * 100) 
    : 0;
  
  // Therapeutic area analysis
  const therapeuticAreaCount = filteredData.reduce((acc, item) => {
    item.therapeuticAreas.forEach(area => {
      acc[area] = (acc[area] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topTherapeuticArea = Object.entries(therapeuticAreaCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  const taPercentage = therapeuticAreaCount[topTherapeuticArea]
    ? Math.round((therapeuticAreaCount[topTherapeuticArea] / totalQA) * 100)
    : 0;
  
  // Drug analysis
  const drugCount = filteredData.reduce((acc, item) => {
    item.drugNames.forEach(drug => {
      acc[drug] = (acc[drug] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topDrug = Object.entries(drugCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  const drugPercentage = drugCount[topDrug]
    ? Math.round((drugCount[topDrug] / totalQA) * 100)
    : 0;
  
  // Citations and geographic analysis
  const totalCitations = filteredData.reduce((sum, item) => sum + item.citationCount, 0);
  const avgCitations = totalQA > 0 ? (totalCitations / totalQA).toFixed(1) : '0';
  const uniqueDOIs = new Set(filteredData.flatMap(item => item.doiList)).size;
  const uniqueCountries = new Set(filteredData.map(item => item.country)).size;
  
  const cards = [
    {
      title: 'Physician Interactions',
      value: formatNumber(totalQA),
      subtitle: hasActiveFilters 
        ? `Showing ${percentageOfTotal}% of total`
        : 'All available data',
      detail: `${uniqueCountries} countries represented`,
      icon: Activity,
      clickable: false,
      help: 'Total number of physician Q&A pairs matching your current filters',
      isPrimary: true,
    },
    {
      title: 'Leading Specialty',
      value: topSpecialty !== 'N/A' ? topSpecialty : 'Multiple',
      subtitle: `${specialtyPercentage}% of interactions`,
      detail: `${Object.keys(specialtyCount).length} specialties total`,
      icon: Users,
      clickable: topSpecialty !== 'N/A',
      onClick: () => setPartial({ specialty: [topSpecialty] }),
      help: 'The medical specialty with the most physician interactions',
    },
    {
      title: 'Top Therapeutic Area',
      value: topTherapeuticArea !== 'N/A' ? topTherapeuticArea : 'Various',
      subtitle: `${taPercentage}% of focus`,
      detail: `${Object.keys(therapeuticAreaCount).length} areas tracked`,
      icon: TrendingUp,
      clickable: topTherapeuticArea !== 'N/A',
      onClick: () => setPartial({ therapeuticArea: [topTherapeuticArea] }),
      help: 'The therapeutic category with the most physician interest',
    },
    {
      title: 'Most Discussed Drug',
      value: topDrug !== 'N/A' ? topDrug : 'Multiple',
      subtitle: `${drugPercentage}% of mentions`,
      detail: `${Object.keys(drugCount).length} drugs total`,
      icon: Pill,
      clickable: topDrug !== 'N/A',
      onClick: () => setPartial({ drug: [topDrug] }),
      help: 'The pharmaceutical product most frequently discussed',
    },
    {
      title: 'Scientific Citations',
      value: formatNumber(totalCitations),
      subtitle: `Avg ${avgCitations} per Q&A`,
      detail: `${uniqueDOIs} unique studies`,
      icon: FileText,
      clickable: false,
      help: 'Clinical studies and papers referenced by physicians',
    },
    {
      title: 'Geographic Coverage',
      value: uniqueCountries.toString(),
      subtitle: 'Countries',
      detail: 'Global reach',
      icon: Globe,
      clickable: false,
      help: 'Number of countries where physician data was collected',
    },
  ];
  
  return (
    <div className="space-y-4">
      {/* Context banner when filters are active */}
      {hasActiveFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Metrics updated based on your active filters
            </span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 200, behavior: 'smooth' })}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            View filter details ↑
          </button>
        </div>
      )}
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl border p-5 transition-all duration-200 relative ${
              card.clickable 
                ? 'cursor-pointer hover:shadow-md hover:border-primary-300' 
                : ''
            } ${
              card.isPrimary ? 'border-primary-200' : 'border-gray-200'
            }`}
            onClick={card.clickable ? card.onClick : undefined}
            role={card.clickable ? 'button' : undefined}
            tabIndex={card.clickable ? 0 : undefined}
          >
            {/* Icon and Help */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                card.isPrimary ? 'bg-primary-50' : 'bg-gray-50'
              }`}>
                <card.icon className={`h-5 w-5 ${
                  card.isPrimary ? 'text-primary-600' : 'text-gray-600'
                }`} />
              </div>
              <HelpTooltip content={card.help} position="top" />
            </div>
            
            {/* Content */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {card.title}
              </p>
              <p className="text-xl font-bold text-gray-900 truncate" title={card.value}>
                {card.value}
              </p>
              <p className="text-sm text-gray-700 mt-1">{card.subtitle}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.detail}</p>
            </div>
            
            {/* Clickable Indicator */}
            {card.clickable && (
              <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Explanation footer */}
      <div className="text-center text-xs text-gray-500 mt-4">
        {hasActiveFilters ? (
          <span>Click any highlighted metric to add it as an additional filter</span>
        ) : (
          <span>These metrics represent all available data • Apply filters above to focus your analysis</span>
        )}
      </div>
    </div>
  );
}