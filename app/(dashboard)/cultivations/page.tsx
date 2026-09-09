import React from "react";
import { CultivationTable } from "@/components/cultivations/CultivationTable";
import { Sprout, Download } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cultivation Records | CaneTrace",
};

export default function CultivationsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cultivation Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Faceted registry of all sugarcane planting cycles, crop varieties, spacing geometries, and calendar seasons.
          </p>
        </div>

        <Link
          href="/api/export"
          download
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition w-fit"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Download Excel (.xlsx)</span>
        </Link>
      </div>

      <CultivationTable />
    </div>
  );
}
