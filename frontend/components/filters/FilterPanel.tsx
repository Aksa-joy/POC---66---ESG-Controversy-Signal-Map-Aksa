"use client";

import { Company, TaxonomyItem, FilterParams } from "@/lib/api";
import { Search, RotateCcw, Filter } from "lucide-react";

interface FilterPanelProps {
  companies: Company[];
  categories: TaxonomyItem[];
  filters: FilterParams;
  onFilterChange: (newFilters: FilterParams) => void;
  onReset: () => void;
}

export default function FilterPanel({
  companies,
  categories,
  filters,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  // Extract unique countries
  const countries = Array.from(new Set(companies.map((c) => c.country))).sort();
  
  // Extract unique sectors
  const sectors = Array.from(new Set(companies.map((c) => c.sector))).sort();

  const handleSelectChange = (key: keyof FilterParams, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  const handleNumberChange = (key: keyof FilterParams, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value === "" ? undefined : Number(value),
    });
  };

  return (
    <div className="w-full border border-border bg-card rounded-xl p-4 glass-panel space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold font-mono tracking-wider uppercase text-gray-200">
            Intelligence Filters
          </h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary font-mono transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Country */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Country
          </label>
          <select
            value={filters.country || ""}
            onChange={(e) => handleSelectChange("country", e.target.value)}
            className="w-full text-xs bg-background border border-border hover:border-gray-600 focus:border-primary text-gray-200 rounded px-2.5 py-1.5 focus:outline-none transition font-mono"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Sector */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Sector
          </label>
          <select
            value={filters.sector || ""}
            onChange={(e) => handleSelectChange("sector", e.target.value)}
            className="w-full text-xs bg-background border border-border hover:border-gray-600 focus:border-primary text-gray-200 rounded px-2.5 py-1.5 focus:outline-none transition font-mono"
          >
            <option value="">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        {/* Company */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Company
          </label>
          <select
            value={filters.company || ""}
            onChange={(e) => handleSelectChange("company", e.target.value)}
            className="w-full text-xs bg-background border border-border hover:border-gray-600 focus:border-primary text-gray-200 rounded px-2.5 py-1.5 focus:outline-none transition font-mono"
          >
            <option value="">All Companies</option>
            {companies
              .filter((c) => !filters.sector || c.sector === filters.sector)
              .filter((c) => !filters.country || c.country === filters.country)
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            ESG Category
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) => handleSelectChange("category", e.target.value)}
            className="w-full text-xs bg-background border border-border hover:border-gray-600 focus:border-primary text-gray-200 rounded px-2.5 py-1.5 focus:outline-none transition font-mono"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.weight})
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Min Severity
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={filters.min_severity || 30}
              onChange={(e) => handleNumberChange("min_severity", e.target.value)}
              className="w-full accent-primary bg-background h-1 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-primary font-bold min-w-[20px]">
              {filters.min_severity || 30}+
            </span>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Date Range
          </label>
          <div className="flex gap-1.5">
            <input
              type="date"
              value={filters.start_date || ""}
              onChange={(e) => handleSelectChange("start_date", e.target.value)}
              className="w-1/2 text-[10px] bg-background border border-border text-gray-300 rounded p-1 focus:outline-none focus:border-primary font-mono"
            />
            <input
              type="date"
              value={filters.end_date || ""}
              onChange={(e) => handleSelectChange("end_date", e.target.value)}
              className="w-1/2 text-[10px] bg-background border border-border text-gray-300 rounded p-1 focus:outline-none focus:border-primary font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
