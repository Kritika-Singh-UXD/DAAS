"use client";

import Navbar from "@/components/Navbar";
import SynductFilterBar from "@/components/SynductFilterBar";
import OverviewPanel from "@/components/OverviewPanel";
import TherapeuticExplorer from "@/components/TherapeuticExplorer";
import DrugTrendExplorer from "@/components/DrugTrendExplorer";
import KnowledgeGapFinder from "@/components/KnowledgeGapFinder";
import EvidenceImpactTracker from "@/components/EvidenceImpactTracker";
import GeographicSpecialtyMap from "@/components/GeographicSpecialtyMap";
import SummaryGenerator from "@/components/SummaryGenerator";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="mb-8">
          <SynductFilterBar />
        </div>
        
        <section id="overview" className="space-y-6">
          <OverviewPanel />
        </section>
        
        <section id="therapeutic" className="space-y-6">
          <TherapeuticExplorer />
        </section>
        
        <section id="drugtrends" className="space-y-6">
          <DrugTrendExplorer />
        </section>
        
        <section id="gaps" className="space-y-6">
          <KnowledgeGapFinder />
        </section>
        
        <section id="evidence" className="space-y-6">
          <EvidenceImpactTracker />
        </section>
        
        <section id="geo" className="space-y-6">
          <GeographicSpecialtyMap />
        </section>
        
        <section id="summary" className="space-y-6">
          <SummaryGenerator />
        </section>
      </main>
    </div>
  );
}