'use client';

import { useState } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { 
  Search, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  ChevronRight,
  Lightbulb,
  Target,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

interface InsightQuestion {
  id: string;
  category: string;
  question: string;
  icon: any;
  filters: any;
  metrics: string[];
  difficulty: 'easy' | 'medium' | 'advanced';
}

export default function InsightsDiscovery() {
  const { setPartial, clearAll } = useFilters();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const insightQuestions: InsightQuestion[] = [
    // Brand Performance
    {
      id: 'brand-1',
      category: 'Brand Performance',
      question: 'How is my drug performing compared to last quarter?',
      icon: TrendingUp,
      filters: {
        dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
      },
      metrics: ['Q&A Volume', 'Citation Count', 'Geographic Spread'],
      difficulty: 'easy'
    },
    {
      id: 'brand-2',
      category: 'Brand Performance',
      question: 'Which specialties are most engaged with my drug?',
      icon: Users,
      filters: {},
      metrics: ['Specialty Distribution', 'Engagement Rate', 'Question Patterns'],
      difficulty: 'easy'
    },
    {
      id: 'brand-3',
      category: 'Brand Performance',
      question: 'What are the adoption barriers in specific regions?',
      icon: AlertTriangle,
      filters: {},
      metrics: ['Regional Variations', 'Question Themes', 'Concern Patterns'],
      difficulty: 'advanced'
    },

    // Competitive Intelligence
    {
      id: 'comp-1',
      category: 'Competitive Intelligence',
      question: 'Which competitor drugs are gaining physician interest?',
      icon: Target,
      filters: {},
      metrics: ['Mention Trends', 'Share of Voice', 'Growth Rate'],
      difficulty: 'medium'
    },
    {
      id: 'comp-2',
      category: 'Competitive Intelligence',
      question: 'How does my drug compare in citation quality?',
      icon: BookOpen,
      filters: {},
      metrics: ['Citation Quality', 'Journal Impact', 'Author Authority'],
      difficulty: 'advanced'
    },

    // Market Opportunities
    {
      id: 'market-1',
      category: 'Market Opportunities',
      question: 'Which countries show growing interest in my therapeutic area?',
      icon: MapPin,
      filters: {},
      metrics: ['Geographic Growth', 'Emerging Markets', 'Adoption Curves'],
      difficulty: 'medium'
    },
    {
      id: 'market-2',
      category: 'Market Opportunities',
      question: 'What unmet needs are physicians expressing?',
      icon: Lightbulb,
      filters: {},
      metrics: ['Question Analysis', 'Gap Identification', 'Need Patterns'],
      difficulty: 'advanced'
    },

    // Educational Needs
    {
      id: 'edu-1',
      category: 'Educational Needs',
      question: 'What are the most common physician questions?',
      icon: Search,
      filters: {},
      metrics: ['Question Frequency', 'Topic Clusters', 'Knowledge Gaps'],
      difficulty: 'easy'
    },
    {
      id: 'edu-2',
      category: 'Educational Needs',
      question: 'Which topics need more educational content?',
      icon: BookOpen,
      filters: {},
      metrics: ['Content Gaps', 'Question Complexity', 'Repeat Queries'],
      difficulty: 'medium'
    },

    // Temporal Patterns
    {
      id: 'temp-1',
      category: 'Temporal Patterns',
      question: 'When do physicians most actively seek information?',
      icon: Calendar,
      filters: {},
      metrics: ['Time Patterns', 'Seasonal Trends', 'Peak Periods'],
      difficulty: 'medium'
    },
  ];

  const categories = [
    { name: 'Brand Performance', icon: TrendingUp, color: 'blue' },
    { name: 'Competitive Intelligence', icon: Target, color: 'primary' },
    { name: 'Market Opportunities', icon: MapPin, color: 'primary' },
    { name: 'Educational Needs', icon: BookOpen, color: 'primary' },
    { name: 'Temporal Patterns', icon: Calendar, color: 'primary' }
  ];

  const filteredQuestions = insightQuestions.filter(q => {
    const matchesSearch = searchTerm === '' || 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.metrics.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || q.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const applyInsightFilters = (question: InsightQuestion) => {
    clearAll(false);
    setTimeout(() => {
      setPartial(question.filters);
    }, 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Lightbulb className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Insights Discovery</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Explore key questions you can answer with your data
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search insights... (e.g., 'competitor', 'adoption', 'trends')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              !selectedCategory 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === cat.name
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredQuestions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredQuestions.map(question => (
              <div
                key={question.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => applyInsightFilters(question)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-100 transition-colors">
                    <question.icon className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                        {question.question}
                      </h4>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{question.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {question.metrics.map((metric, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No insights found matching your search</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Help */}
      <div className="p-4 bg-primary-50 border-t border-primary-100">
        <p className="text-xs text-primary-800">
          <strong>Tip:</strong> Click any question to instantly apply relevant filters and see the answer in your dashboard.
        </p>
      </div>
    </div>
  );
}