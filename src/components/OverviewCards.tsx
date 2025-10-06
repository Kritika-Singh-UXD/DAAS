'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { formatNumber } from '@/lib/utils';
import { Activity, Users, Pill, FileText, TrendingUp, Globe } from 'lucide-react';

export default function OverviewCards() {
  const filteredData = useDashboardStore((state) => state.filteredData);
  const { setPartial } = useFilters();
  
  // Calculate metrics
  const totalQA = filteredData.length;
  
  const specialtyCount = filteredData.reduce((acc, item) => {
    acc[item.specialty] = (acc[item.specialty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topSpecialty = Object.entries(specialtyCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  
  const therapeuticAreaCount = filteredData.reduce((acc, item) => {
    item.therapeuticAreas.forEach(area => {
      acc[area] = (acc[area] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topTherapeuticArea = Object.entries(therapeuticAreaCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  
  const drugCount = filteredData.reduce((acc, item) => {
    item.drugNames.forEach(drug => {
      acc[drug] = (acc[drug] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topDrug = Object.entries(drugCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
  
  const totalCitations = filteredData.reduce((sum, item) => sum + item.citationCount, 0);
  const uniqueDOIs = new Set(filteredData.flatMap(item => item.doiList)).size;
  
  const uniqueCountries = new Set(filteredData.map(item => item.country)).size;
  
  const cards = [
    {
      title: 'Total Q&A Pairs',
      value: formatNumber(totalQA),
      subtitle: `${uniqueCountries} countries`,
      icon: Activity,
      clickable: false,
      onClick: () => {},
    },
    {
      title: 'Top Specialty',
      value: topSpecialty,
      subtitle: `${formatNumber(specialtyCount[topSpecialty] || 0)} mentions`,
      icon: Users,
      clickable: topSpecialty !== 'N/A',
      onClick: () => {
        if (topSpecialty !== 'N/A') {
          setPartial({ specialty: [topSpecialty] });
        }
      },
    },
    {
      title: 'Top Therapeutic Area',
      value: topTherapeuticArea,
      subtitle: `${formatNumber(therapeuticAreaCount[topTherapeuticArea] || 0)} mentions`,
      icon: TrendingUp,
      clickable: topTherapeuticArea !== 'N/A',
      onClick: () => {
        if (topTherapeuticArea !== 'N/A') {
          setPartial({ therapeuticArea: [topTherapeuticArea] });
        }
      },
    },
    {
      title: 'Top Drug',
      value: topDrug,
      subtitle: `${formatNumber(drugCount[topDrug] || 0)} mentions`,
      icon: Pill,
      clickable: topDrug !== 'N/A',
      onClick: () => {
        if (topDrug !== 'N/A') {
          setPartial({ drug: [topDrug] });
        }
      },
    },
    {
      title: 'Citations',
      value: formatNumber(totalCitations),
      subtitle: `${uniqueDOIs} unique DOIs`,
      icon: FileText,
      clickable: false,
      onClick: () => {},
    },
    {
      title: 'Geographic Reach',
      value: uniqueCountries,
      subtitle: 'countries',
      icon: Globe,
      clickable: false,
      onClick: () => {},
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 ${
            card.clickable 
              ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 group' 
              : ''
          }`}
          onClick={card.onClick}
          role={card.clickable ? 'button' : undefined}
          tabIndex={card.clickable ? 0 : undefined}
          onKeyDown={card.clickable ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              card.onClick();
            }
          } : undefined}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${
              card.clickable 
                ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <card.icon className="h-5 w-5" />
            </div>
            {card.clickable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {card.title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-sm text-gray-600">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}