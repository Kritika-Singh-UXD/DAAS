import { create } from "zustand";
import dayjs from "dayjs";
import type { Filters, RegionKey, TherapeuticArea, Specialty, DataSourceType } from "@/lib/types";

const defaultFrom = dayjs().subtract(6, "month").startOf("day").toISOString();
const defaultTo = dayjs().endOf("day").toISOString();

const initial: Filters = {
  region: ["Southern Europe"],
  therapeuticAreas: ["Oncology"],
  drugs: [],
  specialties: [],
  dataTypes: ["Guideline", "Research", "DrugDB", "ClinicalTrial"],
  ageGroups: [],
  genders: [],
  timeRange: { from: defaultFrom, to: defaultTo }
};

type State = {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  reset: () => void;
  saveScenario: (name: string) => void;
  loadScenario: (name: string) => void;
  listScenarios: () => string[];
};

export const useFilters = create<State>((set, get) => ({
  filters: initial,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  reset: () => set({ filters: initial }),
  saveScenario: (name) => {
    const data = get().filters;
    const key = `synduct-scenario:${name}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  },
  loadScenario: (name) => {
    const key = `synduct-scenario:${name}`;
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) set({ filters: JSON.parse(raw) });
    }
  },
  listScenarios: () => {
    if (typeof window === 'undefined') return [];
    return Object.keys(localStorage).filter((k) => k.startsWith("synduct-scenario:")).map((k) => k.split(":")[1]);
  }
}));