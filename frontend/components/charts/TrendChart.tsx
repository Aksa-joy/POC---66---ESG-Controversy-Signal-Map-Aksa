"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendPoint } from "@/lib/api";

interface TrendChartProps {
  data: TrendPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1117] border border-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <p className="font-semibold text-gray-200 font-mono">{label}</p>
        <p className="text-primary flex items-center justify-between gap-6">
          <span>Signals Count:</span>
          <span className="font-bold font-mono">{payload[0].value}</span>
        </p>
        <p className="text-secondary flex items-center justify-between gap-6 font-medium">
          <span>Avg Severity:</span>
          <span className="font-bold font-mono text-gray-200">{payload[0].payload.avg_severity}</span>
        </p>
        <div className="border-t border-border/60 pt-1.5 mt-1 text-[10px] text-gray-400 max-w-[200px] leading-relaxed">
          <p><span className="font-semibold text-primary">Count:</span> Total governance, environment, and labor incidents flagged in global registers.</p>
          <p className="mt-1"><span className="font-semibold text-secondary">Avg Severity:</span> Cumulative risk score (30-100) based on source, category, recency, and repetition.</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ data }: TrendChartProps) {
  // Sort data by date to ensure proper ordering
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Format dates for display (e.g. 2026-04-15 -> 15 Apr)
  const formatXAxis = (tickItem: string) => {
    try {
      const d = new Date(tickItem);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    } catch {
      return tickItem;
    }
  };

  return (
    <div className="w-full h-full min-h-[260px] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-200 font-mono tracking-wider uppercase">Controversies Over Time</h3>
          <p className="text-[11px] text-gray-400">Aggregated daily signal count and moving average severity</p>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary"></span>
            Signals Count
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <defs>
              <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={formatXAxis}
              dy={5}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#38BDF8", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#38BDF8" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#trendColor)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
