'use client';

import { useState } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Globe, 
  Microscope,
  BarChart3,
  ChevronRight,
  Sparkles,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  filters: any;
  expectedInsights: string[];
  timeEstimate: string;
}

export default function UseCaseTemplates() {
  const { setPartial, clearAll } = useFilters();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const templates: Template[] = [
    {
      id: 'competitive-analysis',
      title: 'Competitive Drug Analysis',
      description: 'Compare your drug performance against competitors in the same therapeutic area',
      icon: Target,
      category: 'Brand Management',
      filters: {
        therapeuticArea: ['Oncology'],
        dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      },
      expectedInsights: [
        'Market share trends',
        'Physician preference shifts',
        'Regional adoption patterns',
        'Competitive positioning'
      ],
      timeEstimate: '5 min'
    },
    {
      id: 'launch-readiness',
      title: 'New Product Launch Tracker',
      description: 'Monitor early adoption signals and physician interest for recently launched drugs',
      icon: TrendingUp,
      category: 'Launch Strategy',
      filters: {
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      },
      expectedInsights: [
        'Early adopter specialties',
        'Geographic uptake',
        'Question patterns',
        'Citation trends'
      ],
      timeEstimate: '3 min'
    },
    {
      id: 'kol-identification',
      title: 'KOL & Influencer Discovery',
      description: 'Identify key opinion leaders based on citation patterns and specialty engagement',
      icon: Users,
      category: 'Medical Affairs',
      filters: {
        specialty: ['Cardiology', 'Internal Medicine'],
        profession: ['Physician'],
      },
      expectedInsights: [
        'High-engagement specialties',
        'Citation leaders',
        'Geographic influencers',
        'Topic experts'
      ],
      timeEstimate: '4 min'
    },
    {
      id: 'geographic-expansion',
      title: 'Market Expansion Analysis',
      description: 'Evaluate regional differences to prioritize market entry or expansion',
      icon: Globe,
      category: 'Market Access',
      filters: {
        country: ['Germany', 'France', 'UK'],
      },
      expectedInsights: [
        'Regional demand signals',
        'Adoption barriers',
        'Competitive landscape',
        'Growth opportunities'
      ],
      timeEstimate: '6 min'
    },
    {
      id: 'safety-monitoring',
      title: 'Safety Signal Detection',
      description: 'Monitor physician questions and concerns about drug safety and side effects',
      icon: AlertCircle,
      category: 'Pharmacovigilance',
      filters: {
        // Would filter for safety-related keywords if available
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      },
      expectedInsights: [
        'Safety concerns',
        'Adverse event patterns',
        'Risk communication needs',
        'Educational gaps'
      ],
      timeEstimate: '5 min'
    },
    {
      id: 'educational-gaps',
      title: 'Education Need Analysis',
      description: 'Identify knowledge gaps and educational opportunities from physician questions',
      icon: Microscope,
      category: 'Medical Education',
      filters: {
        specialty: ['Oncology'],
        profession: ['Physician', 'Nurse Practitioner'],
      },
      expectedInsights: [
        'Common questions',
        'Knowledge gaps',
        'Training priorities',
        'Content opportunities'
      ],
      timeEstimate: '4 min'
    }
  ];

  const applyTemplate = (template: Template) => {
    clearAll(false);
    setTimeout(() => {
      setPartial(template.filters);
      setSelectedTemplate(template.id);
    }, 100);
  };

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Start Templates</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Pre-configured analyses for common pharmaceutical use cases
              </p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  !selectedTemplate 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Templates
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 hover:border-primary-300 transition-all cursor-pointer ${
                    selectedTemplate === template.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      selectedTemplate === template.id
                        ? 'bg-primary-200'
                        : 'bg-gray-100'
                    }`}>
                      <template.icon className={`h-5 w-5 ${
                        selectedTemplate === template.id
                          ? 'text-primary-700'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{template.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <BarChart3 className="h-3 w-3" />
                      <span>{template.category}</span>
                      <span className="text-gray-300">•</span>
                      <Clock className="h-3 w-3" />
                      <span>{template.timeEstimate}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-1">Expected Insights:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.expectedInsights.slice(0, 3).map((insight, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                          >
                            {insight}
                          </span>
                        ))}
                        {template.expectedInsights.length > 3 && (
                          <span className="text-xs px-2 py-0.5 text-gray-500">
                            +{template.expectedInsights.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedTemplate === template.id && (
                    <div className="mt-3 pt-3 border-t border-primary-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary-700">Template Applied</span>
                        <ChevronRight className="h-4 w-4 text-primary-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary-900 mb-1">How to use templates:</p>
                  <ol className="text-primary-800 space-y-1">
                    <li>1. Click a template to apply pre-configured filters</li>
                    <li>2. View the resulting insights in the dashboard below</li>
                    <li>3. Further refine filters or export data as needed</li>
                    <li>4. Save custom filter combinations for future use</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}