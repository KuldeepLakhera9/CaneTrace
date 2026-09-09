"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  LogOut,
  UserCheck,
  PlusCircle,
  Database,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { UserSession } from "@/types";

interface TopbarProps {
  user: UserSession | null;
  onOpenMobileMenu: () => void;
}

export function Topbar({ user, onOpenMobileMenu }: TopbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between">
      {/* Left section: mobile hamburger & system status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Agri-Network Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 rounded-full text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Maharashtra Agri Grid</span>
        </div>
      </div>

      {/* Right section: Quick action + User info & Logout */}
      <div className="flex items-center gap-3">
        <Link
          href="/farmers/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden xs:inline">Register Farmer</span>
        </Link>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || "Cane Operator"}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              Platform Operator
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out of CaneTrace"
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center gap-1 text-xs font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
