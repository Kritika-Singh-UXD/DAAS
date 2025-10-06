'use client';

import { useState, useEffect } from 'react';
import OverviewCards from '@/components/OverviewCards';
import FilterBar from '@/components/FilterBar';
import FilterProvider from '@/components/FilterProvider';
import AdvancedFiltersModal from '@/components/AdvancedFiltersModal';
import TrendsChart from '@/components/TrendsChart';
import EmergingSignals from '@/components/EmergingSignals';
import GeoHeatcardsGrid from '@/components/GeoHeatcardsGrid';
import SuggestedFilters from '@/components/SuggestedFilters';
import DataTable from '@/components/DataTable';
import CitationExplorer from '@/components/CitationExplorer';
import WelcomeExperience from '@/components/WelcomeExperience';
import UseCaseTemplates from '@/components/UseCaseTemplates';
import InsightsDiscovery from '@/components/InsightsDiscovery';
import GuidedTour from '@/components/GuidedTour';
import HelpTooltip from '@/components/HelpTooltip';
import DataContext from '@/components/DataContext';
import EmptyStates from '@/components/EmptyStates';
import NarrativeInsights from '@/components/NarrativeInsights';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Table, 
  FileText,
  Activity,
  HelpCircle
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('synduct_welcome_seen');
    const hasUsedDashboard = localStorage.getItem('synduct_dashboard_used');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
    if (hasUsedDashboard) {
      setIsFirstVisit(false);
    }
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
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

      // Tab navigation shortcuts (Ctrl/Cmd + 1-4)
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tabs]);
  
  return (
    <FilterProvider>
      <div className="min-h-screen bg-white">
        {/* Skip Links for Screen Readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-primary-600 text-white px-4 py-2 rounded"
        >
          Skip to main content
        </a>
        <a
          href="#filter-bar"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-40 z-50 bg-primary-600 text-white px-4 py-2 rounded"
        >
          Skip to filters
        </a>
      {/* Welcome Experience Modal */}
      {showWelcome && (
        <WelcomeExperience onComplete={() => setShowWelcome(false)} />
      )}

      {/* Guided Tour */}
      <GuidedTour onComplete={() => console.log('Tour completed')} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 tour-dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 border-2 border-primary-600 bg-primary-50 flex items-center justify-center rounded-lg">
                <Activity className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Synduct Signals</h1>
                  <p className="text-xs text-gray-600">Real-Time Physician Insights Dashboard</p>
                </div>
                <HelpTooltip 
                  title="About Synduct Signals"
                  content="Transforms anonymized physician interactions from DR.INFO into actionable pharmaceutical insights. Track drug engagement, identify trends, and discover market opportunities."
                  examples={[
                    "Monitor drug performance across regions",
                    "Identify emerging physician questions",
                    "Track competitive landscape changes"
                  ]}
                  position="bottom"
                />
              </div>
            </div>
            
            {/* Desktop Tab Navigation */}
            <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-primary-50'
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
      
      {/* Enhanced Filter Bar */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-16 z-30 tour-filter-bar">
        <FilterBar onAdvancedFiltersOpen={() => setAdvancedFiltersOpen(true)} />
      </div>

      {/* Data Context Bar - Shows what data is being analyzed */}
      <DataContext />
      
      {/* Mobile Tab Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 py-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-primary-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main 
        id="main-content"
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
        role="main"
        aria-label="Dashboard content"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* First Visit Experience */}
                {isFirstVisit && (
                  <EmptyStates 
                    type="getting-started" 
                    onAction={() => {
                      localStorage.setItem('synduct_dashboard_used', 'true');
                      setIsFirstVisit(false);
                    }}
                  />
                )}

                {/* Use Case Templates - Always show for quick access */}
                <div className="tour-use-case-templates">
                  <UseCaseTemplates />
                </div>

                {/* Narrative Insights - Tell the story of the data */}
                <NarrativeInsights />

                <SuggestedFilters />
                
                {/* KPIs Section */}
                <section className="space-y-6 tour-overview-cards">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-gray-900">Key Metrics</h2>
                    <div className="h-1 flex-1 max-w-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
                    <HelpTooltip
                      content="Click any metric card to instantly filter the dashboard by that value. These KPIs update in real-time based on your selected filters."
                      position="bottom"
                    />
                  </div>
                  <OverviewCards />
                </section>

                {/* Analytics Section */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  {/* Main Chart Area */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden tour-trends-chart">
                      <TrendsChart />
                    </div>
                    
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden tour-emerging-signals">
                      <EmergingSignals />
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div className="space-y-4">
                    {/* Insights Discovery Panel - Always helpful */}
                    <div className="tour-insights-discovery">
                      <InsightsDiscovery />
                    </div>
                    
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                      <CitationExplorer />
                    </div>
                  </div>
                </section>

                {/* Geographic Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-gray-900">Geographic Distribution</h2>
                    <div className="h-1 flex-1 max-w-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"></div>
                    <HelpTooltip
                      content="Compare physician engagement across different countries and regions. Use this to identify market expansion opportunities and regional variations."
                      position="bottom"
                    />
                  </div>
                  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden tour-geo-heatcards">
                    <GeoHeatcardsGrid />
                  </div>
                </section>
              </>
            )}
            
            {activeTab === 'trends' && (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                <TrendsChart />
              </div>
            )}
            
            
            {activeTab === 'data' && (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden tour-data-export">
                <DataTable />
              </div>
            )}
            
            {activeTab === 'citations' && (
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                <CitationExplorer />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Advanced Filters Modal */}
      <AdvancedFiltersModal
        isOpen={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
      />
      
      {/* Keyboard Shortcuts Indicator */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="bg-gray-900 text-white text-xs px-4 py-3 rounded-xl opacity-80 hover:opacity-100 transition-all hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd>
              <span className="text-gray-300">Advanced Filters</span>
            </div>
            <span className="text-gray-600">•</span>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘1-4</kbd>
              <span className="text-gray-300">Switch Tabs</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </FilterProvider>
  );
}