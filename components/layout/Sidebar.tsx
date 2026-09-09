"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Sprout,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { UserSession } from "@/types";

interface SidebarProps {
  user: UserSession | null;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ user, isOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Add Farmer", href: "/farmers/new", icon: UserPlus, highlight: true },
    { name: "Farmers", href: "/farmers", icon: Users },
    { name: "Cultivations", href: "/cultivations", icon: Sprout },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-100 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center">
            <Logo size="md" />
          </Link>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Field Operations
          </div>
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900"
                } ${item.highlight && !isActive ? "border border-dashed border-emerald-300 bg-emerald-50/40 text-emerald-800 font-semibold" : ""}`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{item.name}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card at footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "CaneTrace Operator"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="text-[11px] text-slate-500 font-medium">
                  Verified Operator
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
