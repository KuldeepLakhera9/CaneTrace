"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Eye,
  PlusCircle,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AddCultivationModal } from "@/components/forms/AddCultivationModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { FarmerRecord } from "@/types";

export function FarmerTable() {
  const [farmers, setFarmers] = useState<(FarmerRecord & { cultivationsCount: number })[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Add Cultivation Modal State
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [selectedFarmerName, setSelectedFarmerName] = useState<string | undefined>(undefined);
  const [isAddCultivationOpen, setIsAddCultivationOpen] = useState(false);

  // Delete Farmer State
  const [farmerToDelete, setFarmerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch farmers
  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        search: debouncedSearch,
        district,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/farmers?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setFarmers(data.farmers || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load farmers", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [debouncedSearch, district, page]);

  const handleOpenAddCultivation = (id: string, name: string) => {
    setSelectedFarmerId(id);
    setSelectedFarmerName(name);
    setIsAddCultivationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!farmerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/farmers/${farmerToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFarmerToDelete(null);
        fetchFarmers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete farmer");
      }
    } catch (err) {
      console.error("Delete error", err);
      alert("Network error while deleting farmer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Name, ID, Mobile, Village..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter controls and export */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPage(1);
                }}
                className="text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Districts</option>
                <option value="Kolhapur">Kolhapur</option>
                <option value="Pune">Pune</option>
                <option value="Sangli">Sangli</option>
                <option value="Satara">Satara</option>
                <option value="Solapur">Solapur</option>
                <option value="Ahmednagar">Ahmednagar</option>
                <option value="Belagavi">Belagavi</option>
              </select>

              <Link
                href="/api/export"
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export Excel</span>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Farmer ID</th>
                  <th className="py-3 px-4">Farmer Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Village</th>
                  <th className="py-3 px-4">Taluka</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4 text-center">Cultivations</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        <span>Loading farmer registry records...</span>
                      </div>
                    </td>
                  </tr>
                ) : farmers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">No farmers found</p>
                        <p className="text-xs text-slate-400">
                          No farmer records currently registered in the database.
                        </p>
                        <Link
                          href="/farmers/new"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold mt-2"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Register First Farmer</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  farmers.map((farmer) => (
                    <tr
                      key={farmer.farmerId}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {farmer.farmerId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                        <Link
                          href={`/farmers/${farmer.farmerId}`}
                          className="hover:underline hover:text-emerald-600"
                        >
                          {farmer.farmerName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        +91 {farmer.mobile}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {farmer.location.village}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {farmer.location.taluka}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {farmer.location.district}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {farmer.cultivationsCount || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {farmer.createdAt
                          ? format(new Date(farmer.createdAt), "dd MMM yyyy")
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAddCultivation(farmer.farmerId, farmer.farmerName)}
                            title="Add Crop Cycle"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/farmers/${farmer.farmerId}`}
                            title="View Profile"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setFarmerToDelete({ id: farmer.farmerId, name: farmer.farmerName })}
                            title="Delete Farmer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{farmers.length}</span> of{" "}
              <span className="font-semibold text-slate-700">{total}</span> farmers
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

      {/* Add Cultivation Modal */}
      {selectedFarmerId && (
        <AddCultivationModal
          isOpen={isAddCultivationOpen}
          onClose={() => setIsAddCultivationOpen(false)}
          farmerId={selectedFarmerId}
          farmerName={selectedFarmerName}
          onSuccess={() => {
            setIsAddCultivationOpen(false);
            fetchFarmers();
          }}
        />
      )}

      {/* Confirm Delete Farmer Modal */}
      {farmerToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(farmerToDelete)}
          onClose={() => setFarmerToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Farmer Record"
          itemName={`${farmerToDelete.name} (${farmerToDelete.id})`}
          description="Are you sure you want to permanently delete this farmer record? All associated sugarcane cultivation cycles for this farmer will also be deleted from the live database. This action cannot be undone."
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
