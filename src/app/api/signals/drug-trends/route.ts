import { NextRequest, NextResponse } from "next/server";
import { seededRng, timeSeries, DRUGS, getRegionMultiplier, getTimeRangeMultiplier } from "@/lib/mock";
import type { DrugTrendRow, RegionKey, TherapeuticArea, Specialty } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filters from query params
  const regions = (searchParams.get("region")?.split(",") || ["Southern Europe"]) as RegionKey[];
  const therapeuticAreas = (searchParams.get("ta")?.split(",") || ["Oncology"]) as TherapeuticArea[];
  const drugs = searchParams.get("drugs")?.split(",") || [];
  const from = searchParams.get("from") || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = searchParams.get("to") || new Date().toISOString();

  const regionMultiplier = getRegionMultiplier(regions);
  const timeMultiplier = getTimeRangeMultiplier(from, to);

  // Use filtered drugs or default drugs
  const drugsToAnalyze = drugs.length > 0 ? drugs : DRUGS.slice(0, 6);

  const drugTrends: DrugTrendRow[] = drugsToAnalyze.map(drug => {
    const rng = seededRng(`drug-${drug}-${regions.join(",")}`);
    
    const totalQueries = Math.floor(rng() * 5000 * regionMultiplier * timeMultiplier + 500);
    const ctr = rng() * 0.6 + 0.2; // 0.2 to 0.8
    const avgSessionTimeSec = Math.floor(180 + rng() * 240); // 3-7 minutes
    
    const topRegion = regions[Math.floor(rng() * regions.length)];
    const specialtyList: Specialty[] = ["Oncologist", "Radiologist", "Pathologist", "Internal Medicine"];
    const topSpecialty = specialtyList[Math.floor(rng() * specialtyList.length)];
    
    // Generate time series
    const series = timeSeries(from, to, 7, rng).map(point => ({
      date: point.date,
      volume: Math.floor(point.value * regionMultiplier * 0.1) // Scale down for drug-specific volume
    }));

    // Generate co-searched keywords
    const keywords = ["mechanism", "dosing", "side effects", "trials", "efficacy", "biomarkers"];
    const coSearched = keywords
      .sort(() => rng() - 0.5)
      .slice(0, 3 + Math.floor(rng() * 3));

    return {
      drug,
      totalQueries,
      ctr,
      avgSessionTimeSec,
      topRegion,
      topSpecialty,
      series,
      coSearched
    };
  });

  // Sort by total queries
  const sortedTrends = drugTrends.sort((a, b) => b.totalQueries - a.totalQueries);

  return NextResponse.json(sortedTrends);
}