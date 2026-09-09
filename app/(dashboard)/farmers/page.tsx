import React from "react";
import { FarmerTable } from "@/components/farmers/FarmerTable";
import { UserPlus, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Farmers Directory | CaneTrace",
};

export default function FarmersPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Registered Sugarcane Farmers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official grower directory, village settlements, contact numbers, and crop cycle tallies.
          </p>
        </div>

        <Link
          href="/farmers/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Farmer</span>
        </Link>
      </div>

      <FarmerTable />
    </div>
  );
}
