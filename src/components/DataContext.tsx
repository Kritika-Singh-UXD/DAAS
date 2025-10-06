'use client';

import { useMemo } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { useDashboardStore } from '@/store/dashboardStore';
import { 
  Database, 
  Filter, 
  Calendar, 
  Globe, 
  Users, 
  Pill,
  Activity,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function DataContext() {
  const { filters } = useFilters();
  const { data, filteredData } = useDashboardStore();

  // Calculate the actual impact of filters
  const filterImpact = useMemo(() => {
    const total = data.length;
    const filtered = filteredData.length;
    const percentageShown = total > 0 ? Math.round((filtered / total) * 100) : 0;
    const recordsFiltered = total - filtered;
    
    return {
      total,
      filtered,
      percentageShown,
      recordsFiltered
    };
  }, [data, filteredData]);

  // Generate human-readable context
  const contextDescription = useMemo(() => {
    const parts: string[] = [];
    
    if (filters.drug && filters.drug.length > 0) {
      parts.push(`drugs: ${filters.drug.join(', ')}`);
    }
    if (filters.therapeuticArea && filters.therapeuticArea.length > 0) {
      parts.push(`areas: ${filters.therapeuticArea.join(', ')}`);
    }
    if (filters.company && filters.company.length > 0) {
      parts.push(`companies: ${filters.company.join(', ')}`);
    }
    if (filters.country && filters.country.length > 0) {
      parts.push(`countries: ${filters.country.join(', ')}`);
    }
    if (filters.specialty && filters.specialty.length > 0) {
      parts.push(`specialties: ${filters.specialty.join(', ')}`);
    }
    
    if (parts.length === 0) {
      return 'all physician interactions';
    }
    
    return parts.join(' • ');
  }, [filters]);

  // Determine data freshness
  const dataFreshness = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const dates = filteredData.map(d => new Date(d.timestamp).getTime());
    const latest = new Date(Math.max(...dates));
    const earliest = new Date(Math.min(...dates));
    
    const daysSinceLatest = Math.floor((Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      earliest: earliest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      latest: latest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isRealTime: daysSinceLatest < 7,
      daysSinceLatest
    };
  }, [filteredData]);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'dateFrom' || key === 'dateTo') return false;
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Primary Context Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary-600" />
              <span className="text-lg font-semibold text-gray-900">
                You are analyzing:
              </span>
            </div>
            <div className="text-lg text-gray-700">
              <span className="font-bold text-primary-600">{filterImpact.filtered.toLocaleString()}</span>
              {' '}physician interactions
              {hasActiveFilters && (
                <span className="text-gray-500 ml-2">
                  ({filterImpact.percentageShown}% of total data)
                </span>
              )}
            </div>
          </div>

          {dataFreshness && (
            <div className="flex items-center gap-2 text-sm">
              <Activity className={`h-4 w-4 ${dataFreshness.isRealTime ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={dataFreshness.isRealTime ? 'text-green-700 font-medium' : 'text-gray-600'}>
                {dataFreshness.isRealTime ? 'Real-time data' : `Last updated ${dataFreshness.daysSinceLatest} days ago`}
              </span>
            </div>
          )}
        </div>

        {/* Filter Description */}
        {hasActiveFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <div className="flex items-start gap-3">
              <Filter className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Filtered by:</span> {contextDescription}
                </p>
                {filters.dateFrom && filters.dateTo && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date range: {filters.dateFrom} to {filters.dateTo}
                  </p>
                )}
              </div>
              {filterImpact.recordsFiltered > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {filterImpact.recordsFiltered.toLocaleString()} records filtered out
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Data Source</span>
            </div>
            <p className="text-xs text-gray-600">
              Anonymized physician Q&As from DR.INFO platform
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Coverage</span>
            </div>
            <p className="text-xs text-gray-600">
              {new Set(filteredData.map(d => d.country)).size} countries • 
              {new Set(filteredData.map(d => d.specialty)).size} specialties
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Pill className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Drug Mentions</span>
            </div>
            <p className="text-xs text-gray-600">
              {new Set(filteredData.flatMap(d => d.drugNames)).size} unique drugs tracked
            </p>
          </div>
        </div>

        {/* No Data Warning */}
        {filteredData.length === 0 && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">No data matches your filters</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Try broadening your search criteria or selecting different filters. 
                  Use the templates above for pre-configured analyses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* What This Means */}
        {filteredData.length > 0 && (
          <div className="mt-3 flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">What this means:</span>
              <p className="text-sm text-gray-600">
                {filteredData.length > 100 
                  ? "You have a statistically significant dataset for reliable insights"
                  : filteredData.length > 50
                  ? "Good sample size for trend analysis"
                  : filteredData.length > 10
                  ? "Limited data - insights may not be representative"
                  : "Very limited data - consider broadening filters"
                }
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}