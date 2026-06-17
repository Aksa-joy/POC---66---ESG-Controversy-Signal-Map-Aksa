"use client";

import { OverviewStats, Controversy } from "@/lib/api";
import { Radio, AlertTriangle, Activity, TrendingUp, Download, Info, ShieldAlert } from "lucide-react";

interface IntelligenceSidebarProps {
  stats: OverviewStats;
  controversies: Controversy[];
  onDownload: () => void;
}

export default function IntelligenceSidebar({ stats, controversies, onDownload }: IntelligenceSidebarProps) {
  
  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-red-400";
    if (trend < 0) return "text-green-400";
    return "text-gray-400";
  };

  const trendSign = stats.last_30_day_trend > 0 ? "+" : "";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* SECTION 1: ESG Controversy Overview */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
          Section 1: Risk Overview
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Total Signals */}
          <div className="border border-border bg-card p-3 rounded-lg flex flex-col justify-between space-y-1.5 glow-card">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[9px] uppercase tracking-wider font-mono">Total Signals</span>
              <Radio className="w-3.5 h-3.5 text-primary text-glow-primary animate-pulse" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-gray-100">{stats.total_signals}</div>
              <div className="text-[9px] text-gray-500 font-mono">Active tracking log</div>
            </div>
          </div>

          {/* High Risk Companies */}
          <div className="border border-border bg-card p-3 rounded-lg flex flex-col justify-between space-y-1.5 glow-card">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[9px] uppercase tracking-wider font-mono">High Risk Co.</span>
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-gray-100">{stats.high_risk_companies}</div>
              <div className="text-[9px] text-gray-500 font-mono">Avg Severity &gt; 75.0</div>
            </div>
          </div>

          {/* Average Severity Score */}
          <div className="border border-border bg-card p-3 rounded-lg flex flex-col justify-between space-y-1.5 glow-card">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[9px] uppercase tracking-wider font-mono">Avg Severity</span>
              <Activity className="w-3.5 h-3.5 text-secondary text-glow-secondary" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-gray-100">{stats.average_severity}</div>
              <div className="text-[9px] text-gray-500 font-mono">Scale 30 - 100</div>
            </div>
          </div>

          {/* Last 30 Day Trend */}
          <div className="border border-border bg-card p-3 rounded-lg flex flex-col justify-between space-y-1.5 glow-card">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[9px] uppercase tracking-wider font-mono">30d Trend</span>
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div>
              <div className={`text-xl font-bold font-mono ${getTrendColor(stats.last_30_day_trend)}`}>
                {trendSign}{stats.last_30_day_trend}%
              </div>
              <div className="text-[9px] text-gray-500 font-mono">vs previous 30 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Why This Matters */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
          Section 2: Mandate Narrative
        </h3>
        <div className="border border-border bg-[#0B1117] p-3 rounded-lg space-y-1.5 glass-panel">
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold font-mono">
            <Info className="w-4 h-4 text-primary" />
            Why This Matters
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Governance failures, environmental incidents, labor violations and ethical controversies
            directly influence public trust, regulatory attention and investment decisions.
          </p>
        </div>
      </div>

      {/* SECTION 3: Who Controls The Rail */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
          Section 3: Stakeholder Control Map
        </h3>
        <div className="border border-border bg-card p-3.5 rounded-lg space-y-2.5 glass-panel">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold font-mono">
            <ShieldAlert className="w-4 h-4 text-secondary" />
            Governance Authority Actors
          </div>
          
          <ul className="text-xs font-mono space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
              <span className="font-bold text-gray-200">Regulators:</span> Mandates disclosure audits & legal enforcement.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
              <span className="font-bold text-gray-200">Institutional Investors:</span> Allocates capital based on ESG risk limits.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
              <span className="font-bold text-gray-200">ESG Rating Agencies:</span> Adjusts credit rating parameters & risk levels.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
              <span className="font-bold text-gray-200">Public Markets:</span> Trades volatility indicators on brand sentiments.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>
              <span className="font-bold text-gray-200">Media Organizations:</span> Amplifies signal tracking & public coverage.
            </li>
          </ul>
        </div>
      </div>

      {/* SECTION 5: Download Sample Data Button */}
      <div className="pt-2">
        <button
          onClick={onDownload}
          disabled={controversies.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary text-gray-950 font-semibold px-4 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-primary/10 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download Sample Data ({controversies.length} Signals)
        </button>
        <p className="text-[10px] text-gray-500 font-mono text-center mt-1.5">
          Exports active filter result database directly to CSV format.
        </p>
      </div>
    </div>
  );
}
