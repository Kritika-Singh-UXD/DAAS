'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { useDashboardStore } from '@/store/dashboardStore';
import { FilterState } from '@/types';

interface FilterPreset {
  id: string;
  name: string;
  state: FilterState;
  updatedAt: string;
}

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedFiltersModal({ isOpen, onClose }: AdvancedFiltersModalProps) {
  const { filters, setPartial } = useFilters();
  const { data } = useDashboardStore();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [lastUsedPreset, setLastUsedPreset] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('synduct-filter-presets');
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    }
    const lastUsed = localStorage.getItem('synduct-last-used-preset');
    if (lastUsed) {
      setLastUsedPreset(lastUsed);
    }
  }, []);

  // Update local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      // Focus management
      setTimeout(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, filters]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Extract unique values for filters
  const uniqueCountries = [...new Set(data.map(d => d.country))].sort();
  const uniqueSpecialties = [...new Set(data.map(d => d.specialty))].sort();
  const uniqueProfessions = [...new Set(data.map(d => d.professionalRole))].sort();
  const uniqueAgeGroups = [...new Set(data.map(d => d.predictedAgeGroup))];
  const uniqueGenders = [...new Set(data.map(d => d.predictedGender))];

  const MultiSelect = ({ 
    label, 
    options, 
    selected = [], 
    onChange 
  }: { 
    label: string;
    options: string[]; 
    selected?: string[]; 
    onChange: (values: string[]) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1 min-h-[28px] p-2 border border-gray-300 rounded-md bg-gray-50">
          {selected.length > 0 ? (
            selected.map(value => (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
              >
                {value}
                <button
                  onClick={() => onChange(selected.filter(v => v !== value))}
                  className="hover:bg-blue-200 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No {label.toLowerCase()} selected</span>
          )}
        </div>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value=""
          onChange={(e) => {
            if (e.target.value && !selected.includes(e.target.value)) {
              onChange([...selected, e.target.value]);
            }
          }}
        >
          <option value="">Add {label.toLowerCase()}...</option>
          {options
            .filter(opt => !selected.includes(opt))
            .map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
        </select>
      </div>
    </div>
  );

  const handleApply = () => {
    setPartial(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleCancel = () => {
    setLocalFilters(filters);
    onClose();
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      state: localFilters,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('synduct-filter-presets', JSON.stringify(updatedPresets));
    localStorage.setItem('synduct-last-used-preset', newPreset.name);
    setLastUsedPreset(newPreset.name);
    setPresetName('');
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setLocalFilters(preset.state);
    localStorage.setItem('synduct-last-used-preset', preset.name);
    setLastUsedPreset(preset.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleApply();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 rounded-xl shadow-2xl"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
          <button
            ref={firstFocusableRef}
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-md"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div id="modal-description" className="px-6 py-4 space-y-6">
          {/* Presets Section */}
          {presets.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Saved Presets</h3>
              <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className={`px-3 py-2 text-sm border rounded-md hover:bg-gray-50 ${
                      preset.name === lastUsedPreset
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {preset.name}
                    {preset.name === lastUsedPreset && (
                      <span className="ml-1 text-xs">(Last used)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Demographics Section */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiSelect
                label="Age Groups"
                options={uniqueAgeGroups}
                selected={localFilters.ageGroup}
                onChange={(values) => setLocalFilters({ ...localFilters, ageGroup: values })}
              />
              <MultiSelect
                label="Gender"
                options={uniqueGenders}
                selected={localFilters.gender}
                onChange={(values) => setLocalFilters({ ...localFilters, gender: values })}
              />
            </div>
          </div>

          {/* Geography Section */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Geography</h3>
            <MultiSelect
              label="Countries"
              options={uniqueCountries}
              selected={localFilters.country}
              onChange={(values) => setLocalFilters({ ...localFilters, country: values })}
            />
          </div>

          {/* Clinical Section */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Clinical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiSelect
                label="Specialties"
                options={uniqueSpecialties}
                selected={localFilters.specialty}
                onChange={(values) => setLocalFilters({ ...localFilters, specialty: values })}
              />
              <MultiSelect
                label="Professions"
                options={uniqueProfessions}
                selected={localFilters.profession}
                onChange={(values) => setLocalFilters({ ...localFilters, profession: values })}
              />
            </div>
          </div>

          {/* Save Preset Section */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Save Current Filters</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-md"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}