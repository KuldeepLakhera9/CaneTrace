import React from "react";
import { getSession } from "@/lib/services/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isMongoConfigured } from "@/lib/db/connect";
import { SUGARCANE_VARIETIES, SUGARCANE_SPACINGS, PLANTING_SEASONS } from "@/config/sugarcane";
import {
  Settings,
  Database,
  ShieldCheck,
  Sprout,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Settings & Configuration | CaneTrace",
};

export default async function SettingsPage() {
  const session = await getSession();
  const mongoConfigured = isMongoConfigured();

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Settings & Agronomic Rules
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review core database connectivity, sugarcane cultivar registries, spacing geometries, and planting season rules.
        </p>
      </div>

      {/* Database Connectivity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Database Storage Configuration</span>
          </CardTitle>
          <CardDescription>
            MongoDB Atlas persistent storage status and connection adapter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {mongoConfigured ? "MongoDB Atlas (Production Connection)" : "Zero-Config Active Storage Adapter"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mongoConfigured
                    ? "Live cluster connected via Mongoose connection pooling"
                    : "Using built-in resilient in-memory datastore. Provide MONGODB_URI to automatically connect to MongoDB Atlas."}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-white dark:bg-slate-800 border font-semibold text-emerald-700 w-fit">
              {mongoConfigured ? "ATLAS CLUSTER ONLINE" : "HYBRID ADAPTER READY"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Sugarcane Varieties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Approved Sugarcane Cultivars</span>
          </CardTitle>
          <CardDescription>
            Central configuration table for allowed sugarcane varieties
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Variety Code</th>
                  <th className="py-3 px-4">Botanical / Field Name</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Agronomic Profile</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUGARCANE_VARIETIES.map((v) => (
                  <tr key={v.varietyId}>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {v.varietyId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {v.displayName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {v.durationMonths} Months
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {v.description}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Row Spacing & Planting Season Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row Spacings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Row Spacing Options</span>
            </CardTitle>
            <CardDescription>Approved geometries for mechanization and irrigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SUGARCANE_SPACINGS.map((s) => (
              <div
                key={s.spacingId}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800">{s.displayName}</span>
                  <p className="text-slate-500 mt-0.5">{s.description}</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {s.spacingValue}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Planting Seasons Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Planting Calendar Rules</span>
            </CardTitle>
            <CardDescription>Strict agronomic season calculation boundaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLANTING_SEASONS.map((p) => (
              <div
                key={p.seasonKey}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800">{p.name} Season</span>
                  <p className="text-slate-500 mt-0.5">{p.description}</p>
                </div>
                <Badge variant={p.seasonKey === "Adsali" ? "success" : p.seasonKey === "Pre-seasonal" ? "warning" : "info"}>
                  Active Rule
                </Badge>
              </div>
            ))}

            <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 text-xs text-red-700">
              <span className="font-bold">Unsupported Period: </span>
              <span>1 April – 14 June (Non-planting window, validation error enforced).</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current User Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Operator Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b">
            <span className="text-slate-500">Operator Name:</span>
            <span className="font-bold text-slate-800">{session?.name}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b">
            <span className="text-slate-500">Email Address:</span>
            <span className="font-mono text-slate-700">{session?.email}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500">Assigned Platform Role:</span>
            <span className="font-bold text-emerald-700 uppercase">{session?.role}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
