'use client';

import { useState, useEffect } from 'react';
import { X, Target, Lightbulb, TrendingUp, Users, Map, ChevronRight, Play } from 'lucide-react';

export default function WelcomeExperience({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('synduct_welcome_seen');
    if (hasSeenWelcome === 'true') {
      setShowWelcome(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('synduct_welcome_seen', 'true');
    setShowWelcome(false);
    onComplete();
  };

  const insights = [
    {
      icon: Target,
      title: "Track Drug Engagement",
      description: "See how doctors are discussing and prescribing your drugs across regions and specialties"
    },
    {
      icon: Lightbulb,
      title: "Identify Knowledge Gaps",
      description: "Discover what questions physicians are asking about treatments and conditions"
    },
    {
      icon: TrendingUp,
      title: "Spot Emerging Trends",
      description: "Get alerts on sudden changes in physician interest or competitive drug mentions"
    },
    {
      icon: Map,
      title: "Geographic Analysis",
      description: "Compare adoption patterns and interest levels across different countries and regions"
    }
  ];

  const userJourneys = [
    {
      role: "Brand Manager",
      question: "How is my drug performing vs competitors?",
      steps: ["Filter by your drug", "Compare with therapeutic area trends", "Export insights for presentation"]
    },
    {
      role: "Medical Affairs",
      question: "What are doctors asking about?",
      steps: ["View citations & questions", "Filter by specialty", "Identify education opportunities"]
    },
    {
      role: "Market Access",
      question: "Where should we focus expansion?",
      steps: ["Analyze geographic heatmaps", "Compare regional engagement", "Export data for strategy"]
    }
  ];

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Synduct Signals</h1>
              <p className="text-primary-100 text-lg">
                Transform physician interactions into actionable pharmaceutical insights
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {step === 0 && (
            <div className="space-y-8">
              {/* What You Can Discover */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-primary-600">💡</span> What You Can Discover
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-primary-100 p-2 rounded-lg h-fit">
                        <insight.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Journey */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-primary-600">🎯</span> Choose Your Journey
                </h2>
                <div className="space-y-3">
                  {userJourneys.map((journey, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-1 bg-primary-100 text-primary-700 rounded">
                              {journey.role}
                            </span>
                            <p className="text-sm font-medium text-gray-900">{journey.question}</p>
                          </div>
                          <div className="flex gap-2 items-center text-xs text-gray-600">
                            {journey.steps.map((step, stepIdx) => (
                              <span key={stepIdx} className="flex items-center gap-1">
                                <span>{step}</span>
                                {stepIdx < journey.steps.length - 1 && <ChevronRight className="h-3 w-3" />}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Start */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Start Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-0.5">•</span>
                    <span>Use <kbd className="px-2 py-0.5 bg-white rounded text-xs">⌘K</kbd> to quickly access advanced filters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-0.5">•</span>
                    <span>Click on any metric card to instantly filter by that value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-0.5">•</span>
                    <span>Export filtered data as CSV/Excel for deeper analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 flex justify-between items-center border-t">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              onChange={(e) => {
                if (e.target.checked) {
                  localStorage.setItem('synduct_welcome_seen', 'true');
                }
              }}
            />
            Don&apos;t show this again
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => window.open('https://docs.synduct.com', '_blank')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              View Documentation
            </button>
            <button
              onClick={handleDismiss}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}