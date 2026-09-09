import React from "react";
import { Users, Sprout, Calendar, Clock, ArrowUpRight } from "lucide-react";
import { DashboardStats } from "@/types";

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: "Total Registered Farmers",
      value: stats.totalFarmers.toLocaleString(),
      subtitle: "Verified unique cane growers",
      icon: Users,
      color: "from-emerald-500 to-green-600",
      textColor: "text-emerald-700 dark:text-emerald-400",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60",
    },
    {
      title: "Total Cultivation Cycles",
      value: stats.totalCultivations.toLocaleString(),
      subtitle: "Crop cycles across all seasons",
      icon: Sprout,
      color: "from-green-600 to-teal-700",
      textColor: "text-green-700 dark:text-green-400",
      bgLight: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/60",
    },
    {
      title: `${stats.currentSeasonName} Season Records`,
      value: stats.currentSeasonRecords.toLocaleString(),
      subtitle: "Active regional season count",
      icon: Calendar,
      color: "from-amber-500 to-yellow-600",
      textColor: "text-amber-700 dark:text-amber-400",
      bgLight: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60",
    },
    {
      title: "Today's New Entries",
      value: stats.todayEntries.toLocaleString(),
      subtitle: "Enumerated in the last 24h",
      icon: Clock,
      color: "from-sky-500 to-blue-600",
      textColor: "text-sky-700 dark:text-sky-400",
      bgLight: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${card.bgLight}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-sm`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
