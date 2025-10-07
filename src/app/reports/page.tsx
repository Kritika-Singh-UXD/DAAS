"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useFilters } from "@/store/filters";
import { 
  fetchOverview, 
  fetchTherapeutic, 
  fetchDrugTrends, 
  fetchGaps, 
  fetchEvidence, 
  fetchGeography 
} from "@/lib/api";
import type { 
  KPIOverview, 
  TherapeuticTopic, 
  DrugTrendRow, 
  GapRow, 
  EvidenceImpact, 
  GeoPayload 
} from "@/lib/types";

export default function ReportsPage() {
  const { filters } = useFilters();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{
    overview: KPIOverview | null;
    therapeutic: TherapeuticTopic[];
    drugTrends: DrugTrendRow[];
    gaps: GapRow[];
    evidence: EvidenceImpact | null;
    geography: GeoPayload | null;
  }>({
    overview: null,
    therapeutic: [],
    drugTrends: [],
    gaps: [],
    evidence: null,
    geography: null,
  });

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [overview, therapeutic, drugTrends, gaps, evidence, geography] = await Promise.all([
          fetchOverview(filters),
          fetchTherapeutic(filters),
          fetchDrugTrends(filters),
          fetchGaps(filters),
          fetchEvidence(filters),
          fetchGeography(filters),
        ]);

        setData({
          overview,
          therapeutic,
          drugTrends,
          gaps,
          evidence,
          geography,
        });
      } catch (error) {
        console.error("Failed to fetch reports data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [filters]);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  const exportToCSV = () => {
    setExporting('csv');
    try {
      let csvContent = '';
      
      // Add header with timestamp and filters
      csvContent += `Synduct Signals Report\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `Active Tab: ${activeTab}\n\n`;
      
      // Export data based on active tab
      switch (activeTab) {
        case 'overview':
          if (data.overview) {
            csvContent += `KPI Overview\n`;
            csvContent += `Metric,Value\n`;
            csvContent += `Total Sessions,${data.overview.totalSessions}\n`;
            csvContent += `Active Doctors,${data.overview.activeDoctors}\n`;
            csvContent += `Average Session Duration,${Math.floor(data.overview.avgSessionDurationSec / 60)}m ${data.overview.avgSessionDurationSec % 60}s\n`;
            csvContent += `Top Drugs,"${data.overview.topDrugs.join(', ')}"\n`;
            csvContent += `Top Therapeutic Areas,"${data.overview.topTherapeuticAreas.join(', ')}"\n\n`;
            
            csvContent += `Trend Data\n`;
            csvContent += `Date,Searches,Notes\n`;
            data.overview.trend.forEach(point => {
              csvContent += `${new Date(point.date).toLocaleDateString()},${point.searches},"${point.note || ''}"\n`;
            });
          }
          break;
        case 'therapeutic':
          csvContent += `Therapeutic Topics\n`;
          csvContent += `Topic,Search Volume,Engagement,Top Specialty,Guideline Sources,Research Sources,Drug DB Sources,Clinical Trial Sources\n`;
          data.therapeutic.forEach(topic => {
            csvContent += `"${topic.topic}",${topic.searchVolume},${(topic.engagement * 100).toFixed(1)}%,${topic.topSpecialty},${topic.sourceBreakdown.Guideline},${topic.sourceBreakdown.Research},${topic.sourceBreakdown.DrugDB},${topic.sourceBreakdown.ClinicalTrial}\n`;
          });
          break;
        case 'drugTrends':
          csvContent += `Drug Trends\n`;
          csvContent += `Drug,Total Queries,CTR,Avg Session Time,Top Region,Top Specialty,Co-searched Terms\n`;
          data.drugTrends.forEach(drug => {
            csvContent += `"${drug.drug}",${drug.totalQueries},${(drug.ctr * 100).toFixed(1)}%,${Math.floor(drug.avgSessionTimeSec / 60)}m ${drug.avgSessionTimeSec % 60}s,${drug.topRegion},${drug.topSpecialty},"${drug.coSearched.join(', ')}"\n`;
          });
          break;
        case 'gaps':
          csvContent += `Knowledge Gaps\n`;
          csvContent += `Topic,Volume,CTR,Gap Severity,Type,Specialty,Region,Suggested Action\n`;
          data.gaps.forEach(gap => {
            csvContent += `"${gap.topic}",${gap.volume},${(gap.ctr * 100).toFixed(1)}%,${(gap.volume * (1 - gap.ctr)).toFixed(0)},${gap.type},${gap.specialty},${gap.region},"${gap.suggestedAction}"\n`;
          });
          break;
        case 'evidence':
          if (data.evidence) {
            csvContent += `Evidence Nodes\n`;
            csvContent += `ID,Title,Type,Engagement,DOI,Released Date\n`;
            data.evidence.nodes.forEach(node => {
              csvContent += `${node.id},"${node.title}",${node.type},${(node.engagement * 100).toFixed(1)}%,${node.doi || ''},${new Date(node.releasedOn).toLocaleDateString()}\n`;
            });
          }
          break;
        case 'geography':
          if (data.geography) {
            csvContent += `Geographic Data\n`;
            csvContent += `Region,Intensity Value,Top Drug,Avg Sessions per Doctor,Dominant Specialty\n`;
            data.geography.points.forEach(point => {
              csvContent += `${point.region},${(point.value * 100).toFixed(1)}%,${point.topDrug},${point.avgSessionsPerDoctor},${point.dominantSpecialty}\n`;
            });
          }
          break;
      }

      // Create and download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `synduct-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(null);
      setShowExportMenu(false);
    }
  };

  const exportToPDF = async () => {
    setExporting('pdf');
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add header
      pdf.setFontSize(20);
      pdf.text('Synduct Signals Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      pdf.text(`Report Type: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 20, 40);
      
      // Capture the table content
      const element = document.querySelector('.min-h-96') as HTMLElement;
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 50;
        
        // Add first page
        if (heightLeft <= pageHeight - 60) {
          pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        } else {
          pdf.addImage(imgData, 'PNG', 20, position, imgWidth, pageHeight - 60);
          heightLeft -= (pageHeight - 60);
          
          // Add additional pages if needed
          while (heightLeft > 0) {
            pdf.addPage();
            position = heightLeft - imgHeight + 20;
            pdf.addImage(imgData, 'PNG', 20, position, imgWidth, heightLeft > pageHeight - 40 ? pageHeight - 40 : heightLeft);
            heightLeft -= (pageHeight - 40);
          }
        }
      }
      
      pdf.save(`synduct-report-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExporting(null);
      setShowExportMenu(false);
    }
  };

  const TabButton = ({ id, label, active }: { id: string; label: string; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
        active 
          ? "text-blue-600 border-blue-600 bg-blue-50" 
          : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );

  const TableContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );

  const Table = ({ children }: { children: React.ReactNode }) => (
    <table className="w-full text-sm">
      {children}
    </table>
  );

  const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-50 border-b border-gray-100">
      {children}
    </thead>
  );

  const TableRow = ({ children }: { children: React.ReactNode }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      {children}
    </tr>
  );

  const TableCell = ({ children, header = false }: { children: React.ReactNode; header?: boolean }) => (
    <td className={`px-4 py-3 text-left ${header ? "font-medium text-gray-900" : "text-gray-700"}`}>
      {children}
    </td>
  );

  const renderOverviewTable = () => {
    if (!data.overview) return <div>No overview data</div>;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">KPI Overview</h3>
          <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Metric</TableCell>
                <TableCell header>Value</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              <TableRow>
                <TableCell>Total Sessions</TableCell>
                <TableCell>{data.overview.totalSessions.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Active Doctors</TableCell>
                <TableCell>{data.overview.activeDoctors.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Average Session Duration</TableCell>
                <TableCell>{Math.floor(data.overview.avgSessionDurationSec / 60)}m {data.overview.avgSessionDurationSec % 60}s</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Top Drugs</TableCell>
                <TableCell>{data.overview.topDrugs.join(", ")}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Top Therapeutic Areas</TableCell>
                <TableCell>{data.overview.topTherapeuticAreas.join(", ")}</TableCell>
              </TableRow>
            </tbody>
          </Table>
          </TableContainer>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trend Data</h3>
          <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Date</TableCell>
                <TableCell header>Searches</TableCell>
                <TableCell header>Notes</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {data.overview.trend.map((point, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(point.date).toLocaleDateString()}</TableCell>
                  <TableCell>{point.searches.toLocaleString()}</TableCell>
                  <TableCell>{point.note || "-"}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          </TableContainer>
        </div>
      </div>
    );
  };

  const renderTherapeuticTable = () => {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Therapeutic Topics</h3>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Topic</TableCell>
              <TableCell header>Search Volume</TableCell>
              <TableCell header>Engagement</TableCell>
              <TableCell header>Top Specialty</TableCell>
              <TableCell header>Guideline Sources</TableCell>
              <TableCell header>Research Sources</TableCell>
              <TableCell header>Drug DB Sources</TableCell>
              <TableCell header>Clinical Trial Sources</TableCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {data.therapeutic.map((topic, index) => (
              <TableRow key={index}>
                <TableCell>{topic.topic}</TableCell>
                <TableCell>{topic.searchVolume.toLocaleString()}</TableCell>
                <TableCell>{(topic.engagement * 100).toFixed(1)}%</TableCell>
                <TableCell>{topic.topSpecialty}</TableCell>
                <TableCell>{topic.sourceBreakdown.Guideline.toLocaleString()}</TableCell>
                <TableCell>{topic.sourceBreakdown.Research.toLocaleString()}</TableCell>
                <TableCell>{topic.sourceBreakdown.DrugDB.toLocaleString()}</TableCell>
                <TableCell>{topic.sourceBreakdown.ClinicalTrial.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </div>
    );
  };

  const renderDrugTrendsTable = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Drug Trends</h3>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Drug</TableCell>
              <TableCell header>Total Queries</TableCell>
              <TableCell header>CTR</TableCell>
              <TableCell header>Avg Session Time</TableCell>
              <TableCell header>Top Region</TableCell>
              <TableCell header>Top Specialty</TableCell>
              <TableCell header>Co-searched Terms</TableCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {data.drugTrends.map((drug, index) => (
              <TableRow key={index}>
                <TableCell>{drug.drug}</TableCell>
                <TableCell>{drug.totalQueries.toLocaleString()}</TableCell>
                <TableCell>{(drug.ctr * 100).toFixed(1)}%</TableCell>
                <TableCell>{Math.floor(drug.avgSessionTimeSec / 60)}m {drug.avgSessionTimeSec % 60}s</TableCell>
                <TableCell>{drug.topRegion}</TableCell>
                <TableCell>{drug.topSpecialty}</TableCell>
                <TableCell>{drug.coSearched.join(", ")}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
        </TableContainer>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Drug Time Series Data</h3>
        <div className="space-y-4">
          {data.drugTrends.map((drug, drugIndex) => (
            <div key={drugIndex}>
              <h4 className="text-base font-medium text-gray-800 mb-3">{drug.drug} - Volume Over Time</h4>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>Date</TableCell>
                  <TableCell header>Volume</TableCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {drug.series.map((point, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(point.date).toLocaleDateString()}</TableCell>
                    <TableCell>{point.volume.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  };

  const renderGapsTable = () => {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Knowledge Gaps</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Topic</TableCell>
                <TableCell header>Volume</TableCell>
                <TableCell header>CTR</TableCell>
                <TableCell header>Gap Severity</TableCell>
                <TableCell header>Type</TableCell>
                <TableCell header>Specialty</TableCell>
                <TableCell header>Region</TableCell>
                <TableCell header>Suggested Action</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {data.gaps.map((gap, index) => (
                <TableRow key={index}>
                  <TableCell>{gap.topic}</TableCell>
                  <TableCell>{gap.volume.toLocaleString()}</TableCell>
                  <TableCell>{(gap.ctr * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(gap.volume * (1 - gap.ctr)).toFixed(0)}</TableCell>
                  <TableCell>{gap.type}</TableCell>
                  <TableCell>{gap.specialty}</TableCell>
                  <TableCell>{gap.region}</TableCell>
                  <TableCell>{gap.suggestedAction}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  const renderEvidenceTable = () => {
    if (!data.evidence) return <div>No evidence data</div>;

    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence Nodes</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>ID</TableCell>
                <TableCell header>Title</TableCell>
                <TableCell header>Type</TableCell>
                <TableCell header>Engagement</TableCell>
                <TableCell header>DOI</TableCell>
                <TableCell header>Released Date</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {data.evidence.nodes.map((node, index) => (
                <TableRow key={index}>
                  <TableCell>{node.id}</TableCell>
                  <TableCell>{node.title}</TableCell>
                  <TableCell>{node.type}</TableCell>
                  <TableCell>{(node.engagement * 100).toFixed(1)}%</TableCell>
                  <TableCell>{node.doi || "-"}</TableCell>
                  <TableCell>{new Date(node.releasedOn).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Evidence Network Connections</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Source Node</TableCell>
                <TableCell header>Target Node</TableCell>
                <TableCell header>Connection Weight</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {data.evidence.edges.map((edge, index) => (
                <TableRow key={index}>
                  <TableCell>{edge.sourceId}</TableCell>
                  <TableCell>{edge.targetId}</TableCell>
                  <TableCell>{edge.weight.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Evidence Timeline</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Date</TableCell>
                <TableCell header>Engagement</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {data.evidence.timeline.map((point, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(point.date).toLocaleDateString()}</TableCell>
                  <TableCell>{point.engagement.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  const renderGeographyTable = () => {
    if (!data.geography) return <div>No geography data</div>;

    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Data Points</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Region</TableCell>
                <TableCell header>Intensity Value</TableCell>
                <TableCell header>Top Drug</TableCell>
                <TableCell header>Avg Sessions per Doctor</TableCell>
                <TableCell header>Dominant Specialty</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {data.geography.points.map((point, index) => (
                <TableRow key={index}>
                  <TableCell>{point.region}</TableCell>
                  <TableCell>{(point.value * 100).toFixed(1)}%</TableCell>
                  <TableCell>{point.topDrug}</TableCell>
                  <TableCell>{point.avgSessionsPerDoctor}</TableCell>
                  <TableCell>{point.dominantSpecialty}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Specialty Engagement</h3>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Specialty</TableCell>
                <TableCell header>Engagement Level</TableCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {data.geography.bySpecialty.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.specialty}</TableCell>
                  <TableCell>{(item.engagement * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
          <div className="text-gray-500">Loading reports data...</div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return renderOverviewTable();
      case "therapeutic":
        return renderTherapeuticTable();
      case "drugTrends":
        return renderDrugTrendsTable();
      case "gaps":
        return renderGapsTable();
      case "evidence":
        return renderEvidenceTable();
      case "geography":
        return renderGeographyTable();
      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Raw Data Reports</h2>
              <p className="text-gray-600 mt-1">
                Detailed tabular data for all dashboard metrics. Data is filtered based on current filter selections.
              </p>
            </div>
            
            {/* Export Report Button */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={loading || exporting !== null}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                  loading || exporting !== null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {exporting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Exporting {exporting.toUpperCase()}...
                  </span>
                ) : (
                  'Export Report'
                )}
              </button>
              
              {/* Export Dropdown Menu */}
              {showExportMenu && !loading && exporting === null && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={exportToPDF}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                      </svg>
                      Download as PDF
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      Download as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-0 border-b border-gray-200 mb-6">
            <TabButton id="overview" label="Overview" active={activeTab === "overview"} />
            <TabButton id="therapeutic" label="Therapeutic Topics" active={activeTab === "therapeutic"} />
            <TabButton id="drugTrends" label="Drug Trends" active={activeTab === "drugTrends"} />
            <TabButton id="gaps" label="Knowledge Gaps" active={activeTab === "gaps"} />
            <TabButton id="evidence" label="Evidence Network" active={activeTab === "evidence"} />
            <TabButton id="geography" label="Geography" active={activeTab === "geography"} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}