"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import { SectorPoint } from "@/lib/api";

interface SectorChartProps {
  data: SectorPoint[];
}

const SECTOR_METRICS: Record<string, string> = {
  Energy: "Heavy exposure to environmental spills, health safety disputes, and carbon regulations.",
  Finance: "High vulnerability to accounting fraud, systemic corruption charges, and money laundering audits.",
  Technology: "Exposure to user data leaks, antitrust regulation, privacy litigation, and workforce safety.",
  Healthcare: "Drug testing protocols, quality control issues, patent disputes, and ethical marketing litigation.",
  Manufacturing: "Workplace injuries, chemical waste handling, raw material supply chain audits, and labor rights."
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const sectorName = payload[0].payload.sector;
    const desc = SECTOR_METRICS[sectorName] || "Industry-specific operational risk profile.";
    
    return (
      <div className="bg-[#0B1117] border border-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 backdrop-blur-md max-w-[240px]">
        <p className="font-semibold text-gray-200 font-mono tracking-wider uppercase">{sectorName} Sector</p>
        <p className="text-primary flex items-center justify-between gap-6">
          <span>Avg Severity:</span>
          <span className="font-bold font-mono text-gray-200">{payload[0].value}</span>
        </p>
        <p className="text-secondary flex items-center justify-between gap-6 font-medium">
          <span>Incident Count:</span>
          <span className="font-bold font-mono text-gray-200">{payload[0].payload.count}</span>
        </p>
        <div className="border-t border-border/60 pt-1.5 mt-1 text-[10px] text-gray-400 leading-relaxed">
          <p><span className="font-semibold text-gray-300">Sector Risks:</span> {desc}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function SectorChart({ data }: SectorChartProps) {
  // Sectors to show
  const allowedSectors = ["Energy", "Finance", "Technology", "Healthcare", "Manufacturing"];
  
  // Format and sort by average severity descending
  const formattedData = allowedSectors.map(sect => {
    const match = data.find(d => d.sector.toLowerCase() === sect.toLowerCase());
    return {
      sector: sect,
      avg_severity: match ? match.avg_severity : 0,
      count: match ? match.count : 0
    };
  }).sort((a, b) => b.avg_severity - a.avg_severity);

  // Gradient colors for high to moderate risk
  const colors = ["#EF4444", "#F97316", "#F59E0B", "#10B981", "#3B82F6"];

  return (
    <div className="w-full h-full min-h-[260px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-200 font-mono tracking-wider uppercase">Sector Risk Ranking</h3>
        <p className="text-[11px] text-gray-400">Average controversy severity scores by economic sector</p>
      </div>

      <div className="flex-1 w-full min-h-[200px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formattedData} 
            layout="vertical" 
            margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
            <XAxis 
              type="number"
              domain={[0, 100]}
              stroke="#6B7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={3}
            />
            <YAxis 
              dataKey="sector" 
              type="category"
              stroke="#6B7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(31, 41, 55, 0.4)" }} />
            <Bar dataKey="avg_severity" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
