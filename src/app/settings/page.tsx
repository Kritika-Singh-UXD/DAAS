"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div style={{ 
      backgroundColor: "white", 
      border: "1px solid #ddd", 
      borderRadius: 8, 
      padding: 24, 
      marginBottom: 24 
    }}>
      <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: "bold" }}>{title}</h3>
      {children}
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
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "flex-start", 
      marginBottom: 20,
      paddingBottom: 20,
      borderBottom: "1px solid #f0f0f0"
    }}>
      <div style={{ flex: 1, marginRight: 20 }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>
          {label}
        </label>
        {description && (
          <p style={{ margin: 0, fontSize: 14, color: "#6c757d" }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ minWidth: 200 }}>
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
      style={{
        width: "100%",
        padding: 8,
        border: "1px solid #ddd",
        borderRadius: 4,
        fontSize: 14
      }}
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
    <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginRight: 8 }}
      />
      <span>{checked ? "Enabled" : "Disabled"}</span>
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
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        style={{
          width: 120,
          padding: 8,
          border: "1px solid #ddd",
          borderRadius: 4,
          fontSize: 14
        }}
      />
      {suffix && <span style={{ fontSize: 14, color: "#6c757d" }}>{suffix}</span>}
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
              <Link href="/scenarios" style={{ textDecoration: "none", color: "#6c757d" }}>Saved Scenarios</Link>
              <span style={{ color: "#007bff", fontWeight: "bold" }}>Settings</span>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: "0 0 8px 0" }}>Application Settings</h2>
            <p style={{ color: "#6c757d", margin: 0 }}>
              Configure your dashboard preferences and default values
            </p>
          </div>
          {hasChanges && (
            <button
              onClick={saveSettings}
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
              Save Changes
            </button>
          )}
        </div>

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
              style={{
                padding: "8px 16px",
                backgroundColor: "#ffc107",
                color: "black",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
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
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Clear All Data
            </button>
          </SettingRow>
        </SettingsSection>

        {/* Application Info */}
        <SettingsSection title="About">
          <div style={{ fontSize: 14, color: "#6c757d" }}>
            <p><strong>Synduct Signals</strong></p>
            <p>Version: 1.0.0</p>
            <p>Built with Next.js, TypeScript, Recharts, and react-simple-maps</p>
            <p>Data is generated using deterministic mock APIs for demonstration purposes.</p>
          </div>
        </SettingsSection>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
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
              width: 400,
              maxWidth: "90vw"
            }}>
              <h3 style={{ margin: "0 0 16px 0" }}>Reset Settings</h3>
              <p style={{ margin: "0 0 20px 0" }}>
                Are you sure you want to reset all settings to their default values? 
                This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
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
                  onClick={resetSettings}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
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