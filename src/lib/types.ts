export type RegionKey = "Global" | "Southern Europe" | "Italy" | "Spain" | "Portugal";
export type TherapeuticArea = "Oncology" | "Cardiology" | "Neurology";
export type Specialty = "Oncologist" | "Radiologist" | "Pathologist" | "Internal Medicine";
export type DataSourceType = "Guideline" | "Research" | "DrugDB" | "ClinicalTrial";

export interface Filters {
  region: RegionKey[];               // multi
  therapeuticAreas: TherapeuticArea[]; // multi
  drugs: string[];                   // multi
  specialties: Specialty[];          // multi
  dataTypes: DataSourceType[];       // multi
  timeRange: { from: string; to: string }; // ISO dates
}

export interface KPIOverview {
  totalSessions: number;
  activeDoctors: number;   // anonymized count
  topDrugs: string[];
  topTherapeuticAreas: TherapeuticArea[];
  avgSessionDurationSec: number;
  trend: { date: string; searches: number; note?: string }[];
}

export interface TherapeuticTopic {
  topic: string; // e.g., "Lung cancer", "Breast cancer"
  searchVolume: number;
  engagement: number; // 0..1
  topSpecialty: Specialty;
  sourceBreakdown: Record<DataSourceType, number>;
}

export interface DrugTrendRow {
  drug: string;
  totalQueries: number;
  ctr: number; // 0..1
  avgSessionTimeSec: number;
  topRegion: RegionKey;
  topSpecialty: Specialty;
  series: { date: string; volume: number }[];
  coSearched: string[]; // keywords
}

export interface GapRow {
  topic: string;
  volume: number;
  ctr: number; // 0..1
  specialty: Specialty;
  region: RegionKey;
  type: "Dosing" | "Mechanism" | "Trial" | "Safety" | "Sequencing";
  suggestedAction: string;
}

export interface EvidenceNode {
  id: string;
  title: string;
  type: DataSourceType; // Guideline/Trial/Review etc. mapped
  engagement: number; // size
  doi?: string;
  releasedOn: string; // ISO
}

export interface EvidenceEdge {
  sourceId: string;
  targetId: string;
  weight: number;
}

export interface EvidenceImpact {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  timeline: { date: string; engagement: number }[];
  topPublications: { title: string; doi?: string }[];
}

export interface GeoPoint {
  region: RegionKey;
  value: number; // intensity
  topDrug: string;
  avgSessionsPerDoctor: number;
  dominantSpecialty: Specialty;
}

export interface GeoPayload {
  points: GeoPoint[];
  bySpecialty: { specialty: Specialty; engagement: number }[];
}

export interface SummaryPayload {
  keyMetrics: string[];
  emergingTopics: string[];
  knowledgeGaps: string[];
  topEvidence: string[];
  regionalHighlights: string[];
  generatedAt: string;
}