"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface VarietyChartProps {
  data: {
    variety: string;
    count: number;
    percentage: number;
  }[];
}

const VARIETY_COLORS: Record<string, string> = {
  "86032": "#15803d", // emerald-700
  "265": "#0d9488",   // teal-600
  "13007": "#854d0e", // amber-800
};

const VARIETY_LABELS: Record<string, string> = {
  "86032": "Co 86032 (Nira)",
  "265": "CoM 0265 (Phule)",
  "13007": "Co 13007",
};

export function VarietyChart({ data }: VarietyChartProps) {
  const chartData = data.map((d) => ({
    name: VARIETY_LABELS[d.variety] || d.variety,
    variety: d.variety,
    value: d.count,
    percentage: d.percentage,
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Sugarcane Variety Distribution</CardTitle>
        <CardDescription>Breakdown by registered cane cultivars</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] pt-2">
        {data.length === 0 || data.every((d) => d.count === 0) ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No variety records available
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Cultivations`, name]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
                    fontSize: "12px",
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.variety}`}
                      fill={VARIETY_COLORS[entry.variety] || "#10b981"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Custom bottom badges */}
            <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              {chartData.map((item) => (
                <div key={item.variety} className="p-1">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: VARIETY_COLORS[item.variety] }}
                    />
                    <span className="truncate">{item.variety}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {item.percentage}%
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
