"use client";

import { useState } from "react";
import { useFilters } from "@/store/filters";
import { fetchSummary, fetchOverview, fetchTherapeutic, fetchDrugTrends, fetchGaps } from "@/lib/api";
import type { SummaryPayload } from "@/lib/types";

// @ts-ignore
import Papa from "papaparse";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function SummaryGenerator() {
  const { filters } = useFilters();
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const summaryData = await fetchSummary(filters);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to generate summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all data
      const [overview, therapeutic, drugTrends, gaps] = await Promise.all([
        fetchOverview(filters),
        fetchTherapeutic(filters),
        fetchDrugTrends(filters),
        fetchGaps(filters)
      ]);

      // Prepare CSV data
      const csvData = [
        // Overview data
        { section: "Overview", metric: "Total Sessions", value: overview.totalSessions },
        { section: "Overview", metric: "Active Doctors", value: overview.activeDoctors },
        { section: "Overview", metric: "Avg Session Duration (sec)", value: overview.avgSessionDurationSec },
        
        // Therapeutic topics
        ...therapeutic.map(topic => ({
          section: "Therapeutic Topics",
          metric: topic.topic,
          value: topic.searchVolume,
          engagement: topic.engagement,
          specialty: topic.topSpecialty
        })),
        
        // Drug trends
        ...drugTrends.map(drug => ({
          section: "Drug Trends",
          metric: drug.drug,
          value: drug.totalQueries,
          ctr: drug.ctr,
          region: drug.topRegion,
          specialty: drug.topSpecialty
        })),
        
        // Knowledge gaps
        ...gaps.map(gap => ({
          section: "Knowledge Gaps",
          metric: gap.topic,
          value: gap.volume,
          ctr: gap.ctr,
          type: gap.type,
          region: gap.region,
          specialty: gap.specialty
        }))
      ];

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `synduct-signals-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const element = document.querySelector("main") as HTMLElement;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`synduct-signals-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h2>Summary Generator</h2>
      
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={generateSummary}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: 4,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {summary && (
        <div>
          <div style={{ 
            padding: 20, 
            border: "1px solid #ddd", 
            borderRadius: 8, 
            backgroundColor: "#f9f9f9",
            marginBottom: 24
          }}>
            <h3>Generated Summary</h3>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
              Generated at: {new Date(summary.generatedAt).toLocaleString()}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {/* Key Metrics */}
              <div>
                <h4>Key Metrics</h4>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {summary.keyMetrics.map((metric, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>{metric}</li>
                  ))}
                </ul>
              </div>

              {/* Emerging Topics */}
              <div>
                <h4>Emerging Topics</h4>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {summary.emergingTopics.map((topic, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>{topic}</li>
                  ))}
                </ul>
              </div>

              {/* Knowledge Gaps */}
              <div>
                <h4>Knowledge Gaps</h4>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {summary.knowledgeGaps.map((gap, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>{gap}</li>
                  ))}
                </ul>
              </div>

              {/* Top Evidence */}
              <div>
                <h4>Top Evidence</h4>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {summary.topEvidence.map((evidence, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>{evidence}</li>
                  ))}
                </ul>
              </div>

              {/* Regional Highlights */}
              <div>
                <h4>Regional Highlights</h4>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {summary.regionalHighlights.map((highlight, index) => (
                    <li key={index} style={{ marginBottom: 8 }}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={exportCSV}
              disabled={exporting}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: exporting ? "not-allowed" : "pointer"
              }}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
            
            <button
              onClick={exportPDF}
              disabled={exporting}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: exporting ? "not-allowed" : "pointer"
              }}
            >
              {exporting ? "Exporting..." : "Export PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}