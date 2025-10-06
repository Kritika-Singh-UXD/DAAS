'use client';

import { useState } from 'react';
import FilterBar from '@/components/FilterBar';
import FilterProvider from '@/components/FilterProvider';
import AdvancedFiltersModal from '@/components/AdvancedFiltersModal';
import TrendsChart from '@/components/TrendsChart';
import UseCaseTemplates from '@/components/UseCaseTemplates';
import KeyMetrics from '@/components/KeyMetrics';
import TopInsights from '@/components/TopInsights';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  
  return (
    <FilterProvider>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 border-2 border-primary-600 bg-primary-50 flex items-center justify-center rounded-lg">
                  <Activity className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Synduct Signals</h1>
                  <p className="text-xs text-gray-600">Real-Time Physician Insights Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Filter Bar */}
        <div className="bg-gray-50 border-b border-gray-200 sticky top-16 z-30">
          <FilterBar onAdvancedFiltersOpen={() => setAdvancedFiltersOpen(true)} />
        </div>

        {/* Main Content */}
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              {/* Quick Start Templates */}
              <UseCaseTemplates />

              {/* Key Metrics Overview */}
              <KeyMetrics />

              {/* Main Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trends Chart - Left 2/3 */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                    <TrendsChart />
                  </div>
                </div>

                {/* Top Insights - Right 1/3 */}
                <TopInsights />
              </div>
            </div>
          </div>
        </main>
        
        {/* Advanced Filters Modal */}
        <AdvancedFiltersModal
          isOpen={advancedFiltersOpen}
          onClose={() => setAdvancedFiltersOpen(false)}
        />
      </div>
    </FilterProvider>
  );
}