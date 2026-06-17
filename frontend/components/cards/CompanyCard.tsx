"use client";

import { Company, Controversy } from "@/lib/api";
import { Building2, Globe, ShieldAlert, BookOpen, ExternalLink, X } from "lucide-react";

interface CompanyCardProps {
  companyName: string | null;
  companies: Company[];
  controversies: Controversy[];
  onClear: () => void;
}

export default function CompanyCard({ companyName, companies, controversies, onClear }: CompanyCardProps) {
  if (!companyName) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl text-center">
        <Building2 className="w-10 h-10 text-gray-500 mb-3" />
        <p className="text-sm font-medium text-gray-400">No company profile selected</p>
        <p className="text-xs text-gray-500 max-w-[200px] mt-1">
          Click a map marker or search from filters to drill down into corporate governance risks.
        </p>
      </div>
    );
  }

  const company = companies.find((c) => c.name.toLowerCase() === companyName.toLowerCase());
  const companyControversies = controversies.filter(
    (c) => c.company.toLowerCase() === companyName.toLowerCase()
  );

  const avgSeverity = companyControversies.length
    ? round(companyControversies.reduce((sum, c) => sum + c.severity, 0) / companyControversies.length, 1)
    : 0;

  function round(value: number, decimals: number) {
    return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
  }

  const getRiskBadge = (sev: number) => {
    if (sev >= 80) return { label: "CRITICAL RISK", bg: "bg-red-950/80 text-red-400 border-red-800" };
    if (sev >= 65) return { label: "HIGH RISK", bg: "bg-orange-950/80 text-orange-400 border-orange-800" };
    return { label: "MODERATE RISK", bg: "bg-yellow-950/80 text-yellow-400 border-yellow-800" };
  };

  const riskBadge = getRiskBadge(avgSeverity);

  return (
    <div className="w-full flex flex-col h-full border border-border bg-card rounded-xl overflow-hidden glass-panel">
      {/* Header */}
      <div className="flex justify-between items-start p-4 border-b border-border/80 bg-[#070b0f] ">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-gray-100">{company?.name || companyName}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {company?.country || "Global"}
            </span>
            <span>•</span>
            <span>{company?.sector || "General"}</span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-gray-200 p-1 hover:bg-gray-800 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 border-b border-border/80 bg-background/30 text-center text-xs font-mono font-semibold">
        <div className="p-3 border-r border-border/80">
          <div className="text-gray-400 uppercase tracking-wider text-[9px] mb-1">Pillar Incidents</div>
          <div className="text-lg font-bold text-gray-200">{companyControversies.length}</div>
        </div>
        <div className="p-3">
          <div className="text-gray-400 uppercase tracking-wider text-[9px] mb-1">Avg Severity</div>
          <div className="text-lg font-bold text-gray-200">{avgSeverity}</div>
        </div>
      </div>

      {/* Risk Alert Badge */}
      <div className="px-4 py-2 bg-background/20 border-b border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase text-gray-400 font-mono font-bold tracking-wider">
            Risk Tier Profile
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${riskBadge.bg}`}>
            {riskBadge.label}
          </span>
        </div>
      </div>

      {/* Controversy Dossier */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
        <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 font-mono flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-secondary" />
          Active Incident Dossier ({companyControversies.length})
        </h4>

        {companyControversies.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No controversy events found for this filter combination.</p>
        ) : (
          companyControversies.map((cont) => (
            <div key={cont.id} className="border border-border/80 bg-background/40 p-3 rounded-lg space-y-2.5">
              <div className="flex justify-between items-start gap-3">
                <span className="text-xs font-semibold text-gray-200 font-mono bg-border px-1.5 py-0.5 rounded">
                  {cont.category}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{cont.date}</span>
              </div>

              {/* GDELT Headline */}
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-gray-500 font-mono font-bold">News Signal (GDELT)</div>
                <h5 className="text-xs font-medium text-gray-300 leading-snug">{cont.headline}</h5>
                <a
                  href={cont.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[10px] text-primary hover:underline font-mono"
                >
                  Source Registry ({cont.source_domain})
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              {/* SEC Disclosure */}
              <div className="border-t border-border/60 pt-2 space-y-1">
                <div className="text-[9px] uppercase tracking-wider text-gray-500 font-mono font-bold flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-secondary" />
                  SEC Disclosure ({cont.filing_type})
                </div>
                <p className="text-[11px] italic text-gray-400 leading-snug">
                  {cont.sec_disclosure}
                </p>
                <a
                  href={cont.sec_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[10px] text-secondary hover:underline font-mono"
                >
                  SEC EDGAR Archive
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
