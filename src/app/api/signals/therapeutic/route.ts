import { NextRequest, NextResponse } from "next/server";
import { seededRng, getTopicsForArea, getRegionMultiplier } from "@/lib/mock";
import type { TherapeuticTopic, RegionKey, TherapeuticArea, DataSourceType, Specialty } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filters from query params
  const regions = (searchParams.get("region")?.split(",") || ["Southern Europe"]) as RegionKey[];
  const therapeuticAreas = (searchParams.get("ta")?.split(",") || ["Oncology"]) as TherapeuticArea[];
  const specialties = (searchParams.get("specialties")?.split(",") || []) as Specialty[];

  const rng = seededRng(`therapeutic-${therapeuticAreas.join(",")}-${regions.join(",")}`);
  const regionMultiplier = getRegionMultiplier(regions);

  const allTopics: TherapeuticTopic[] = [];

  therapeuticAreas.forEach(area => {
    const topics = getTopicsForArea(area);
    
    topics.forEach(topic => {
      const baseVolume = Math.floor(rng() * 1000 * regionMultiplier + 100);
      const engagement = rng() * 0.8 + 0.2; // 0.2 to 1.0
      
      const specialtyList: Specialty[] = area === "Oncology" 
        ? ["Oncologist", "Radiologist", "Pathologist"]
        : area === "Cardiology"
        ? ["Internal Medicine", "Oncologist"]
        : ["Internal Medicine", "Oncologist"];
      
      const topSpecialty = specialtyList[Math.floor(rng() * specialtyList.length)];
      
      // Generate source breakdown
      const sourceBreakdown: Record<DataSourceType, number> = {
        "Guideline": Math.floor(rng() * baseVolume * 0.3),
        "Research": Math.floor(rng() * baseVolume * 0.4),
        "DrugDB": Math.floor(rng() * baseVolume * 0.2),
        "ClinicalTrial": Math.floor(rng() * baseVolume * 0.1)
      };

      allTopics.push({
        topic,
        searchVolume: baseVolume,
        engagement,
        topSpecialty,
        sourceBreakdown
      });
    });
  });

  // Sort by search volume and take top 8
  const sortedTopics = allTopics
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 8);

  return NextResponse.json(sortedTopics);
}