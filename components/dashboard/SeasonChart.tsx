"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { SeasonType } from "@/lib/utils/season";

interface SeasonChartProps {
  data: {
    season: SeasonType;
    count: number;
    percentage: number;
  }[];
}

const SEASON_COLORS: Record<string, string> = {
  Adsali: "#16a34a", // emerald-600
  "Pre-seasonal": "#d97706", // amber-600
  Suru: "#0284c7", // sky-600
};

export function SeasonChart({ data }: SeasonChartProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Season Distribution</CardTitle>
        <CardDescription>Cultivation volume across Adsali, Pre-seasonal, and Suru</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] pt-4">
        {data.length === 0 || data.every((d) => d.count === 0) ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No season data recorded yet
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="season"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} Cultivations`, "Volume"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {data.map((entry) => (
                    <Cell
                      key={`cell-${entry.season}`}
                      fill={SEASON_COLORS[entry.season] || "#16a34a"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Quick legend with percentage */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              {data.map((d) => (
                <div key={d.season} className="p-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SEASON_COLORS[d.season] }}
                    />
                    <span>{d.season}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {d.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
