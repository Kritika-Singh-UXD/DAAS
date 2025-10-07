import type {
  KPIOverview, TherapeuticTopic, DrugTrendRow, GapRow, EvidenceImpact, GeoPayload, SummaryPayload, Filters
} from "./types";

const q = (filters: Filters) => {
  const p = new URLSearchParams();
  if (filters.region.length) p.set("region", filters.region.join(","));
  if (filters.therapeuticAreas.length) p.set("ta", filters.therapeuticAreas.join(","));
  if (filters.drugs.length) p.set("drugs", filters.drugs.join(","));
  if (filters.specialties.length) p.set("specialties", filters.specialties.join(","));
  if (filters.dataTypes.length) p.set("dataTypes", filters.dataTypes.join(","));
  p.set("from", filters.timeRange.from);
  p.set("to", filters.timeRange.to);
  return p.toString();
};

export async function fetchOverview(f: Filters): Promise<KPIOverview> {
  const res = await fetch(`/api/signals/overview?${q(f)}`, { cache: "no-store" });
  return res.json();
}

export async function fetchTherapeutic(f: Filters): Promise<TherapeuticTopic[]> {
  const res = await fetch(`/api/signals/therapeutic?${q(f)}`, { cache: "no-store" });
  return res.json();
}

export async function fetchDrugTrends(f: Filters): Promise<DrugTrendRow[]> {
  const res = await fetch(`/api/signals/drug-trends?${q(f)}`, { cache: "no-store" });
  return res.json();
}

export async function fetchGaps(f: Filters): Promise<GapRow[]> {
  const res = await fetch(`/api/signals/gaps?${q(f)}`, { cache: "no-store" });
  return res.json();
}

export async function fetchEvidence(f: Filters): Promise<EvidenceImpact> {
  const res = await fetch(`/api/signals/evidence?${q(f)}`, { cache: "no-store" });
  return res.json();
}

export async function fetchGeography(f: Filters): Promise<GeoPayload> {
  const res = await fetch(`/api/signals/geography?${q(f)}`, { cache: "no-store" });
  return res.json();
}

export async function fetchSummary(f: Filters): Promise<SummaryPayload> {
  const res = await fetch(`/api/signals/summary?${q(f)}`, { cache: "no-store" });
  return res.json();
}