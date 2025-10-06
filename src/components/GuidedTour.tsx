'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

export default function GuidedTour({ onComplete }: { onComplete?: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      target: '.tour-dashboard-header',
      title: 'Welcome to Synduct Signals',
      content: 'This dashboard transforms physician interactions into actionable pharmaceutical insights. Let me show you around.',
      position: 'bottom'
    },
    {
      id: 'filters',
      target: '.tour-filter-bar',
      title: 'Smart Filtering',
      content: 'Use these filters to focus on specific drugs, companies, therapeutic areas, and time periods. Start broad, then narrow down.',
      position: 'bottom',
      action: 'Try selecting a drug or therapeutic area'
    },
    {
      id: 'metrics',
      target: '.tour-overview-cards',
      title: 'Key Performance Indicators',
      content: 'These cards show your most important metrics at a glance. Click any card to filter by that value instantly.',
      position: 'bottom'
    },
    {
      id: 'templates',
      target: '.tour-use-case-templates',
      title: 'Quick Start Templates',
      content: 'Pre-configured analyses for common pharma use cases. Perfect for brand managers, medical affairs, and market access teams.',
      position: 'top'
    },
    {
      id: 'insights',
      target: '.tour-insights-discovery',
      title: 'Discover Insights',
      content: 'Browse key questions you can answer with your data. Click any question to instantly see the answer.',
      position: 'top'
    },
    {
      id: 'trends',
      target: '.tour-trends-chart',
      title: 'Trend Analysis',
      content: 'Visualize engagement patterns over time. Identify spikes, drops, and seasonal variations in physician interest.',
      position: 'top'
    },
    {
      id: 'signals',
      target: '.tour-emerging-signals',
      title: 'Emerging Signals',
      content: 'Get alerted to sudden changes in the data - new competitor mentions, safety concerns, or rising interest in specific topics.',
      position: 'top'
    },
    {
      id: 'geography',
      target: '.tour-geo-heatcards',
      title: 'Geographic Intelligence',
      content: 'See how engagement varies by country and region. Identify expansion opportunities and regional differences.',
      position: 'top'
    },
    {
      id: 'export',
      target: '.tour-data-export',
      title: 'Export & Share',
      content: 'Export filtered data as CSV or Excel for deeper analysis. Share insights with your team or include in presentations.',
      position: 'left'
    },
    {
      id: 'shortcuts',
      target: '.tour-keyboard-shortcuts',
      title: 'Power User Tips',
      content: 'Use keyboard shortcuts for faster navigation. Press ⌘K for advanced filters, ⌘1-4 to switch tabs quickly.',
      position: 'left'
    }
  ];

  useEffect(() => {
    const tourSeen = localStorage.getItem('synduct_tour_completed');
    if (!tourSeen) {
      setTimeout(() => {
        setIsActive(true);
      }, 2000); // Show tour after 2 seconds
    }
  }, []);

  useEffect(() => {
    if (isActive && tourSteps[currentStep]) {
      highlightElement(tourSteps[currentStep].target);
    }
  }, [isActive, currentStep]);

  const highlightElement = (selector: string) => {
    if (highlightedElement) {
      highlightedElement.style.position = '';
      highlightedElement.style.zIndex = '';
      highlightedElement.style.boxShadow = '';
    }

    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.style.position = 'relative';
      element.style.zIndex = '1001';
      element.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5)';
      setHighlightedElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('synduct_tour_completed', 'true');
    setIsActive(false);
    if (highlightedElement) {
      highlightedElement.style.position = '';
      highlightedElement.style.zIndex = '';
      highlightedElement.style.boxShadow = '';
    }
    onComplete?.();
  };

  const skipTour = () => {
    completeTour();
  };

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  if (!isActive) {
    return (
      <button
        onClick={startTour}
        className="fixed bottom-6 left-6 z-30 bg-primary-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-primary-700 transition-all hover:scale-105 flex items-center gap-2"
        aria-label="Start guided tour"
      >
        <Compass className="h-5 w-5" />
        <span className="text-sm font-medium">Take a Tour</span>
      </button>
    );
  }

  const step = tourSteps[currentStep];
  if (!step) return null;

  const getPositionStyles = () => {
    const element = document.querySelector(step.target);
    if (!element) return {};

    const rect = element.getBoundingClientRect();
    const tooltip = { width: 320, height: 200 }; // Approximate tooltip size

    switch(step.position) {
      case 'top':
        return {
          top: rect.top - tooltip.height - 20,
          left: rect.left + (rect.width / 2) - (tooltip.width / 2)
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + (rect.width / 2) - (tooltip.width / 2)
        };
      case 'left':
        return {
          top: rect.top + (rect.height / 2) - (tooltip.height / 2),
          left: rect.left - tooltip.width - 20
        };
      case 'right':
        return {
          top: rect.top + (rect.height / 2) - (tooltip.height / 2),
          left: rect.right + 20
        };
      default:
        return {};
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[1000]" onClick={skipTour} />

      {/* Tour Tooltip */}
      <div
        className="fixed z-[1002] bg-white rounded-xl shadow-2xl p-6 w-80 animate-in slide-in-from-bottom duration-300"
        style={getPositionStyles()}
      >
        {/* Progress */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-medium text-gray-500">
            Step {currentStep + 1} of {tourSteps.length}
          </span>
          <button
            onClick={skipTour}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close tour"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{step.content}</p>
          
          {step.action && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-800">
                💡 Try it: {step.action}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-1">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}