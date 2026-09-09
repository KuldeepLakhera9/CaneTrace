import React from "react";
import { DataStore } from "@/lib/db/store";
import { ReportsView } from "@/components/reports/ReportsView";
import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Reports & Analytics | CaneTrace",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const stats = await DataStore.getDashboardStats();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sugarcane Intelligence & Analytical Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Aggregated distributions by planting season, crop variety adoption, spacing geometry, and district density.
        </p>
      </div>

      <ReportsView initialStats={stats} />
    </div>
  );
}
