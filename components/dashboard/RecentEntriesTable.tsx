import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CultivationRecord } from "@/types";

interface RecentEntriesTableProps {
  entries: (CultivationRecord & {
    farmerName: string;
    village: string;
    district: string;
  })[];
}

export function RecentEntriesTable({ entries }: RecentEntriesTableProps) {
  const getSeasonVariant = (season: string) => {
    switch (season) {
      case "Adsali":
        return "success";
      case "Pre-seasonal":
        return "warning";
      case "Suru":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <CardTitle className="text-base">Recent Field Registrations</CardTitle>
          <CardDescription>Latest sugarcane farmers and cultivation cycles entered</CardDescription>
        </div>
        <Link
          href="/farmers"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
        >
          <span>View All Farmers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Farmer ID</th>
                <th className="py-3 px-4">Farmer Name</th>
                <th className="py-3 px-4">Village</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Season</th>
                <th className="py-3 px-4">Variety</th>
                <th className="py-3 px-4">Planting Date</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No recent records found
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.cultivationId}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {entry.farmerId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {entry.farmerName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {entry.village || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {entry.district || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getSeasonVariant(entry.season)}>
                        {entry.season}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {entry.sugarcaneVariety}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {entry.plantingDate
                        ? format(new Date(entry.plantingDate), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/farmers/${entry.farmerId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
