"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { CultivationRecord, FarmerRecord } from "@/types";
import { SUGARCANE_VARIETIES, SUGARCANE_SPACINGS } from "@/config/sugarcane";

export function CultivationTable() {
  const [cultivations, setCultivations] = useState<
    (CultivationRecord & { farmerName: string; mobile: string; location: FarmerRecord["location"] })[]
  >([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("");
  const [variety, setVariety] = useState("");
  const [spacing, setSpacing] = useState("");
  const [district, setDistrict] = useState("");
  const [year, setYear] = useState("");

  // Delete state
  const [cultivationToDelete, setCultivationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCultivations = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        season,
        variety,
        spacing,
        district,
        year,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/cultivations?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setCultivations(data.cultivations || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load cultivations", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCultivations();
  }, [season, variety, spacing, district, year, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCultivations();
  };

  const resetFilters = () => {
    setSearch("");
    setSeason("");
    setVariety("");
    setSpacing("");
    setDistrict("");
    setYear("");
    setPage(1);
  };

  const handleDeleteCultivation = async () => {
    if (!cultivationToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cultivations/${cultivationToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCultivationToDelete(null);
        fetchCultivations();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete cultivation cycle");
      }
    } catch (err) {
      console.error("Delete cultivation error", err);
      alert("Network error while deleting cultivation");
    } finally {
      setIsDeleting(false);
    }
  };

  const getSeasonVariant = (seasonVal: string) => {
    switch (seasonVal) {
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
    <div className="space-y-4">
      {/* Multi-Filter Card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by farmer name, mobile, village, cycle ID..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button type="submit" variant="primary" size="sm">
              Search
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          </form>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-xs">
            <select
              value={season}
              onChange={(e) => {
                setSeason(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            >
              <option value="">All Seasons</option>
              <option value="Adsali">Adsali</option>
              <option value="Pre-seasonal">Pre-seasonal</option>
              <option value="Suru">Suru</option>
            </select>

            <select
              value={variety}
              onChange={(e) => {
                setVariety(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            >
              <option value="">All Varieties</option>
              {SUGARCANE_VARIETIES.map((v) => (
                <option key={v.varietyId} value={v.varietyId}>
                  {v.varietyId} ({v.displayName})
                </option>
              ))}
            </select>

            <select
              value={spacing}
              onChange={(e) => {
                setSpacing(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            >
              <option value="">All Spacing</option>
              {SUGARCANE_SPACINGS.map((s) => (
                <option key={s.spacingId} value={s.spacingValue}>
                  {s.spacingValue} ft
                </option>
              ))}
            </select>

            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            >
              <option value="">All Districts</option>
              <option value="Kolhapur">Kolhapur</option>
              <option value="Pune">Pune</option>
              <option value="Sangli">Sangli</option>
              <option value="Satara">Satara</option>
              <option value="Solapur">Solapur</option>
              <option value="Ahmednagar">Ahmednagar</option>
            </select>

            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Cycle ID</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Planting Date</th>
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">Sugarcane Variety</th>
                  <th className="py-3 px-4">Spacing</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        <span>Loading cultivation records...</span>
                      </div>
                    </td>
                  </tr>
                ) : cultivations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No cultivation records match the active criteria.
                    </td>
                  </tr>
                ) : (
                  cultivations.map((c) => (
                    <tr
                      key={c.cultivationId}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {c.cultivationId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {c.farmerName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {c.farmerId} • {c.mobile}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <div>{c.location?.village || "—"}</div>
                        <div className="text-[11px] text-slate-400">
                          {c.location?.taluka}, {c.location?.district}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {c.plantingDate
                          ? format(new Date(c.plantingDate), "dd MMM yyyy")
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getSeasonVariant(c.season)}>
                          {c.season}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                        {c.sugarcaneVariety}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {c.spacing} ft
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/farmers/${c.farmerId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Farmer</span>
                          </Link>
                          <button
                            onClick={() => setCultivationToDelete(c.cultivationId)}
                            title="Delete this cultivation cycle"
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{cultivations.length}</span> of{" "}
              <span className="font-semibold text-slate-700">{total}</span> records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Button>
              <span className="px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Delete Single Cultivation Modal */}
      {cultivationToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(cultivationToDelete)}
          onClose={() => setCultivationToDelete(null)}
          onConfirm={handleDeleteCultivation}
          title="Delete Cultivation Record"
          itemName={`Cycle ID: ${cultivationToDelete}`}
          description="Are you sure you want to permanently delete this sugarcane cultivation cycle? This will remove the planting date, season, variety, and spacing entry from the database."
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
