"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import { CategoryPoint } from "@/lib/api";

interface CategoryChartProps {
  data: CategoryPoint[];
}

const CATEGORY_DEFINITIONS: Record<string, string> = {
  Governance: "Corporate audits, fraud events, corruption trials, and executive ethical misconduct filings.",
  Environmental: "Ecological spills, toxic dumpings, carbon emission breaches, and wildlife habitat impacts.",
  Labor: "Workplace fair compensation, collective bargaining issues, child labor, and discriminatory disputes.",
  Privacy: "Corporate data leaks, cyber exploits, user profile tracking, and surveillance regulatory probes.",
  Safety: "Industrial disasters, hazardous machinery accidents, and occupational health protection issues."
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const categoryName = payload[0].payload.category;
    const desc = CATEGORY_DEFINITIONS[categoryName] || "ESG performance and compliance issues in corporate operations.";
    
    return (
      <div className="bg-[#0B1117] border border-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 backdrop-blur-md max-w-[240px]">
        <p className="font-semibold text-gray-200 font-mono tracking-wider uppercase text-shadow-glow">{categoryName}</p>
        <p className="text-secondary flex items-center justify-between gap-6">
          <span>Incident Count:</span>
          <span className="font-bold font-mono text-gray-200">{payload[0].value}</span>
        </p>
        <p className="text-primary flex items-center justify-between gap-6 font-medium">
          <span>Avg Severity:</span>
          <span className="font-bold font-mono text-gray-200">{payload[0].payload.avg_severity}</span>
        </p>
        <div className="border-t border-border/60 pt-1.5 mt-1 text-[10px] text-gray-400 leading-relaxed">
          <p><span className="font-semibold text-gray-300">Pillar Scope:</span> {desc}</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ data }: CategoryChartProps) {
  // Define five standard categories requested
  const order = ["Governance", "Environmental", "Labor", "Privacy", "Safety"];
  
  // Fill missing categories with 0 values
  const formattedData = order.map(cat => {
    const match = data.find(d => d.category.toLowerCase() === cat.toLowerCase());
    return {
      category: cat,
      count: match ? match.count : 0,
      avg_severity: match ? match.avg_severity : 0
    };
  });

  const colors = ["#818CF8", "#34D399", "#F472B6", "#38BDF8", "#FBBF24"];

  return (
    <div className="w-full h-full min-h-[260px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-200 font-mono tracking-wider uppercase">Pillar Incident Density</h3>
        <p className="text-[11px] text-gray-400">Total controversies segmented by core ESG domains</p>
      </div>

      <div className="flex-1 w-full min-h-[200px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
              dataKey="category" 
              stroke="#6B7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={5}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(31, 41, 55, 0.4)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
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
