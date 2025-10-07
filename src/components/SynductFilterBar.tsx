"use client";

import { useState } from "react";
import { useFilters } from "@/store/filters";
import type { RegionKey, TherapeuticArea, Specialty, DataSourceType } from "@/lib/types";

const REGIONS: RegionKey[] = ["Global", "Southern Europe", "Italy", "Spain", "Portugal"];
const THERAPEUTIC_AREAS: TherapeuticArea[] = ["Oncology", "Cardiology", "Neurology"];
const SPECIALTIES: Specialty[] = ["Oncologist", "Radiologist", "Pathologist", "Internal Medicine"];
const DATA_TYPES: DataSourceType[] = ["Guideline", "Research", "DrugDB", "ClinicalTrial"];
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

  const handleSaveScenario = () => {
    if (scenarioName.trim()) {
      saveScenario(scenarioName.trim());
      setScenarioName("");
      setShowScenarios(false);
    }
  };

  return (
    <div style={{ 
      border: "1px solid #ccc", 
      padding: 16, 
      marginBottom: 24, 
      borderRadius: 8,
      backgroundColor: "#f9f9f9" 
    }}>
      <h3>Filters</h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
        
        {/* Regions */}
        <div>
          <h4>Regions</h4>
          {REGIONS.map(region => (
            <label key={region} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={filters.region.includes(region)}
                onChange={(e) => handleRegionChange(region, e.target.checked)}
              />
              {" "}{region}
            </label>
          ))}
        </div>

        {/* Therapeutic Areas */}
        <div>
          <h4>Therapeutic Areas</h4>
          {THERAPEUTIC_AREAS.map(area => (
            <label key={area} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={filters.therapeuticAreas.includes(area)}
                onChange={(e) => handleTherapeuticAreaChange(area, e.target.checked)}
              />
              {" "}{area}
            </label>
          ))}
        </div>

        {/* Drugs */}
        <div>
          <h4>Drugs</h4>
          {SAMPLE_DRUGS.map(drug => (
            <label key={drug} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={filters.drugs.includes(drug)}
                onChange={(e) => handleDrugChange(drug, e.target.checked)}
              />
              {" "}{drug}
            </label>
          ))}
        </div>

        {/* Specialties */}
        <div>
          <h4>Specialties</h4>
          {SPECIALTIES.map(specialty => (
            <label key={specialty} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={filters.specialties.includes(specialty)}
                onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
              />
              {" "}{specialty}
            </label>
          ))}
        </div>

        {/* Data Types */}
        <div>
          <h4>Data Types</h4>
          {DATA_TYPES.map(dataType => (
            <label key={dataType} style={{ display: "block", marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={filters.dataTypes.includes(dataType)}
                onChange={(e) => handleDataTypeChange(dataType, e.target.checked)}
              />
              {" "}{dataType}
            </label>
          ))}
        </div>

        {/* Date Range */}
        <div>
          <h4>Date Range</h4>
          <div style={{ marginBottom: 8 }}>
            <label>From:</label>
            <input
              type="date"
              value={filters.timeRange.from.split('T')[0]}
              onChange={(e) => setFilters({ 
                timeRange: { 
                  ...filters.timeRange, 
                  from: new Date(e.target.value).toISOString() 
                }
              })}
              style={{ marginLeft: 8, padding: 4 }}
            />
          </div>
          <div>
            <label>To:</label>
            <input
              type="date"
              value={filters.timeRange.to.split('T')[0]}
              onChange={(e) => setFilters({ 
                timeRange: { 
                  ...filters.timeRange, 
                  to: new Date(e.target.value).toISOString() 
                }
              })}
              style={{ marginLeft: 8, padding: 4 }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button 
          onClick={reset}
          style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4 }}
        >
          Reset
        </button>
        
        <button 
          onClick={() => setShowScenarios(!showScenarios)}
          style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4 }}
        >
          Scenarios
        </button>
      </div>

      {showScenarios && (
        <div style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 4, backgroundColor: "white" }}>
          <h4>Scenario Management</h4>
          
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Scenario name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              style={{ padding: 8, marginRight: 8, width: 200 }}
            />
            <button 
              onClick={handleSaveScenario}
              style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: 4 }}
            >
              Save Current
            </button>
          </div>

          <div>
            <h5>Saved Scenarios:</h5>
            {listScenarios().map(name => (
              <button
                key={name}
                onClick={() => {
                  loadScenario(name);
                  setShowScenarios(false);
                }}
                style={{ 
                  display: "block", 
                  margin: "4px 0", 
                  padding: "4px 8px", 
                  backgroundColor: "#f8f9fa", 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                {name}
              </button>
            ))}
            {listScenarios().length === 0 && <p>No saved scenarios</p>}
          </div>
        </div>
      )}
    </div>
  );
}