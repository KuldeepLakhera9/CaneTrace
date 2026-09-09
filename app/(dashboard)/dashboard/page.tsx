import React from "react";
import { DataStore } from "@/lib/db/store";
import { StatCards } from "@/components/dashboard/StatCards";
import { SeasonChart } from "@/components/dashboard/SeasonChart";
import { VarietyChart } from "@/components/dashboard/VarietyChart";
import { LocationChart } from "@/components/dashboard/LocationChart";
import { RecentEntriesTable } from "@/components/dashboard/RecentEntriesTable";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { UserPlus, Download, Sparkles, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await DataStore.getDashboardStats();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sugarcane Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time crop intelligence, farmer enumeration stats, and cultivation distributions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Excel (.xlsx)</span>
          </Link>

          <Link
            href="/farmers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Farmer</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <StatCards stats={stats} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SeasonChart data={stats.seasonDistribution} />
        <VarietyChart data={stats.varietyDistribution} />
        <LocationChart
          districtData={stats.districtDistribution}
          talukaData={stats.talukaDistribution}
        />
      </div>

      {/* Recent Entries Data Table */}
      <RecentEntriesTable entries={stats.recentEntries} />
    </div>
  );
}
