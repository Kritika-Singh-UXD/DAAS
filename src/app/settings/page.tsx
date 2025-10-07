"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

interface AppSettings {
  theme: "light" | "dark" | "auto";
  defaultRegion: string;
  defaultTherapeuticArea: string;
  defaultTimeRange: number; // days
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  exportFormat: "csv" | "xlsx";
  chartAnimations: boolean;
  compactView: boolean;
  showTooltips: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  defaultRegion: "Southern Europe",
  defaultTherapeuticArea: "Oncology",
  defaultTimeRange: 180, // 6 months
  autoRefresh: false,
  refreshInterval: 15,
  exportFormat: "csv",
  chartAnimations: true,
  compactView: false,
  showTooltips: true
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("synduct-settings");
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem("synduct-settings", JSON.stringify(settings));
    setHasChanges(false);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("synduct-settings");
    setHasChanges(false);
    setShowResetConfirm(false);
  };

  const clearAllData = () => {
    if (confirm("This will delete all saved scenarios and settings. Are you sure?")) {
      // Clear all synduct-related localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("synduct-")) {
          localStorage.removeItem(key);
        }
      });
      
      // Reset settings
      setSettings(DEFAULT_SETTINGS);
      setHasChanges(false);
      
      alert("All data cleared successfully.");
    }
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ 
    label, 
    description, 
    children 
  }: { 
    label: string; 
    description?: string; 
    children: React.ReactNode 
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
      <div className="sm:w-64">
        {children}
      </div>
    </div>
  );

  const Select = ({ 
    value, 
    onChange, 
    options 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    options: Array<{ value: string; label: string }> 
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const Toggle = ({ 
    checked, 
    onChange 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void 
  }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      <span className="ml-3 text-sm text-gray-900">{checked ? "Enabled" : "Disabled"}</span>
    </label>
  );

  const NumberInput = ({ 
    value, 
    onChange, 
    min, 
    max, 
    suffix 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    min?: number; 
    max?: number; 
    suffix?: string 
  }) => (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Application Settings</h2>
            <p className="text-gray-600 mt-1">
              Configure your dashboard preferences and default values
            </p>
          </div>
          {hasChanges && (
            <button
              onClick={saveSettings}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          )}
        </div>

        <div className="space-y-8">

        {/* Appearance Settings */}
        <SettingsSection title="Appearance">
          <SettingRow 
            label="Theme" 
            description="Choose your preferred color scheme"
          >
            <Select
              value={settings.theme}
              onChange={(value) => handleSettingChange("theme", value)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Auto (System)" }
              ]}
            />
          </SettingRow>

          <SettingRow 
            label="Compact View" 
            description="Reduce spacing and padding for more data on screen"
          >
            <Toggle
              checked={settings.compactView}
              onChange={(checked) => handleSettingChange("compactView", checked)}
            />
          </SettingRow>

          <SettingRow 
            label="Chart Animations" 
            description="Enable smooth transitions and animations in charts"
          >
            <Toggle
              checked={settings.chartAnimations}
              onChange={(checked) => handleSettingChange("chartAnimations", checked)}
            />
          </SettingRow>

          <SettingRow 
            label="Show Tooltips" 
            description="Display helpful tooltips on hover"
          >
            <Toggle
              checked={settings.showTooltips}
              onChange={(checked) => handleSettingChange("showTooltips", checked)}
            />
          </SettingRow>
        </SettingsSection>

        {/* Default Values */}
        <SettingsSection title="Default Filter Values">
          <SettingRow 
            label="Default Region" 
            description="Region selected when opening the dashboard"
          >
            <Select
              value={settings.defaultRegion}
              onChange={(value) => handleSettingChange("defaultRegion", value)}
              options={[
                { value: "Global", label: "Global" },
                { value: "Southern Europe", label: "Southern Europe" },
                { value: "Italy", label: "Italy" },
                { value: "Spain", label: "Spain" },
                { value: "Portugal", label: "Portugal" }
              ]}
            />
          </SettingRow>

          <SettingRow 
            label="Default Therapeutic Area" 
            description="Therapeutic area selected by default"
          >
            <Select
              value={settings.defaultTherapeuticArea}
              onChange={(value) => handleSettingChange("defaultTherapeuticArea", value)}
              options={[
                { value: "Oncology", label: "Oncology" },
                { value: "Cardiology", label: "Cardiology" },
                { value: "Neurology", label: "Neurology" }
              ]}
            />
          </SettingRow>

          <SettingRow 
            label="Default Time Range" 
            description="Default number of days to analyze"
          >
            <Select
              value={settings.defaultTimeRange.toString()}
              onChange={(value) => handleSettingChange("defaultTimeRange", parseInt(value))}
              options={[
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
                { value: "180", label: "6 months" },
                { value: "365", label: "1 year" }
              ]}
            />
          </SettingRow>
        </SettingsSection>

        {/* Data & Performance */}
        <SettingsSection title="Data & Performance">
          <SettingRow 
            label="Auto Refresh" 
            description="Automatically refresh data at regular intervals"
          >
            <Toggle
              checked={settings.autoRefresh}
              onChange={(checked) => handleSettingChange("autoRefresh", checked)}
            />
          </SettingRow>

          {settings.autoRefresh && (
            <SettingRow 
              label="Refresh Interval" 
              description="How often to refresh data when auto-refresh is enabled"
            >
              <NumberInput
                value={settings.refreshInterval}
                onChange={(value) => handleSettingChange("refreshInterval", value)}
                min={5}
                max={60}
                suffix="minutes"
              />
            </SettingRow>
          )}

          <SettingRow 
            label="Export Format" 
            description="Default format for data exports"
          >
            <Select
              value={settings.exportFormat}
              onChange={(value) => handleSettingChange("exportFormat", value)}
              options={[
                { value: "csv", label: "CSV" },
                { value: "xlsx", label: "Excel (XLSX)" }
              ]}
            />
          </SettingRow>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data Management">
          <SettingRow 
            label="Reset to Defaults" 
            description="Reset all settings to their default values"
          >
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Reset Settings
            </button>
          </SettingRow>

          <SettingRow 
            label="Clear All Data" 
            description="Delete all saved scenarios, settings, and local data"
          >
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Clear All Data
            </button>
          </SettingRow>
        </SettingsSection>

        {/* Application Info */}
        <SettingsSection title="About">
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-gray-900">Synduct Signals</span>
              <span className="ml-2 text-gray-500">Version 1.0.0</span>
            </div>
            <p>Built with Next.js, TypeScript, Recharts, and react-simple-maps</p>
            <p>Data is generated using deterministic mock APIs for demonstration purposes.</p>
          </div>
        </SettingsSection>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Settings</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to reset all settings to their default values? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                >
                  Reset Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}