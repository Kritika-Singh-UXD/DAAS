'use client';

import { useState } from 'react';
import { Filter, X, Settings } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { useDashboardStore } from '@/store/dashboardStore';

interface FilterBarProps {
  onAdvancedFiltersOpen: () => void;
}

export default function FilterBar({ onAdvancedFiltersOpen }: FilterBarProps) {
  const { filters, setPartial, clearAll } = useFilters();
  const { data } = useDashboardStore();
  
  // Extract unique values for quick filters
  const uniqueDrugs = [...new Set(data.flatMap(d => d.drugNames))].sort();
  const uniqueCompanies = [...new Set(data.flatMap(d => d.manufacturers || []))].sort();
  const uniqueTherapeuticAreas = [...new Set(data.flatMap(d => d.therapeuticAreas))].sort();

  const QuickMultiSelect = ({ 
    label, 
    options, 
    selected = [], 
    onChange, 
    placeholder 
  }: { 
    label: string;
    options: string[]; 
    selected?: string[]; 
    onChange: (values: string[]) => void;
    placeholder: string;
  }) => (
    <div className="flex-1 min-w-40">
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value=""
        onChange={(e) => {
          if (e.target.value && !selected.includes(e.target.value)) {
            onChange([...selected, e.target.value]);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {options
          .filter(opt => !selected.includes(opt))
          .slice(0, 20) // Limit to 20 options for performance
          .map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
      </select>
    </div>
  );

  const DateRangePicker = () => (
    <div className="min-w-fit">
      <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
      <div className="flex gap-1">
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => setPartial({ dateFrom: e.target.value })}
          className="w-36 px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="self-center text-gray-500 px-1 text-xs">to</span>
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => setPartial({ dateTo: e.target.value })}
          className="w-36 px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 text-blue-800 text-sm rounded-lg shadow-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );

  // Generate filter chips
  const getActiveChips = () => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    
    filters.drug?.forEach(drug => {
      chips.push({
        key: `drug-${drug}`,
        label: `Drug: ${drug}`,
        onRemove: () => setPartial({ drug: filters.drug?.filter(d => d !== drug) })
      });
    });
    
    filters.company?.forEach(company => {
      chips.push({
        key: `company-${company}`,
        label: `Company: ${company}`,
        onRemove: () => setPartial({ company: filters.company?.filter(c => c !== company) })
      });
    });
    
    filters.therapeuticArea?.forEach(area => {
      chips.push({
        key: `ta-${area}`,
        label: `TA: ${area}`,
        onRemove: () => setPartial({ therapeuticArea: filters.therapeuticArea?.filter(ta => ta !== area) })
      });
    });
    
    filters.country?.forEach(country => {
      chips.push({
        key: `country-${country}`,
        label: `Country: ${country}`,
        onRemove: () => setPartial({ country: filters.country?.filter(c => c !== country) })
      });
    });

    filters.specialty?.forEach(specialty => {
      chips.push({
        key: `specialty-${specialty}`,
        label: `Specialty: ${specialty}`,
        onRemove: () => setPartial({ specialty: filters.specialty?.filter(s => s !== specialty) })
      });
    });

    filters.profession?.forEach(profession => {
      chips.push({
        key: `profession-${profession}`,
        label: `Profession: ${profession}`,
        onRemove: () => setPartial({ profession: filters.profession?.filter(p => p !== profession) })
      });
    });

    filters.ageGroup?.forEach(ageGroup => {
      chips.push({
        key: `age-${ageGroup}`,
        label: `Age: ${ageGroup}`,
        onRemove: () => setPartial({ ageGroup: filters.ageGroup?.filter(a => a !== ageGroup) })
      });
    });

    filters.gender?.forEach(gender => {
      chips.push({
        key: `gender-${gender}`,
        label: `Gender: ${gender}`,
        onRemove: () => setPartial({ gender: filters.gender?.filter(g => g !== gender) })
      });
    });
    
    return chips;
  };

  const activeChips = getActiveChips();
  const hasActiveFilters = activeChips.length > 0 || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white shadow-sm">
      {/* Primary Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4 items-end">
          <QuickMultiSelect
            label="Drug"
            options={uniqueDrugs}
            selected={filters.drug}
            onChange={(values) => setPartial({ drug: values })}
            placeholder="Select drug..."
          />
          
          <QuickMultiSelect
            label="Company"
            options={uniqueCompanies}
            selected={filters.company}
            onChange={(values) => setPartial({ company: values })}
            placeholder="Select company..."
          />
          
          <QuickMultiSelect
            label="Therapeutic Area"
            options={uniqueTherapeuticAreas}
            selected={filters.therapeuticArea}
            onChange={(values) => setPartial({ therapeuticArea: values })}
            placeholder="Select therapeutic area..."
          />
          
          <DateRangePicker />
          
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onAdvancedFiltersOpen}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors h-10 whitespace-nowrap shadow-sm"
            >
              <Settings className="h-4 w-4" />
              More Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={() => clearAll(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors h-10"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border-t border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-blue-900 flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Applied filters:
              </span>
              {activeChips.map(chip => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={chip.onRemove}
                />
              ))}
              {(filters.dateFrom || filters.dateTo) && (
                <FilterChip
                  label={`Date: ${filters.dateFrom || '...'} to ${filters.dateTo || '...'}`}
                  onRemove={() => setPartial({ dateFrom: undefined, dateTo: undefined })}
                />
              )}
              <div className="ml-auto">
                <button
                  onClick={() => clearAll(true)}
                  className="text-sm text-blue-700 hover:text-blue-900 font-medium px-3 py-1 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}