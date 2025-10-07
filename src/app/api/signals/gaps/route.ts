import { NextRequest, NextResponse } from "next/server";
import { seededRng, getTopicsForArea, GAP_TYPES, getRegionMultiplier } from "@/lib/mock";
import type { GapRow, RegionKey, TherapeuticArea, Specialty } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filters from query params
  const regions = (searchParams.get("region")?.split(",") || ["Southern Europe"]) as RegionKey[];
  const therapeuticAreas = (searchParams.get("ta")?.split(",") || ["Oncology"]) as TherapeuticArea[];
  const specialties = (searchParams.get("specialties")?.split(",") || []) as Specialty[];

  const rng = seededRng(`gaps-${therapeuticAreas.join(",")}-${regions.join(",")}`);
  const regionMultiplier = getRegionMultiplier(regions);

  const gaps: GapRow[] = [];

  therapeuticAreas.forEach(area => {
    const topics = getTopicsForArea(area);
    
    topics.forEach(topic => {
      // Generate 1-2 gaps per topic
      const gapCount = 1 + Math.floor(rng() * 2);
      
      for (let i = 0; i < gapCount; i++) {
        const volume = Math.floor(rng() * 800 * regionMultiplier + 50);
        const ctr = rng() * 0.5 + 0.1; // 0.1 to 0.6 (lower CTR indicates gap)
        
        const specialtyList: Specialty[] = area === "Oncology" 
          ? ["Oncologist", "Radiologist", "Pathologist"]
          : ["Internal Medicine", "Oncologist"];
        
        const specialty = specialtyList[Math.floor(rng() * specialtyList.length)];
        const region = regions[Math.floor(rng() * regions.length)];
        const type = GAP_TYPES[Math.floor(rng() * GAP_TYPES.length)];
        
        let suggestedAction: string;
        switch (type) {
          case "Dosing":
            suggestedAction = `Create dosing guidelines for ${topic} in ${specialty} practice`;
            break;
          case "Mechanism":
            suggestedAction = `Develop mechanism of action content for ${topic}`;
            break;
          case "Trial":
            suggestedAction = `Highlight clinical trial data for ${topic}`;
            break;
          case "Safety":
            suggestedAction = `Improve safety profile information for ${topic}`;
            break;
          case "Sequencing":
            suggestedAction = `Define treatment sequencing for ${topic}`;
            break;
        }

        gaps.push({
          topic: `${topic} - ${type}`,
          volume,
          ctr,
          specialty,
          region,
          type,
          suggestedAction
        });
      }
    });
  });

  // Sort by gap severity (volume * (1 - ctr))
  const sortedGaps = gaps
    .map(gap => ({
      ...gap,
      severity: gap.volume * (1 - gap.ctr)
    }))
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 12)
    .map(({ severity, ...gap }) => gap);

  return NextResponse.json(sortedGaps);
}