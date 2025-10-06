'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useFilters } from '@/hooks/useFilters';
import { ChevronDown, X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FiltersPanel() {
  const { data } = useDashboardStore();
  const { filters, setPartial, clearAll } = useFilters();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  
  // Extract unique values for filters
  const uniqueCountries = [...new Set(data.map(d => d.country))].sort();
  const uniqueSpecialties = [...new Set(data.map(d => d.specialty))].sort();
  const uniqueRoles = [...new Set(data.map(d => d.professionalRole))].sort();
  const uniqueTherapeuticAreas = [...new Set(data.flatMap(d => d.therapeuticAreas))].sort();
  const uniqueDrugs = [...new Set(data.flatMap(d => d.drugNames))].sort();
  const uniqueAgeGroups = [...new Set(data.map(d => d.predictedAgeGroup))];
  const uniqueGenders = [...new Set(data.map(d => d.predictedGender))];
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };
  
  const FilterSection = ({ title, id, children }: { title: string; id: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100"
      >
        <span className="font-medium text-sm text-gray-900">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-600",
            expandedSections.has(id) && "rotate-180"
          )}
        />
      </button>
      {expandedSections.has(id) && (
        <div className="px-4 pb-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
  
  const MultiSelect = ({ 
    options, 
    selected, 
    onChange, 
    placeholder 
  }: { 
    options: string[]; 
    selected: string[]; 
    onChange: (values: string[]) => void;
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
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
          <span className="text-xs text-gray-600">{placeholder}</span>
        )}
      </div>
      <select
        className="w-full px-2 py-1 text-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
        value=""
        onChange={(e) => {
          if (e.target.value && !selected.includes(e.target.value)) {
            onChange([...selected, e.target.value]);
          }
        }}
      >
        <option value="">Add {placeholder.toLowerCase()}...</option>
        {options
          .filter(opt => !selected.includes(opt))
          .map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
      </select>
    </div>
  );
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-blue-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Filters</h3>
        </div>
        <button
          onClick={() => clearAll(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <FilterSection title="Basic Filters" id="basic">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Countries</label>
            <MultiSelect
              options={uniqueCountries}
              selected={filters.country || []}
              onChange={(values) => setPartial({ country: values })}
              placeholder="All countries"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Specialties</label>
            <MultiSelect
              options={uniqueSpecialties}
              selected={filters.specialty || []}
              onChange={(values) => setPartial({ specialty: values })}
              placeholder="All specialties"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Professional Roles</label>
            <MultiSelect
              options={uniqueRoles}
              selected={filters.profession || []}
              onChange={(values) => setPartial({ profession: values })}
              placeholder="All roles"
            />
          </div>
          
        </FilterSection>
        
        <FilterSection title="Clinical Filters" id="clinical">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Therapeutic Areas</label>
            <MultiSelect
              options={uniqueTherapeuticAreas}
              selected={filters.therapeuticArea || []}
              onChange={(values) => setPartial({ therapeuticArea: values })}
              placeholder="All therapeutic areas"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Drug Names</label>
            <MultiSelect
              options={uniqueDrugs}
              selected={filters.drug || []}
              onChange={(values) => setPartial({ drug: values })}
              placeholder="All drugs"
            />
          </div>
        </FilterSection>
        
        <FilterSection title="Demographics" id="demographics">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Age Groups</label>
            <MultiSelect
              options={uniqueAgeGroups}
              selected={filters.ageGroup || []}
              onChange={(values) => setPartial({ ageGroup: values })}
              placeholder="All age groups"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
            <MultiSelect
              options={uniqueGenders}
              selected={filters.gender || []}
              onChange={(values) => setPartial({ gender: values })}
              placeholder="All genders"
            />
          </div>
        </FilterSection>
        
      </div>
    </div>
  );
}