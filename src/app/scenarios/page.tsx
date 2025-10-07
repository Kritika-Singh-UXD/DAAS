"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {scenario.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            Saved: {new Date(scenario.savedAt).toLocaleString()}
          </p>
          {scenario.description && (
            <p className="text-sm text-gray-700 mb-3">
              {scenario.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLoadScenario(scenario)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Load & View
          </button>
          <button
            onClick={() => handleDuplicateScenario(scenario)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            Duplicate
          </button>
          <button
            onClick={() => handleDeleteScenario(scenario.name)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm">
          <span className="font-medium text-gray-900">Filter Configuration:</span>
          <div className="mt-2 text-gray-600 text-xs leading-relaxed">
            {formatFiltersPreview(scenario.filters)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Saved Scenarios</h2>
            <p className="text-gray-600 mt-1">
              Manage your saved filter configurations and analysis scenarios
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Save Current Scenario
          </button>
        </div>

        {scenarios.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Scenarios</h3>
              <p className="text-gray-600 mb-6">
                Create your first scenario by configuring filters on the dashboard and saving them.
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <ScenarioCard key={index} scenario={scenario} />
            ))}
          </div>
        )}

        {/* Create Scenario Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Save Current Scenario</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Scenario Name *
                  </label>
                  <input
                    type="text"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    placeholder="Enter scenario name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newScenarioDescription}
                    onChange={(e) => setNewScenarioDescription(e.target.value)}
                    placeholder="Describe this scenario..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Current Filter Settings:</span>
                    <div className="mt-2 text-gray-600 text-xs leading-relaxed">
                      {formatFiltersPreview(filters)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateScenario}
                  disabled={!newScenarioName.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    newScenarioName.trim() 
                      ? "bg-green-600 text-white hover:bg-green-700" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
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