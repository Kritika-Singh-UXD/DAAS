import { NextRequest, NextResponse } from "next/server";
import { seededRng, timeSeries, PUBLICATION_TITLES, getRegionMultiplier } from "@/lib/mock";
import type { EvidenceImpact, EvidenceNode, EvidenceEdge, DataSourceType, RegionKey, TherapeuticArea } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Parse filters from query params
  const regions = (searchParams.get("region")?.split(",") || ["Southern Europe"]) as RegionKey[];
  const therapeuticAreas = (searchParams.get("ta")?.split(",") || ["Oncology"]) as TherapeuticArea[];
  const from = searchParams.get("from") || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = searchParams.get("to") || new Date().toISOString();

  const rng = seededRng(`evidence-${therapeuticAreas.join(",")}-${regions.join(",")}`);
  const regionMultiplier = getRegionMultiplier(regions);

  // Generate evidence nodes
  const nodeCount = 8 + Math.floor(rng() * 4); // 8-12 nodes
  const nodes: EvidenceNode[] = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const title = PUBLICATION_TITLES[i % PUBLICATION_TITLES.length];
    const types: DataSourceType[] = ["Guideline", "Research", "DrugDB", "ClinicalTrial"];
    const type = types[Math.floor(rng() * types.length)];
    
    const engagement = rng() * 0.8 + 0.2; // 0.2 to 1.0
    const doi = rng() > 0.3 ? `10.1000/${1000 + Math.floor(rng() * 9000)}.${Math.floor(rng() * 100)}` : undefined;
    
    // Generate random date within range
    const startTime = new Date(from).getTime();
    const endTime = new Date(to).getTime();
    const randomTime = startTime + rng() * (endTime - startTime);
    const releasedOn = new Date(randomTime).toISOString();

    nodes.push({
      id: `node_${i}`,
      title,
      type,
      engagement,
      doi,
      releasedOn
    });
  }

  // Generate edges (connections between nodes)
  const edges: EvidenceEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    // Each node connects to 1-3 other nodes
    const connections = 1 + Math.floor(rng() * 3);
    for (let j = 0; j < connections && i + j + 1 < nodes.length; j++) {
      edges.push({
        sourceId: nodes[i].id,
        targetId: nodes[i + j + 1].id,
        weight: rng() * 0.8 + 0.2
      });
    }
  }

  // Generate timeline data
  const timeline = timeSeries(from, to, 14, rng).map(point => ({
    date: point.date,
    engagement: point.value * regionMultiplier * 0.001 // Scale down
  }));

  // Select top publications
  const topPublications = nodes
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5)
    .map(node => ({
      title: node.title,
      doi: node.doi
    }));

  const evidence: EvidenceImpact = {
    nodes,
    edges,
    timeline,
    topPublications
  };

  return NextResponse.json(evidence);
}