import { NextRequest, NextResponse } from "next/server";
import { seededRng, timeSeries, DRUGS, getRegionMultiplier, getTimeRangeMultiplier, addESMOEvent } from "@/lib/mock";
import type { KPIOverview, RegionKey, TherapeuticArea, DataSourceType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filters from query params
  const regions = (searchParams.get("region")?.split(",") || ["Southern Europe"]) as RegionKey[];
  const therapeuticAreas = (searchParams.get("ta")?.split(",") || ["Oncology"]) as TherapeuticArea[];
  const drugs = searchParams.get("drugs")?.split(",") || [];
  const specialties = searchParams.get("specialties")?.split(",") || [];
  const dataTypes = (searchParams.get("dataTypes")?.split(",") || ["Guideline", "Research", "DrugDB", "ClinicalTrial"]) as DataSourceType[];
  const from = searchParams.get("from") || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = searchParams.get("to") || new Date().toISOString();

  // Generate seeded data
  const rng = seededRng(`overview-${regions.join(",")}-${therapeuticAreas.join(",")}`);
  const regionMultiplier = getRegionMultiplier(regions);
  const timeMultiplier = getTimeRangeMultiplier(from, to);

  // Generate trend data
  const trend = timeSeries(from, to, 7, rng).map(point => ({
    date: point.date,
    searches: Math.floor(point.value * regionMultiplier * timeMultiplier)
  }));

  // Add ESMO event
  addESMOEvent(trend);

  // Generate KPI data
  const totalSessions = Math.floor(rng() * 50000 * regionMultiplier * timeMultiplier + 10000);
  const activeDoctors = Math.floor(totalSessions * (0.15 + rng() * 0.1)); // 15-25% of sessions
  const avgSessionDurationSec = Math.floor(120 + rng() * 300); // 2-7 minutes

  // Select top drugs and areas based on filters
  const topDrugs = drugs.length > 0 ? drugs.slice(0, 3) : DRUGS.slice(0, 3);
  const topTherapeuticAreas = therapeuticAreas.slice(0, 2);

  const overview: KPIOverview = {
    totalSessions,
    activeDoctors,
    topDrugs,
    topTherapeuticAreas,
    avgSessionDurationSec,
    trend
  };

  return NextResponse.json(overview);
}