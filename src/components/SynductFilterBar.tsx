"use client";

import { useState } from "react";
import { useFilters } from "@/store/filters";
import type { RegionKey, TherapeuticArea, Specialty, DataSourceType, AgeGroup, Gender } from "@/lib/types";

const REGIONS: RegionKey[] = ["Global", "Southern Europe", "Italy", "Spain", "Portugal"];
const THERAPEUTIC_AREAS: TherapeuticArea[] = ["Oncology", "Cardiology", "Neurology"];
const SPECIALTIES: Specialty[] = ["Oncologist", "Radiologist", "Pathologist", "Internal Medicine"];
const DATA_TYPES: DataSourceType[] = ["Guideline", "Research", "DrugDB", "ClinicalTrial"];
const AGE_GROUPS: AgeGroup[] = ["child", "adolescent", "adult", "elderly"];
const GENDERS: Gender[] = ["male", "female", "both"];
const SAMPLE_DRUGS = ["Pembrolizumab", "Nivolumab", "Durvalumab", "Atezolizumab", "Bevacizumab", "Trastuzumab"];

export default function SynductFilterBar() {
  const { filters, setFilters, reset, saveScenario, loadScenario, listScenarios } = useFilters();
  const [showScenarios, setShowScenarios] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  
  const handleRegionChange = (region: RegionKey, checked: boolean) => {
    const newRegions = checked 
      ? [...filters.region, region]
      : filters.region.filter(r => r !== region);
    setFilters({ region: newRegions });
  };

  const handleTherapeuticAreaChange = (area: TherapeuticArea, checked: boolean) => {
    const newAreas = checked 
      ? [...filters.therapeuticAreas, area]
      : filters.therapeuticAreas.filter(a => a !== area);
    setFilters({ therapeuticAreas: newAreas });
  };

  const handleDrugChange = (drug: string, checked: boolean) => {
    const newDrugs = checked 
      ? [...filters.drugs, drug]
      : filters.drugs.filter(d => d !== drug);
    setFilters({ drugs: newDrugs });
  };

  const handleSpecialtyChange = (specialty: Specialty, checked: boolean) => {
    const newSpecialties = checked 
      ? [...filters.specialties, specialty]
      : filters.specialties.filter(s => s !== specialty);
    setFilters({ specialties: newSpecialties });
  };

  const handleDataTypeChange = (dataType: DataSourceType, checked: boolean) => {
    const newDataTypes = checked 
      ? [...filters.dataTypes, dataType]
      : filters.dataTypes.filter(dt => dt !== dataType);
    setFilters({ dataTypes: newDataTypes });
  };

  const handleAgeGroupChange = (ageGroup: AgeGroup, checked: boolean) => {
    const newAgeGroups = checked 
      ? [...filters.ageGroups, ageGroup]
      : filters.ageGroups.filter(ag => ag !== ageGroup);
    setFilters({ ageGroups: newAgeGroups });
  };

  const handleGenderChange = (gender: Gender, checked: boolean) => {
    const newGenders = checked 
      ? [...filters.genders, gender]
      : filters.genders.filter(g => g !== gender);
    setFilters({ genders: newGenders });
  };

  const handleSaveScenario = () => {
    if (scenarioName.trim()) {
      saveScenario(scenarioName.trim());
      setScenarioName("");
      setShowScenarios(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-6 mb-6">
        
        {/* Regions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Regions</h4>
          <div className="space-y-2">
            {REGIONS.map(region => (
              <label key={region} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.region.includes(region)}
                  onChange={(e) => handleRegionChange(region, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600">{region}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Therapeutic Areas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Therapeutic Areas</h4>
          <div className="space-y-2">
            {THERAPEUTIC_AREAS.map(area => (
              <label key={area} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.therapeuticAreas.includes(area)}
                  onChange={(e) => handleTherapeuticAreaChange(area, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600">{area}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Drugs */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Drugs</h4>
          <div className="space-y-2">
            {SAMPLE_DRUGS.map(drug => (
              <label key={drug} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.drugs.includes(drug)}
                  onChange={(e) => handleDrugChange(drug, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600">{drug}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Specialties</h4>
          <div className="space-y-2">
            {SPECIALTIES.map(specialty => (
              <label key={specialty} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.specialties.includes(specialty)}
                  onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600">{specialty}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Data Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Data Types</h4>
          <div className="space-y-2">
            {DATA_TYPES.map(dataType => (
              <label key={dataType} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.dataTypes.includes(dataType)}
                  onChange={(e) => handleDataTypeChange(dataType, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600">{dataType}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Groups */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Age Groups</h4>
          <div className="space-y-2">
            {AGE_GROUPS.map(ageGroup => (
              <label key={ageGroup} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.ageGroups.includes(ageGroup)}
                  onChange={(e) => handleAgeGroupChange(ageGroup, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600 capitalize">{ageGroup}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Genders */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Gender</h4>
          <div className="space-y-2">
            {GENDERS.map(gender => (
              <label key={gender} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.genders.includes(gender)}
                  onChange={(e) => handleGenderChange(gender, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-600 capitalize">{gender}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Date Range</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={filters.timeRange.from.split('T')[0]}
                onChange={(e) => setFilters({ 
                  timeRange: { 
                    ...filters.timeRange, 
                    from: new Date(e.target.value).toISOString() 
                  }
                })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={filters.timeRange.to.split('T')[0]}
                onChange={(e) => setFilters({ 
                  timeRange: { 
                    ...filters.timeRange, 
                    to: new Date(e.target.value).toISOString() 
                  }
                })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <button 
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
        
        <button 
          onClick={() => setShowScenarios(!showScenarios)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Scenarios
        </button>
      </div>

      {showScenarios && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Scenario Management</h4>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Scenario name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={handleSaveScenario}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Save Current
            </button>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Saved Scenarios:</h5>
            <div className="space-y-1">
              {listScenarios().map(name => (
                <button
                  key={name}
                  onClick={() => {
                    loadScenario(name);
                    setShowScenarios(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {name}
                </button>
              ))}
              {listScenarios().length === 0 && (
                <p className="text-sm text-gray-500 italic">No saved scenarios</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}