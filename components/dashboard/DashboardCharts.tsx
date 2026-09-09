"use client";

import React, { useState, useEffect } from "react";
import { SeasonChart } from "./SeasonChart";
import { VarietyChart } from "./VarietyChart";
import { LocationChart } from "./LocationChart";
import { DashboardStats } from "@/types";

interface DashboardChartsProps {
  stats: DashboardStats;
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SeasonChart data={stats.seasonDistribution} />
      <VarietyChart data={stats.varietyDistribution} />
      <LocationChart
        districtData={stats.districtDistribution}
        talukaData={stats.talukaDistribution}
      />
    </div>
  );
}
