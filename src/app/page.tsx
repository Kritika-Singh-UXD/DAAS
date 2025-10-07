'use client';

import { useState } from 'react';
import FilterBar from '@/components/FilterBar';
import FilterProvider from '@/components/FilterProvider';
import AdvancedFiltersModal from '@/components/AdvancedFiltersModal';
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
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Empty Dashboard</h2>
                <p className="text-gray-500">This is a clean slate for your new version</p>
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