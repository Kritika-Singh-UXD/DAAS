'use client';

import { useFilters } from '@/hooks/useFilters';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Target,
  TrendingUp,
  Users,
  ChevronRight,
  Lightbulb,
  MousePointer
} from 'lucide-react';

interface EmptyStateProps {
  type: 'no-filters' | 'no-results' | 'getting-started';
  onAction?: () => void;
}

export default function EmptyStates({ type, onAction }: EmptyStateProps) {
  const { setPartial, clearAll } = useFilters();

  const quickActions = [
    {
      icon: Target,
      title: "Compare top drugs",
      description: "See Keytruda vs Opdivo performance",
      action: () => setPartial({ 
        drug: ['Keytruda', 'Opdivo'],
        therapeuticArea: ['Oncology']
      })
    },
    {
      icon: TrendingUp,
      title: "View trending topics",
      description: "Last 30 days activity",
      action: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        setPartial({ 
          dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0]
        });
      }
    },
    {
      icon: Users,
      title: "Analyze by specialty",
      description: "Focus on Cardiology insights",
      action: () => setPartial({ 
        specialty: ['Cardiology']
      })
    }
  ];

  if (type === 'getting-started') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-gray-200 p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome! Let&apos;s Find Your First Insight
          </h2>
          
          <p className="text-gray-600 mb-8">
            This dashboard shows real physician interactions about drugs, treatments, and clinical questions.
            Start by choosing what you want to analyze:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <action.icon className="h-6 w-6 text-blue-600" />
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              <span>Click any option above</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Or use filters at the top</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <Search className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Data Matches Your Filters
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your current filter combination returned no results. This could mean:
          </p>

          <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>The drug/company combination doesn&apos;t exist in our data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>The date range is too restrictive</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>The geographic region has limited data</span>
            </li>
          </ul>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => clearAll(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={onAction}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Modify Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: no-filters state
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
          <Lightbulb className="h-6 w-6 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Start Your Analysis
        </h3>
        
        <p className="text-gray-600 mb-6">
          You&apos;re viewing all available data. Apply filters to focus on specific insights:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">By Drug</p>
            <p className="text-xs text-gray-500 mt-1">Compare medications</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">By Region</p>
            <p className="text-xs text-gray-500 mt-1">Geographic patterns</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">By Specialty</p>
            <p className="text-xs text-gray-500 mt-1">HCP segments</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="font-medium text-gray-900">By Time</p>
            <p className="text-xs text-gray-500 mt-1">Trend analysis</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          💡 Pro tip: Use the templates above for pre-configured pharmaceutical use cases
        </p>
      </div>
    </div>
  );
}