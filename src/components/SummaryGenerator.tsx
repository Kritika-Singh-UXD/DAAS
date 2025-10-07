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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Summary Generator</h2>
      </div>
      
      {/* Summary Generator Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Clean Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Summary & Export</h3>
            <p className="text-sm text-gray-500 mt-1">
              Generate comprehensive summaries and export your analysis data
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Generate Summary Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={generateSummary}
              disabled={loading}
              className={`
                inline-flex items-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95'
                }
                text-white shadow-lg
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Summary...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Generate Summary
                </>
              )}
            </button>
          </div>

          {summary && (
            <div className="space-y-6">
              {/* Summary Content */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Generated Summary</h4>
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-md border border-gray-200">
                      Generated: {new Date(summary.generatedAt).toLocaleDateString()} at {new Date(summary.generatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Key Metrics Card */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-900">Key Metrics</h5>
                      </div>
                      <ul className="space-y-2">
                        {summary.keyMetrics.map((metric, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Emerging Topics Card */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-900">Emerging Topics</h5>
                      </div>
                      <ul className="space-y-2">
                        {summary.emergingTopics.map((topic, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Knowledge Gaps Card */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-900">Knowledge Gaps</h5>
                      </div>
                      <ul className="space-y-2">
                        {summary.knowledgeGaps.map((gap, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Top Evidence Card */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-900">Top Evidence</h5>
                      </div>
                      <ul className="space-y-2">
                        {summary.topEvidence.map((evidence, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Regional Highlights Card */}
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <h5 className="font-semibold text-gray-900">Regional Highlights</h5>
                      </div>
                      <ul className="space-y-2">
                        {summary.regionalHighlights.map((highlight, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Section */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Export Options</h4>
                  <p className="text-sm text-gray-500 mt-1">Download your analysis data in different formats</p>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={exportCSV}
                      disabled={exporting}
                      className={`
                        inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200
                        ${exporting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95'
                        }
                        text-white shadow-md
                      `}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      {exporting ? "Exporting..." : "Export CSV"}
                    </button>
                    
                    <button
                      onClick={exportPDF}
                      disabled={exporting}
                      className={`
                        inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200
                        ${exporting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95'
                        }
                        text-white shadow-md
                      `}
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      {exporting ? "Exporting..." : "Export PDF"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}