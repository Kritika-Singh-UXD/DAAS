'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export default function TopInsights() {
  const filteredData = useDashboardStore((state) => state.filteredData);

  const insights = useMemo(() => {
    // Calculate top drugs by mention count
    const drugCounts: { [key: string]: number } = {};
    filteredData.forEach(item => {
      item.drugNames.forEach(drug => {
        drugCounts[drug] = (drugCounts[drug] || 0) + 1;
      });
    });
    
    const topDrugs = Object.entries(drugCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([drug, count]) => ({ name: drug, count }));

    // Calculate top specialties by Q&A count
    const specialtyCounts: { [key: string]: number } = {};
    filteredData.forEach(item => {
      specialtyCounts[item.specialty] = (specialtyCounts[item.specialty] || 0) + 1;
    });
    
    const topSpecialties = Object.entries(specialtyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([specialty, count]) => ({ name: specialty, count }));

    // Calculate top countries by Q&A count
    const countryCounts: { [key: string]: number } = {};
    filteredData.forEach(item => {
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
    });
    
    const topCountries = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ name: country, count }));

    return {
      topDrugs,
      topSpecialties,
      topCountries
    };
  }, [filteredData]);

  return (
    <div className="space-y-4">
      {/* Top Drugs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Discussed Drugs</h3>
        <div className="space-y-3">
          {insights.topDrugs.map((drug, index) => (
            <div key={drug.name} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{drug.name}</span>
              <span className="text-sm font-medium text-gray-900">{drug.count} mentions</span>
            </div>
          ))}
          {insights.topDrugs.length === 0 && (
            <p className="text-sm text-gray-500">No drugs found in current filter</p>
          )}
        </div>
      </div>

      {/* Top Specialties */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Specialties</h3>
        <div className="space-y-3">
          {insights.topSpecialties.map((specialty, index) => (
            <div key={specialty.name} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{specialty.name}</span>
              <span className="text-sm font-medium text-gray-900">{specialty.count} Q&As</span>
            </div>
          ))}
          {insights.topSpecialties.length === 0 && (
            <p className="text-sm text-gray-500">No specialties found in current filter</p>
          )}
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
        <div className="space-y-3">
          {insights.topCountries.map((country, index) => (
            <div key={country.name} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{country.name}</span>
              <span className="text-sm font-medium text-gray-900">{country.count} Q&As</span>
            </div>
          ))}
          {insights.topCountries.length === 0 && (
            <p className="text-sm text-gray-500">No countries found in current filter</p>
          )}
        </div>
      </div>
    </div>
  );
}