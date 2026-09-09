"use client";

import React, { useState } from "react";
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
import { MapPin } from "lucide-react";

interface LocationChartProps {
  districtData: { district: string; count: number }[];
  talukaData: { taluka: string; count: number }[];
}

export function LocationChart({ districtData, talukaData }: LocationChartProps) {
  const [viewType, setViewType] = useState<"district" | "taluka">("district");

  const currentData = (viewType === "district" ? districtData : talukaData).slice(0, 7);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Geographical Distribution</CardTitle>
            <CardDescription>Cane concentration across administrative territories</CardDescription>
          </div>
          {/* Toggle pill */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewType("district")}
              className={`px-2.5 py-1 rounded-md transition ${
                viewType === "district"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Districts
            </button>
            <button
              onClick={() => setViewType("taluka")}
              className={`px-2.5 py-1 rounded-md transition ${
                viewType === "taluka"
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Talukas
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[260px] pt-4">
        {currentData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No geographical data recorded
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                layout="vertical"
                data={currentData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey={viewType}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} Farmers`, "Registered"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#15803d" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  {currentData.map((_, index) => (
                    <Cell
                      key={`loc-cell-${index}`}
                      fill={index % 2 === 0 ? "#16a34a" : "#22c55e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
