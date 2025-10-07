# Synduct Signals

A fully-functional DaaS dashboard that visualizes anonymized, aggregated physician behavior from DR.INFO to support regional drug launches.

## Features

- **Real-time filtering** by region, therapeutic areas, drugs, specialties, and data sources
- **Interactive KPI overview** with trend analysis and event annotations
- **Therapeutic topic explorer** with heatmap visualization and engagement comparison
- **Drug trend analysis** with multi-series charts and performance tables
- **Knowledge gap finder** with scatter plot analysis and severity ranking
- **Evidence impact tracker** with network visualization and timeline
- **Geographic specialty mapping** with regional intensity and specialty breakdowns
- **Summary generator** with CSV and PDF export capabilities
- **Scenario management** with save/load functionality

## Technology Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Recharts** for data visualization
- **react-simple-maps** for geographic mapping
- **Zustand** for state management
- **Day.js** for date handling
- **Papaparse** for CSV export
- **html2canvas + jsPDF** for PDF export

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```
src/
├── app/
│   ├── api/signals/          # Mock API routes
│   ├── layout.tsx            # App layout
│   └── page.tsx              # Main dashboard page
├── components/               # Dashboard components
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── api.ts                # API client functions
│   └── mock.ts               # Mock data utilities
└── store/
    └── filters.ts            # Zustand filter store
```

## API Endpoints

All API routes are under `/api/signals/`:

- `/overview` - KPI overview with trend data
- `/therapeutic` - Therapeutic topic analysis
- `/drug-trends` - Drug performance trends
- `/gaps` - Knowledge gap analysis
- `/evidence` - Evidence impact tracking
- `/geography` - Geographic and specialty data
- `/summary` - Generated insights summary

## Key Components

- **SynductFilterBar** - Multi-dimensional filtering interface
- **OverviewPanel** - KPI cards with interactive trend chart
- **TherapeuticExplorer** - Topic heatmap and comparison tools
- **DrugTrendExplorer** - Multi-drug trend analysis
- **KnowledgeGapFinder** - Gap severity analysis with scatter plots
- **EvidenceImpactTracker** - Evidence network and timeline
- **GeographicSpecialtyMap** - Regional analysis with world map
- **SummaryGenerator** - Automated insights with export features

## Data Features

- **Deterministic mock data** - Seeded RNG ensures consistent results
- **Filter-responsive APIs** - All endpoints respect filter parameters
- **Time-based analysis** - Configurable date ranges with trend analysis
- **Regional scaling** - Data volumes scale based on selected regions
- **Event annotations** - Special events (e.g., "ESMO 2024") highlighted in trends

## Export Capabilities

- **CSV Export** - Complete dataset export with all metrics
- **PDF Export** - Full dashboard screenshot with professional formatting
- **Scenario Management** - Save and load filter configurations

## Development

The dashboard uses mock APIs with realistic data patterns. All components are fully interactive and update based on filter selections. The data is deterministic (seeded) to ensure consistent experiences across sessions.

For production deployment, replace the mock APIs with real data endpoints matching the same interface contracts defined in `src/lib/types.ts`.