'use client';

import { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  examples?: string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'icon' | 'text';
  className?: string;
}

export default function HelpTooltip({ 
  content, 
  title,
  examples,
  position = 'top',
  variant = 'icon',
  className = ''
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="focus:outline-none"
        aria-label="Help information"
      >
        {variant === 'icon' ? (
          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
        ) : (
          <span className="text-sm text-blue-600 hover:text-blue-700 underline cursor-help">
            Learn more
          </span>
        )}
      </button>

      {isVisible && (
        <div 
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          role="tooltip"
        >
          <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl max-w-xs animate-in fade-in duration-200">
            {title && (
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-300" />
                <h4 className="font-semibold text-sm">{title}</h4>
              </div>
            )}
            <p className="text-sm text-gray-100 leading-relaxed">{content}</p>
            
            {examples && examples.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs font-medium text-gray-300 mb-1">Examples:</p>
                <ul className="space-y-0.5">
                  {examples.map((example, idx) => (
                    <li key={idx} className="text-xs text-gray-200 flex items-start gap-1">
                      <span className="text-blue-300 mt-0.5">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
              style={{
                borderTopColor: position === 'bottom' ? '#111827' : 'transparent',
                borderBottomColor: position === 'top' ? '#111827' : 'transparent',
                borderLeftColor: position === 'right' ? '#111827' : 'transparent',
                borderRightColor: position === 'left' ? '#111827' : 'transparent',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}