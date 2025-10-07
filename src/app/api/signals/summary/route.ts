import { NextRequest, NextResponse } from "next/server";
import { seededRng, getTopicsForArea } from "@/lib/mock";
import type { SummaryPayload, RegionKey, TherapeuticArea } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filters from query params
  const regions = (searchParams.get("region")?.split(",") || ["Southern Europe"]) as RegionKey[];
  const therapeuticAreas = (searchParams.get("ta")?.split(",") || ["Oncology"]) as TherapeuticArea[];
  const drugs = searchParams.get("drugs")?.split(",") || [];

  const rng = seededRng(`summary-${therapeuticAreas.join(",")}-${regions.join(",")}`);

  // Generate key metrics
  const keyMetrics = [
    `${Math.floor(20000 + rng() * 30000)} total physician sessions analyzed`,
    `${Math.floor(rng() * 40 + 10)}% increase in ${therapeuticAreas[0]} searches`,
    `Top region: ${regions[0]} with ${Math.floor(rng() * 50 + 30)}% engagement`,
    `Average session duration: ${Math.floor(rng() * 120 + 180)} seconds`
  ];

  // Generate emerging topics
  const allTopics = therapeuticAreas.flatMap(area => getTopicsForArea(area));
  const emergingTopics = allTopics
    .sort(() => rng() - 0.5)
    .slice(0, 3)
    .map(topic => `${topic} showing ${Math.floor(rng() * 50 + 25)}% growth`);

  // Generate knowledge gaps
  const gapTypes = ["Dosing", "Mechanism", "Trial", "Safety", "Sequencing"];
  const knowledgeGaps = gapTypes
    .sort(() => rng() - 0.5)
    .slice(0, 3)
    .map(type => {
      const topic = allTopics[Math.floor(rng() * allTopics.length)];
      return `${type} information needed for ${topic}`;
    });

  // Generate top evidence
  const evidenceTypes = ["Clinical trial data", "Real-world evidence", "Meta-analysis", "Guidelines"];
  const topEvidence = evidenceTypes
    .sort(() => rng() - 0.5)
    .slice(0, 3)
    .map(type => {
      const topic = allTopics[Math.floor(rng() * allTopics.length)];
      return `${type} on ${topic} highly engaged`;
    });

  // Generate regional highlights
  const regionalHighlights = regions.map(region => {
    const topic = allTopics[Math.floor(rng() * allTopics.length)];
    const percentage = Math.floor(rng() * 30 + 20);
    return `${region}: ${percentage}% focus on ${topic}`;
  });

  const summary: SummaryPayload = {
    keyMetrics,
    emergingTopics,
    knowledgeGaps,
    topEvidence,
    regionalHighlights,
    generatedAt: new Date().toISOString()
  };

  return NextResponse.json(summary);
}