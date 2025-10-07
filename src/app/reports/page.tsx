"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  const TabButton = ({ id, label, active }: { id: string; label: string; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "12px 24px",
        backgroundColor: active ? "#007bff" : "#f8f9fa",
        color: active ? "white" : "black",
        border: "1px solid #ddd",
        borderRadius: active ? "8px 8px 0 0" : "8px",
        marginRight: 4,
        cursor: "pointer",
        fontWeight: active ? "bold" : "normal"
      }}
    >
      {label}
    </button>
  );

  const TableContainer = ({ children }: { children: React.ReactNode }) => (
    <div style={{ 
      overflowX: "auto", 
      border: "1px solid #ddd", 
      borderRadius: "0 8px 8px 8px",
      backgroundColor: "white"
    }}>
      {children}
    </div>
  );

  const Table = ({ children }: { children: React.ReactNode }) => (
    <table style={{ 
      width: "100%", 
      borderCollapse: "collapse",
      fontSize: 14
    }}>
      {children}
    </table>
  );

  const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <thead style={{ backgroundColor: "#f8f9fa" }}>
      {children}
    </thead>
  );

  const TableRow = ({ children }: { children: React.ReactNode }) => (
    <tr style={{ borderBottom: "1px solid #eee" }}>
      {children}
    </tr>
  );

  const TableCell = ({ children, header = false }: { children: React.ReactNode; header?: boolean }) => (
    <td style={{ 
      padding: "12px 16px", 
      textAlign: header ? "left" : "left",
      fontWeight: header ? "bold" : "normal",
      borderRight: "1px solid #eee"
    }}>
      {children}
    </td>
  );

  const renderOverviewTable = () => {
    if (!data.overview) return <div>No overview data</div>;

    return (
      <div>
        <h3>KPI Overview</h3>
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

        <h3 style={{ marginTop: 32 }}>Trend Data</h3>
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
    );
  };

  const renderTherapeuticTable = () => (
    <div>
      <h3>Therapeutic Topics</h3>
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

  const renderDrugTrendsTable = () => (
    <div>
      <h3>Drug Trends</h3>
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

      <h3 style={{ marginTop: 32 }}>Drug Time Series Data</h3>
      {data.drugTrends.map((drug, drugIndex) => (
        <div key={drugIndex} style={{ marginBottom: 24 }}>
          <h4>{drug.drug} - Volume Over Time</h4>
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
  );

  const renderGapsTable = () => (
    <div>
      <h3>Knowledge Gaps</h3>
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

  const renderEvidenceTable = () => {
    if (!data.evidence) return <div>No evidence data</div>;

    return (
      <div>
        <h3>Evidence Nodes</h3>
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

        <h3 style={{ marginTop: 32 }}>Evidence Network Connections</h3>
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

        <h3 style={{ marginTop: 32 }}>Evidence Timeline</h3>
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
        <h3>Geographic Data Points</h3>
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

        <h3 style={{ marginTop: 32 }}>Specialty Engagement</h3>
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
      return <div style={{ padding: 40, textAlign: "center" }}>Loading reports data...</div>;
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
              <Link href="/" style={{ textDecoration: "none", color: "#6c757d" }}>Dashboard</Link>
              <span style={{ color: "#007bff", fontWeight: "bold" }}>Reports</span>
              <Link href="/scenarios" style={{ textDecoration: "none", color: "#6c757d" }}>Saved Scenarios</Link>
              <Link href="/settings" style={{ textDecoration: "none", color: "#6c757d" }}>Settings</Link>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h2>Raw Data Reports</h2>
          <p style={{ color: "#6c757d", marginBottom: 24 }}>
            Detailed tabular data for all dashboard metrics. Data is filtered based on current filter selections.
          </p>

          {/* Tab Navigation */}
          <div style={{ marginBottom: 0 }}>
            <TabButton id="overview" label="Overview" active={activeTab === "overview"} />
            <TabButton id="therapeutic" label="Therapeutic Topics" active={activeTab === "therapeutic"} />
            <TabButton id="drugTrends" label="Drug Trends" active={activeTab === "drugTrends"} />
            <TabButton id="gaps" label="Knowledge Gaps" active={activeTab === "gaps"} />
            <TabButton id="evidence" label="Evidence Network" active={activeTab === "evidence"} />
            <TabButton id="geography" label="Geography" active={activeTab === "geography"} />
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: 400 }}>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}