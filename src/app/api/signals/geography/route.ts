import { NextRequest, NextResponse } from "next/server";
import { seededRng, DRUGS, REGIONS } from "@/lib/mock";
import type { GeoPayload, GeoPoint, RegionKey, Specialty, TherapeuticArea } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filters from query params
  const regions = (searchParams.get("region")?.split(",") || ["Southern Europe"]) as RegionKey[];
  const therapeuticAreas = (searchParams.get("ta")?.split(",") || ["Oncology"]) as TherapeuticArea[];
  const drugs = searchParams.get("drugs")?.split(",") || [];

  const rng = seededRng(`geography-${regions.join(",")}-${therapeuticAreas.join(",")}`);

  // Generate geographic points
  const points: GeoPoint[] = [];
  
  // If specific regions are selected, focus on those
  const targetRegions = regions.includes("Global") 
    ? (Object.keys(REGIONS) as RegionKey[])
    : regions;

  targetRegions.forEach(region => {
    if (region === "Global") return; // Skip global for specific points
    
    const intensity = REGIONS[region].intensity;
    const value = intensity * (0.5 + rng() * 0.5); // Add some randomness
    
    const availableDrugs = drugs.length > 0 ? drugs : DRUGS;
    const topDrug = availableDrugs[Math.floor(rng() * availableDrugs.length)];
    
    const avgSessionsPerDoctor = Math.floor(20 + rng() * 50 * intensity);
    
    const specialties: Specialty[] = ["Oncologist", "Radiologist", "Pathologist", "Internal Medicine"];
    const dominantSpecialty = specialties[Math.floor(rng() * specialties.length)];

    points.push({
      region,
      value,
      topDrug,
      avgSessionsPerDoctor,
      dominantSpecialty
    });
  });

  // Generate specialty breakdown
  const specialties: Specialty[] = ["Oncologist", "Radiologist", "Pathologist", "Internal Medicine"];
  const bySpecialty = specialties.map(specialty => ({
    specialty,
    engagement: rng() * 0.8 + 0.2 // 0.2 to 1.0
  })).sort((a, b) => b.engagement - a.engagement);

  const geography: GeoPayload = {
    points,
    bySpecialty
  };

  return NextResponse.json(geography);
}