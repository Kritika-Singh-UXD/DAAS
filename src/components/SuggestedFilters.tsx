'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function SuggestedFilters() {
  const { data } = useDashboardStore();
  const { filters, setPartial } = useFilters();

  // Check if we have minimal filters (only default date range)
  const hasMinimalFilters = useMemo(() => {
    const nonDateFilters = Object.entries(filters).filter(([key, value]) => 
      key !== 'dateFrom' && key !== 'dateTo' && 
      (Array.isArray(value) ? value.length > 0 : Boolean(value))
    );
    return nonDateFilters.length === 0;
  }, [filters]);

  // Generate top suggestions based on data
  const suggestions = useMemo(() => {
    if (!hasMinimalFilters) return [];

    // Get top therapeutic areas
    const taCount = new Map<string, number>();
    data.forEach(item => {
      item.therapeuticAreas.forEach(ta => {
        taCount.set(ta, (taCount.get(ta) || 0) + 1);
      });
    });

    const topTAs = Array.from(taCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([ta, count]) => ({
        type: 'therapeuticArea' as const,
        label: ta,
        count,
        subtitle: `${count} records`,
      }));

    // Get top drugs
    const drugCount = new Map<string, number>();
    data.forEach(item => {
      item.drugNames.forEach(drug => {
        drugCount.set(drug, (drugCount.get(drug) || 0) + 1);
      });
    });

    const topDrugs = Array.from(drugCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([drug, count]) => ({
        type: 'drug' as const,
        label: drug,
        count,
        subtitle: `${count} mentions`,
      }));

    // Get top countries
    const countryCount = new Map<string, number>();
    data.forEach(item => {
      countryCount.set(item.country, (countryCount.get(item.country) || 0) + 1);
    });

    const topCountries = Array.from(countryCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([country, count]) => ({
        type: 'country' as const,
        label: country,
        count,
        subtitle: `${count} records`,
      }));

    return [...topTAs, ...topDrugs, ...topCountries];
  }, [data, hasMinimalFilters]);

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setPartial({ [suggestion.type]: [suggestion.label] });
  };

  if (!hasMinimalFilters || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Suggested Filters</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Get started by exploring these popular categories from your dataset:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.label}`}
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-purple-700">
                  {suggestion.label}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {suggestion.subtitle}
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-gray-400 group-hover:text-purple-500 flex-shrink-0 ml-2" />
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-white rounded border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Tip:</strong> Click any suggestion above to apply that filter and see focused results. 
          You can combine multiple filters using the filter bar or advanced filters modal.
        </p>
      </div>
    </div>
  );
}