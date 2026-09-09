import React from "react";
import { FarmerRegistrationForm } from "@/components/forms/FarmerRegistrationForm";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewFarmerPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header section with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
            <Link
              href="/farmers"
              className="hover:text-emerald-600 inline-flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Farmers Directory</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">New Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register Sugarcane Farmer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture verified farmer profile, geo-coordinates, and current sugarcane cultivation cycle.
          </p>
        </div>
      </div>

      {/* Main Registration Form */}
      <FarmerRegistrationForm />
    </div>
  );
}
