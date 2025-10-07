import dayjs from "dayjs";
import type { RegionKey, TherapeuticArea, Specialty, DataSourceType } from "./types";

// Simple seeded RNG
export function seededRng(key: string): () => number {
  let seed = 0;
  for (let i = 0; i < key.length; i++) {
    seed = ((seed << 5) - seed + key.charCodeAt(i)) & 0xffffffff;
  }
  return function() {
    seed = ((seed * 1664525) + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0x100000000;
  };
}

export function timeSeries(fromISO: string, toISO: string, stepDays: number, rng: () => number): { date: string; value: number }[] {
  const start = dayjs(fromISO);
  const end = dayjs(toISO);
  const days = end.diff(start, 'days');
  const points: { date: string; value: number }[] = [];
  
  for (let i = 0; i <= days; i += stepDays) {
    const date = start.add(i, 'days');
    const value = Math.floor(rng() * 1000 + 100);
    points.push({
      date: date.toISOString(),
      value
    });
  }
  
  return points;
}

// Static data lists
export const DRUGS = ["Pembrolizumab", "Nivolumab", "Durvalumab", "Atezolizumab", "Bevacizumab", "Trastuzumab"];

export const ONCOLOGY_TOPICS = [
  "Lung cancer", "Breast cancer", "Colorectal cancer", "Melanoma", 
  "Prostate cancer", "Pancreatic cancer", "Ovarian cancer", "Kidney cancer"
];

export const CARDIOLOGY_TOPICS = [
  "Heart failure", "Coronary artery disease", "Atrial fibrillation", "Hypertension",
  "Myocardial infarction", "Stroke prevention", "Lipid management", "Diabetes cardiovascular"
];

export const NEUROLOGY_TOPICS = [
  "Alzheimer's disease", "Parkinson's disease", "Multiple sclerosis", "Epilepsy",
  "Migraine", "Stroke", "Dementia", "Neuropathy"
];

export const GAP_TYPES: Array<"Dosing" | "Mechanism" | "Trial" | "Safety" | "Sequencing"> = [
  "Dosing", "Mechanism", "Trial", "Safety", "Sequencing"
];

export const PUBLICATION_TITLES = [
  "Immunotherapy combinations in advanced NSCLC",
  "Real-world outcomes with checkpoint inhibitors",
  "Biomarker-driven therapy selection",
  "Novel targeted therapy approaches",
  "Resistance mechanisms in oncology",
  "Combination therapy optimization",
  "Patient selection criteria",
  "Long-term safety analysis",
  "Quality of life outcomes",
  "Cost-effectiveness evaluation",
  "Treatment sequencing strategies",
  "Companion diagnostic validation"
];

export const REGIONS: Record<RegionKey, { intensity: number }> = {
  "Global": { intensity: 1.0 },
  "Southern Europe": { intensity: 0.8 },
  "Italy": { intensity: 0.7 },
  "Spain": { intensity: 0.6 },
  "Portugal": { intensity: 0.4 }
};

export function getTopicsForArea(area: TherapeuticArea): string[] {
  switch (area) {
    case "Oncology":
      return ONCOLOGY_TOPICS;
    case "Cardiology":
      return CARDIOLOGY_TOPICS;
    case "Neurology":
      return NEUROLOGY_TOPICS;
    default:
      return ONCOLOGY_TOPICS;
  }
}

export function getRegionMultiplier(regions: RegionKey[]): number {
  if (regions.includes("Global")) return 1.0;
  return regions.reduce((sum, region) => sum + REGIONS[region].intensity, 0) / regions.length;
}

export function getTimeRangeMultiplier(fromISO: string, toISO: string): number {
  const days = dayjs(toISO).diff(dayjs(fromISO), 'days');
  return Math.min(days / 30, 12); // Scale based on months, max 12x
}

export function addESMOEvent(trend: { date: string; searches: number; note?: string }[]): void {
  // Add ESMO 2024 event to trend data
  const esmoDate = "2024-09-15";
  const esmoIndex = trend.findIndex(point => dayjs(point.date).isAfter(dayjs(esmoDate)));
  
  if (esmoIndex > 0) {
    trend[esmoIndex].searches *= 1.8; // Boost searches around ESMO
    trend[esmoIndex].note = "ESMO 2024";
  }
}