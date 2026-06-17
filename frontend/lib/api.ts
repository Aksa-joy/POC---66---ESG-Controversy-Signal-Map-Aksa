export interface Company {
  id: number;
  name: string;
  country: string;
  sector: string;
}

export interface Controversy {
  id: number;
  company: string;
  category: string;
  severity: number;
  country: string;
  date: string;
  latitude: number;
  longitude: number;
  source: string;
  sector: string;
  headline: string;
  url: string;
  source_domain: string;
  sec_disclosure: string;
  sec_url: string;
  filing_type: string;
}

export interface TrendPoint {
  date: string;
  count: number;
  avg_severity: number;
}

export interface CategoryPoint {
  category: string;
  count: number;
  avg_severity: number;
}

export interface SectorPoint {
  sector: string;
  count: number;
  avg_severity: number;
}

export interface TrendReport {
  time_series: TrendPoint[];
  by_category: CategoryPoint[];
  by_sector: SectorPoint[];
}

export interface TaxonomyItem {
  category: string;
  weight: number;
  description: string;
}

export interface OverviewStats {
  total_signals: number;
  high_risk_companies: number;
  average_severity: number;
  last_30_day_trend: number;
}

export interface FilterParams {
  country?: string;
  sector?: string;
  company?: string;
  category?: string;
  min_severity?: number;
  max_severity?: number;
  start_date?: string;
  end_date?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error (${response.status}): ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getCompanies: () => fetchJson<Company[]>("/api/companies"),
  
  getControversies: (filters?: FilterParams) => 
    fetchJson<Controversy[]>("/api/controversies", filters),
    
  getTrends: () => fetchJson<TrendReport>("/api/trends"),
  
  getTaxonomy: () => fetchJson<TaxonomyItem[]>("/api/taxonomy"),
  
  getOverview: () => fetchJson<OverviewStats>("/api/overview"),
  
  exportToCsv: (data: Controversy[], filename = "esg_controversies_export.csv") => {
    if (data.length === 0) return;
    
    // Define headers
    const headers = [
      "ID", "Company", "Category", "Sector", "Severity", 
      "Country", "Date", "Latitude", "Longitude", "Source", 
      "Source Domain", "Headline", "Filing Type", "SEC Disclosure Text"
    ];
    
    const rows = data.map(item => [
      item.id,
      `"${item.company.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      `"${item.sector.replace(/"/g, '""')}"`,
      item.severity,
      item.country,
      item.date,
      item.latitude,
      item.longitude,
      `"${item.source.replace(/"/g, '""')}"`,
      `"${item.source_domain?.replace(/"/g, '""') || ''}"`,
      `"${item.headline?.replace(/"/g, '""') || ''}"`,
      `"${item.filing_type?.replace(/"/g, '""') || ''}"`,
      `"${item.sec_disclosure?.replace(/"/g, '""') || ''}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
