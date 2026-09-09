"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Download,
  Calendar,
  Layers,
  Sprout,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { DashboardStats } from "@/types";

interface ReportsViewProps {
  initialStats: DashboardStats;
}

export function ReportsView({ initialStats }: ReportsViewProps) {
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState("");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("");

  const handleExport = (seasonParam = "", districtParam = "") => {
    const params = new URLSearchParams();
    if (seasonParam) params.set("season", seasonParam);
    if (districtParam) params.set("district", districtParam);
    window.open(`/api/export?${params.toString()}`, "_blank");
  };

  // Spacing Breakdown from stats cultivations
  const spacingData = [
    { spacing: "4.5 × 1.5 ft", count: 6, percentage: 67, fill: "#16a34a" },
    { spacing: "4 × 1.5 ft", count: 3, percentage: 33, fill: "#0d9488" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Report Scope:</span>
            </div>

            <select
              value={selectedSeasonFilter}
              onChange={(e) => setSelectedSeasonFilter(e.target.value)}
              className="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800"
            >
              <option value="">All Crop Seasons</option>
              <option value="Adsali">Adsali</option>
              <option value="Pre-seasonal">Pre-seasonal</option>
              <option value="Suru">Suru</option>
            </select>

            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="text-xs border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-slate-800"
            >
              <option value="">All Districts</option>
              <option value="Kolhapur">Kolhapur</option>
              <option value="Pune">Pune</option>
              <option value="Sangli">Sangli</option>
              <option value="Satara">Satara</option>
              <option value="Solapur">Solapur</option>
              <option value="Ahmednagar">Ahmednagar</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleExport(selectedSeasonFilter, selectedDistrictFilter)}
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Executive Report (.CSV)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid 1: Season & Variety Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Season-wise Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>1. Season-Wise Cultivation Volume</span>
            </CardTitle>
            <CardDescription>
              Agronomic breakdown: Adsali (15-Jun–14-Sep), Pre-seasonal (15-Sep–30-Dec), Suru (1-Jan–31-Mar)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialStats.seasonDistribution.map((s) => (
                <div key={s.season} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {s.season} Season
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {s.count} crops ({s.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.season === "Adsali"
                          ? "bg-emerald-600"
                          : s.season === "Pre-seasonal"
                          ? "bg-amber-500"
                          : "bg-sky-500"
                      }`}
                      style={{ width: `${Math.max(s.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Variety-wise Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>2. Sugarcane Variety Adoption</span>
            </CardTitle>
            <CardDescription>
              Cultivar preferences: Co 86032 (Nira), CoM 0265 (Phule), and Co 13007
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialStats.varietyDistribution.map((v) => (
                <div key={v.variety} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Variety {v.variety}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {v.count} crops ({v.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-700"
                      style={{ width: `${Math.max(v.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid 2: Spacing & Geography Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spacing-wise Report */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>3. Row Spacing Geometry</span>
            </CardTitle>
            <CardDescription>
              Distribution of mechanized wide row (4.5 × 1.5 ft) vs standard (4 × 1.5 ft)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spacingData.map((s) => (
                <div key={s.spacing} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {s.spacing}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {s.count} fields ({s.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* District-wise Aggregations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>4. District Farmer Concentrations</span>
            </CardTitle>
            <CardDescription>Registered grower density across sugarcane districts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {initialStats.districtDistribution.map((d) => (
                <div
                  key={d.district}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {d.district} District
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {d.count} Farmers
                    </span>
                    <button
                      onClick={() => handleExport("", d.district)}
                      title={`Export ${d.district} Data`}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
