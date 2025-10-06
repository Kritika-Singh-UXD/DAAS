'use client';

import { useState, useEffect } from 'react';
import OverviewCards from '@/components/OverviewCards';
import FiltersPanel from '@/components/FiltersPanel';
import FilterBar from '@/components/FilterBar';
import FilterProvider from '@/components/FilterProvider';
import AdvancedFiltersModal from '@/components/AdvancedFiltersModal';
import TrendsChart from '@/components/TrendsChart';
import EmergingSignals from '@/components/EmergingSignals';
import GeoHeatcardsGrid from '@/components/GeoHeatcardsGrid';
import SuggestedFilters from '@/components/SuggestedFilters';
import TopDrugsAreas from '@/components/TopDrugsAreas';
import DataTable from '@/components/DataTable';
import CitationExplorer from '@/components/CitationExplorer';
import { 
  LayoutDashboard, 
  Filter, 
  TrendingUp, 
  Pill, 
  Table, 
  FileText,
  Menu,
  X,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with sidebar closed for filter-first layout
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'drugs', label: 'Top Drugs & Areas', icon: Pill },
    { id: 'data', label: 'Raw Data', icon: Table },
    { id: 'citations', label: 'Citations', icon: FileText },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on key combinations, avoid when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Ctrl/Cmd + K = Open advanced filters
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setAdvancedFiltersOpen(true);
      }

      // Escape = Close modals
      if (e.key === 'Escape') {
        setAdvancedFiltersOpen(false);
      }

      // Tab navigation shortcuts (Ctrl/Cmd + 1-5)
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id);
        }
      }

      // Toggle sidebar (Ctrl/Cmd + B)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, tabs]);
  
  return (
    <FilterProvider>
      <div className="min-h-screen bg-white">
        {/* Skip Links for Screen Readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Skip to main content
        </a>
        <a
          href="#filter-bar"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-40 z-50 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Skip to filters
        </a>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 lg:hidden border border-gray-300 rounded-lg"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center gap-3 ml-2 lg:ml-0">
                <div className="h-8 w-8 border-2 border-blue-600 bg-blue-50 flex items-center justify-center rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Synduct Signals</h1>
                  <p className="text-xs text-gray-600">Healthcare Analytics Platform</p>
                </div>
              </div>
            </div>
            
            {/* Desktop Tab Navigation */}
            <nav className="hidden lg:flex items-center space-x-2" role="navigation" aria-label="Main navigation">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-700 hover:bg-blue-50 border-gray-300 bg-white'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  title={`${tab.label} (Ctrl+${tabs.indexOf(tab) + 1})`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Filter Bar - Primary entry point */}
      <div id="filter-bar">
        <FilterBar onAdvancedFiltersOpen={() => setAdvancedFiltersOpen(true)} />
      </div>
      
      <div className="flex">
        {/* Legacy Sidebar - Hidden but preserved */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:static inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 lg:translate-x-0 mt-32 lg:mt-0 shadow-lg lg:shadow-none ${
          !sidebarOpen ? 'lg:-translate-x-full' : ''
        }`}>
          <div className="h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-4 bg-yellow-50 border-b border-yellow-200">
              <p className="text-xs text-yellow-800">
                Legacy filters. Use the filter bar above for new filter experience.
              </p>
            </div>
            <FiltersPanel />
          </div>
        </aside>
        
        {/* Main Content */}
        <main 
          id="main-content"
          className={`flex-1 bg-gradient-to-br from-gray-50 to-white transition-all duration-200 ${
            sidebarOpen ? 'lg:ml-0' : ''
          }`}
          role="main"
          aria-label="Dashboard content"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden mb-4 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap border ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                <SuggestedFilters />
                
                {/* KPIs Section */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Key Metrics</h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                  </div>
                  <OverviewCards />
                </section>

                {/* Analytics Section */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Main Chart Area */}
                  <div className="xl:col-span-2 space-y-8">
                    <div data-section="trends" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <TrendsChart />
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <EmergingSignals />
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <TopDrugsAreas />
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <CitationExplorer />
                    </div>
                  </div>
                </section>

                {/* Geographic Section */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Geographic Distribution</h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <GeoHeatcardsGrid />
                  </div>
                </section>
              </>
            )}
            
            {activeTab === 'trends' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <TrendsChart />
              </div>
            )}
            
            {activeTab === 'drugs' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <TopDrugsAreas />
              </div>
            )}
            
            {activeTab === 'data' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable />
              </div>
            )}
            
            {activeTab === 'citations' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <CitationExplorer />
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
      />
      
      {/* Keyboard Shortcuts Indicator */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <span>⌘K</span>
            <span className="text-gray-300">Filters</span>
            <span className="text-gray-500">•</span>
            <span>⌘1-5</span>
            <span className="text-gray-300">Tabs</span>
          </div>
        </div>
      </div>
      </div>
    </FilterProvider>
  );
}