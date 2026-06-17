"use client";

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { 
  api, 
  Company, 
  Controversy, 
  TrendReport, 
  TaxonomyItem, 
  OverviewStats, 
  FilterParams 
} from "@/lib/api";
import FilterPanel from "@/components/filters/FilterPanel";
import IntelligenceSidebar from "@/components/sidebar/IntelligenceSidebar";
import CompanyCard from "@/components/cards/CompanyCard";
import TrendChart from "@/components/charts/TrendChart";
import CategoryChart from "@/components/charts/CategoryChart";
import SectorChart from "@/components/charts/SectorChart";
import { AlertCircle, RefreshCw, Layers, ShieldCheck } from "lucide-react";

// Dynamically import the map to prevent SSR issues with Leaflet
const SignalMap = dynamic(() => import("@/components/map/SignalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] md:min-h-[550px] bg-[#0B1117] border border-border rounded-xl flex flex-col items-center justify-center space-y-3 animate-pulse glass-panel">
      <div className="w-12 h-12 rounded-full border-4 border-t-primary border-border animate-spin"></div>
      <p className="text-xs font-mono text-gray-400">Loading Geospatial Engine...</p>
    </div>
  ),
});

const DEFAULT_FILTERS: FilterParams = {
  country: "",
  sector: "",
  company: "",
  category: "",
  min_severity: 30,
  max_severity: 100,
  start_date: "",
  end_date: "",
};

export default function DashboardPage() {
  // Data States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyItem[]>([]);
  const [overview, setOverview] = useState<OverviewStats>({
    total_signals: 0,
    high_risk_companies: 0,
    average_severity: 0.0,
    last_30_day_trend: 0.0,
  });
  const [trends, setTrends] = useState<TrendReport>({
    time_series: [],
    by_category: [],
    by_sector: [],
  });
  const [controversies, setControversies] = useState<Controversy[]>([]);

  // Interactive UI States
  const [filters, setFilters] = useState<FilterParams>(DEFAULT_FILTERS);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadAllData = async (activeFilters: FilterParams = DEFAULT_FILTERS, isRetry = false) => {
    if (isRetry) {
      setIsLoading(true);
    }
    setError(null);
    try {
      // 1. Fetch metadata in parallel (companies, taxonomy, overview stats, trends)
      // Only do this on initial load
      if (companies.length === 0 || isRetry) {
        const [comps, tax, stats, trendData] = await Promise.all([
          api.getCompanies(),
          api.getTaxonomy(),
          api.getOverview(),
          api.getTrends(),
        ]);
        setCompanies(comps);
        setTaxonomy(tax);
        setOverview(stats);
        setTrends(trendData);
      }

      // 2. Fetch controversies based on active filters
      const contData = await api.getControversies(activeFilters);
      setControversies(contData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish secure connection with Real Rails Intelligence network.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    
    // Check if the selected company fits the sector/country filter
    if (selectedCompany) {
      const compDetails = companies.find((c) => c.name === selectedCompany);
      if (compDetails) {
        if (newFilters.country && compDetails.country !== newFilters.country) {
          setSelectedCompany(null);
        } else if (newFilters.sector && compDetails.sector !== newFilters.sector) {
          setSelectedCompany(null);
        } else if (newFilters.company && compDetails.name !== newFilters.company) {
          setSelectedCompany(null);
        }
      }
    }

    startTransition(async () => {
      try {
        const filteredCont = await api.getControversies(newFilters);
        setControversies(filteredCont);
      } catch (err: any) {
        setError("Error updating filtered records: " + err.message);
      }
    });
  };

  const handleSelectCompany = (companyName: string) => {
    setSelectedCompany(companyName);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedCompany(null);
    handleFilterChange(DEFAULT_FILTERS);
  };

  const handleDownload = () => {
    api.exportToCsv(controversies);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between p-6 space-y-6">
        {/* Header Loading Skeleton */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="h-6 w-64 bg-card rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-card rounded animate-pulse"></div>
        </div>
        {/* Main Grid Skeleton */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-[500px] bg-card rounded-xl animate-pulse border border-border"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-60 bg-card rounded-xl animate-pulse border border-border"></div>
              <div className="h-60 bg-card rounded-xl animate-pulse border border-border"></div>
              <div className="h-60 bg-card rounded-xl animate-pulse border border-border"></div>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div className="h-96 bg-card rounded-xl animate-pulse border border-border"></div>
            <div className="h-60 bg-card rounded-xl animate-pulse border border-border"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Platform Header */}
      <header className="border-b border-border bg-card/45 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary text-glow-primary" />
              <h1 className="text-lg font-extrabold uppercase tracking-widest font-mono text-gray-100">
                ESG Controversy Signal Map
              </h1>
            </div>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider">
              REAL RAILS GOVERNANCE & TRUST Platform // POC-66
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            {/* Connection Status indicator */}
            <div className="flex items-center gap-1.5 bg-background border border-border/80 px-2.5 py-1 rounded">
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              <span>Network status: {error ? 'DISCONNECTED' : 'ENCRYPTED'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-background border border-border/80 px-2.5 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Auth: SECURE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Error State Banner */}
        {error && (
          <div className="bg-red-950/80 border border-red-900 text-red-400 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">System Connection Fault</p>
                <p className="text-xs text-red-500 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadAllData(filters, true)}
              className="flex items-center gap-1.5 bg-red-900/40 border border-red-800 hover:bg-red-900/60 text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconnect Gateway
            </button>
          </div>
        )}

        {/* SECTION 4: Filters */}
        <FilterPanel
          companies={companies}
          categories={taxonomy}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Dashboard Layout (Left 70%, Right 30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          
          {/* LEFT SIDE (70% width / col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Map Container */}
            <div className="h-[400px] md:h-[550px] w-full relative">
              <SignalMap
                controversies={controversies}
                onSelectCompany={handleSelectCompany}
                selectedCompany={selectedCompany}
              />
              {isPending && (
                <div className="absolute inset-0 bg-[#030712]/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-[1000]">
                  <div className="flex items-center gap-2 bg-[#0B1117] border border-border px-4 py-2.5 rounded-lg text-xs font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    <span>Filtering Signal Streams...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Empty State Banner */}
            {!isPending && controversies.length === 0 && (
              <div className="border border-dashed border-border rounded-xl p-8 text-center text-gray-500 font-mono text-xs">
                No active signals found matching the current filtration parameters. Reset criteria to restore views.
              </div>
            )}

            {/* CHARTS CONTAINER (Grid of 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Chart 1: controversies over time */}
              <div className="border border-border bg-card p-4 rounded-xl glass-panel">
                <TrendChart data={trends.time_series} />
              </div>

              {/* Chart 2: ESG Category Density */}
              <div className="border border-border bg-card p-4 rounded-xl glass-panel">
                <CategoryChart data={trends.by_category} />
              </div>

              {/* Chart 3: Sector Risk Ranking */}
              <div className="border border-border bg-card p-4 rounded-xl glass-panel">
                <SectorChart data={trends.by_sector} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (30% width / col-span-3) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Target Dossier (Company Card) */}
            <CompanyCard
              companyName={selectedCompany}
              companies={companies}
              controversies={controversies}
              onClear={() => setSelectedCompany(null)}
            />

            {/* Metrics & Authority Sidebar */}
            <IntelligenceSidebar
              stats={overview}
              controversies={controversies}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-4 px-6 text-center text-[10px] text-gray-500 font-mono">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 Real Rails Governance Library. All credentials verified.</span>
          <span>Security Classification: SECRET // COMPLIANCE PARITY LEVEL V</span>
        </div>
      </footer>
    </div>
  );
}
