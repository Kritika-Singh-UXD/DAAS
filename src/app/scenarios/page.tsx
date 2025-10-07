"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFilters } from "@/store/filters";
import type { Filters } from "@/lib/types";

interface SavedScenario {
  name: string;
  filters: Filters;
  savedAt: string;
  description?: string;
}

export default function ScenariosPage() {
  const router = useRouter();
  const { filters, loadScenario, saveScenario, listScenarios, setFilters } = useFilters();
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioDescription, setNewScenarioDescription] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<SavedScenario | null>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = () => {
    const scenarioNames = listScenarios();
    const loadedScenarios: SavedScenario[] = [];

    scenarioNames.forEach(name => {
      try {
        const key = `synduct-scenario:${name}`;
        const stored = localStorage.getItem(key);
        const metaKey = `synduct-scenario-meta:${name}`;
        const metaStored = localStorage.getItem(metaKey);
        
        if (stored) {
          const filters = JSON.parse(stored);
          let savedAt = new Date().toISOString();
          let description = "";
          
          if (metaStored) {
            const meta = JSON.parse(metaStored);
            savedAt = meta.savedAt || savedAt;
            description = meta.description || "";
          }

          loadedScenarios.push({
            name,
            filters,
            savedAt,
            description
          });
        }
      } catch (error) {
        console.error(`Failed to load scenario ${name}:`, error);
      }
    });

    setScenarios(loadedScenarios.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
  };

  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) return;

    // Save the scenario
    saveScenario(newScenarioName.trim());
    
    // Save metadata
    const metaKey = `synduct-scenario-meta:${newScenarioName.trim()}`;
    const metadata = {
      savedAt: new Date().toISOString(),
      description: newScenarioDescription.trim()
    };
    localStorage.setItem(metaKey, JSON.stringify(metadata));

    // Reset form
    setNewScenarioName("");
    setNewScenarioDescription("");
    setShowCreateModal(false);
    
    // Reload scenarios
    loadScenarios();
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    loadScenario(scenario.name);
    router.push("/");
  };

  const handleDeleteScenario = (scenarioName: string) => {
    if (confirm(`Are you sure you want to delete the scenario "${scenarioName}"?`)) {
      localStorage.removeItem(`synduct-scenario:${scenarioName}`);
      localStorage.removeItem(`synduct-scenario-meta:${scenarioName}`);
      loadScenarios();
    }
  };

  const handleDuplicateScenario = (scenario: SavedScenario) => {
    const newName = `${scenario.name} (Copy)`;
    
    // Save the duplicate
    const key = `synduct-scenario:${newName}`;
    localStorage.setItem(key, JSON.stringify(scenario.filters));
    
    // Save metadata
    const metaKey = `synduct-scenario-meta:${newName}`;
    const metadata = {
      savedAt: new Date().toISOString(),
      description: scenario.description ? `Copy of: ${scenario.description}` : "Duplicate scenario"
    };
    localStorage.setItem(metaKey, JSON.stringify(metadata));
    
    loadScenarios();
  };

  const formatFiltersPreview = (filters: Filters) => {
    const parts = [];
    if (filters.region.length) parts.push(`Regions: ${filters.region.join(", ")}`);
    if (filters.therapeuticAreas.length) parts.push(`TAs: ${filters.therapeuticAreas.join(", ")}`);
    if (filters.drugs.length) parts.push(`Drugs: ${filters.drugs.join(", ")}`);
    if (filters.specialties.length) parts.push(`Specialties: ${filters.specialties.join(", ")}`);
    
    const fromDate = new Date(filters.timeRange.from).toLocaleDateString();
    const toDate = new Date(filters.timeRange.to).toLocaleDateString();
    parts.push(`Period: ${fromDate} - ${toDate}`);
    
    return parts.join(" | ");
  };

  const ScenarioCard = ({ scenario }: { scenario: SavedScenario }) => (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 20,
      backgroundColor: "white",
      marginBottom: 16
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: "bold" }}>
            {scenario.name}
          </h3>
          <p style={{ margin: "0 0 8px 0", color: "#6c757d", fontSize: 14 }}>
            Saved: {new Date(scenario.savedAt).toLocaleString()}
          </p>
          {scenario.description && (
            <p style={{ margin: "0 0 12px 0", fontSize: 14 }}>
              {scenario.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => handleLoadScenario(scenario)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Load & View
          </button>
          <button
            onClick={() => handleDuplicateScenario(scenario)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Duplicate
          </button>
          <button
            onClick={() => handleDeleteScenario(scenario.name)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Delete
          </button>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: "#f8f9fa", 
        padding: 12, 
        borderRadius: 4, 
        fontSize: 12,
        color: "#495057",
        border: "1px solid #e9ecef"
      }}>
        <strong>Filter Configuration:</strong><br />
        {formatFiltersPreview(scenario.filters)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: "white", 
        borderBottom: "1px solid #dee2e6", 
        padding: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>Synduct Signals</h1>
            <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
              <Link href="/" style={{ textDecoration: "none", color: "#6c757d" }}>Dashboard</Link>
              <Link href="/reports" style={{ textDecoration: "none", color: "#6c757d" }}>Reports</Link>
              <span style={{ color: "#007bff", fontWeight: "bold" }}>Saved Scenarios</span>
              <Link href="/settings" style={{ textDecoration: "none", color: "#6c757d" }}>Settings</Link>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0" }}>Saved Scenarios</h2>
            <p style={{ color: "#6c757d", margin: 0 }}>
              Manage your saved filter configurations and analysis scenarios
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold"
            }}
          >
            Save Current Scenario
          </button>
        </div>

        {scenarios.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 60,
            backgroundColor: "white",
            borderRadius: 8,
            border: "1px solid #ddd"
          }}>
            <h3 style={{ color: "#6c757d" }}>No Saved Scenarios</h3>
            <p style={{ color: "#6c757d" }}>
              Create your first scenario by configuring filters on the dashboard and saving them.
            </p>
            <Link 
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: 4,
                marginTop: 16
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div>
            {scenarios.map((scenario, index) => (
              <ScenarioCard key={index} scenario={scenario} />
            ))}
          </div>
        )}

        {/* Create Scenario Modal */}
        {showCreateModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000
          }}>
            <div style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 8,
              width: 500,
              maxWidth: "90vw"
            }}>
              <h3 style={{ margin: "0 0 16px 0" }}>Save Current Scenario</h3>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Enter scenario name..."
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
                  Description (Optional)
                </label>
                <textarea
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  placeholder="Describe this scenario..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    fontSize: 14,
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ 
                backgroundColor: "#f8f9fa", 
                padding: 12, 
                borderRadius: 4, 
                marginBottom: 20,
                fontSize: 12,
                color: "#495057",
                border: "1px solid #e9ecef"
              }}>
                <strong>Current Filter Settings:</strong><br />
                {formatFiltersPreview(filters)}
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateScenario}
                  disabled={!newScenarioName.trim()}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: newScenarioName.trim() ? "#28a745" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: newScenarioName.trim() ? "pointer" : "not-allowed"
                  }}
                >
                  Save Scenario
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}