"use client";

import Link from "next/link";
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: "white", 
        borderBottom: "1px solid #dee2e6", 
        padding: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold" }}>Synduct Signals</h1>
            <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
              <span style={{ color: "#007bff", fontWeight: "bold" }}>Dashboard</span>
              <Link href="/reports" style={{ textDecoration: "none", color: "#6c757d" }}>Reports</Link>
              <Link href="/scenarios" style={{ textDecoration: "none", color: "#6c757d" }}>Saved Scenarios</Link>
              <Link href="/settings" style={{ textDecoration: "none", color: "#6c757d" }}>Settings</Link>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        <SynductFilterBar />
        
        <section id="overview">
          <OverviewPanel />
        </section>
        
        <section id="therapeutic" style={{ marginTop: 48 }}>
          <TherapeuticExplorer />
        </section>
        
        <section id="drugtrends" style={{ marginTop: 48 }}>
          <DrugTrendExplorer />
        </section>
        
        <section id="gaps" style={{ marginTop: 48 }}>
          <KnowledgeGapFinder />
        </section>
        
        <section id="evidence" style={{ marginTop: 48 }}>
          <EvidenceImpactTracker />
        </section>
        
        <section id="geo" style={{ marginTop: 48 }}>
          <GeographicSpecialtyMap />
        </section>
        
        <section id="summary" style={{ marginTop: 48 }}>
          <SummaryGenerator />
        </section>
      </main>
    </div>
  );
}