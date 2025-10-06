'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Activity, Users, Globe, Pill } from 'lucide-react';

export default function KeyMetrics() {
  const filteredData = useDashboardStore((state) => state.filteredData);

  const metrics = useMemo(() => {
    // Calculate total Q&As
    const totalQAs = filteredData.length;

    // Calculate unique countries
    const uniqueCountries = new Set(filteredData.map(item => item.country)).size;

    // Calculate unique specialties
    const uniqueSpecialties = new Set(filteredData.map(item => item.specialty)).size;

    // Calculate unique drugs mentioned
    const allDrugs = filteredData.flatMap(item => item.drugNames);
    const uniqueDrugs = new Set(allDrugs).size;

    return {
      totalQAs,
      uniqueCountries,
      uniqueSpecialties,
      uniqueDrugs
    };
  }, [filteredData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Q&As</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalQAs}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Countries</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.uniqueCountries}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <Globe className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Specialties</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.uniqueSpecialties}</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Drug Mentions</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.uniqueDrugs}</p>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Pill className="h-5 w-5 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}