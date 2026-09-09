"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Sprout,
  PlusCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddCultivationModal } from "@/components/forms/AddCultivationModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { FarmerRecord, CultivationRecord } from "@/types";

export default function FarmerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const farmerId = resolvedParams.id;
  const router = useRouter();

  const [farmer, setFarmer] = useState<FarmerRecord | null>(null);
  const [cultivations, setCultivations] = useState<CultivationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCultivationOpen, setIsAddCultivationOpen] = useState(false);

  // Delete Farmer state
  const [isDeleteFarmerOpen, setIsDeleteFarmerOpen] = useState(false);
  const [isDeletingFarmer, setIsDeletingFarmer] = useState(false);

  // Delete Cultivation state
  const [cultivationToDelete, setCultivationToDelete] = useState<string | null>(null);
  const [isDeletingCultivation, setIsDeletingCultivation] = useState(false);

  const loadFarmerData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/farmers/${farmerId}`);
      if (res.ok) {
        const data = await res.json();
        setFarmer(data.farmer);
        setCultivations(data.cultivations || []);
      }
    } catch (err) {
      console.error("Error loading farmer profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFarmerData();
  }, [farmerId]);

  const handleDeleteFarmer = async () => {
    if (!farmer) return;
    setIsDeletingFarmer(true);
    try {
      const res = await fetch(`/api/farmers/${farmer.farmerId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/farmers");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete farmer");
      }
    } catch (err) {
      console.error("Delete farmer error", err);
      alert("Network error while deleting farmer");
    } finally {
      setIsDeletingFarmer(false);
    }
  };

  const handleDeleteCultivation = async () => {
    if (!cultivationToDelete) return;
    setIsDeletingCultivation(true);
    try {
      const res = await fetch(`/api/cultivations/${cultivationToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCultivationToDelete(null);
        loadFarmerData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete cultivation cycle");
      }
    } catch (err) {
      console.error("Delete cultivation error", err);
      alert("Network error while deleting cultivation");
    } finally {
      setIsDeletingCultivation(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading farmer file...</p>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-lg font-bold text-slate-800">Farmer Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          No profile exists with identifier {farmerId}.
        </p>
        <Link
          href="/farmers"
          className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Farmers Registry</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Back Link */}
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
            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
              {farmer.farmerId}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {farmer.farmerName}
            </h1>
            <span className="font-mono px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
              {farmer.farmerId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteFarmerOpen(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900"
          >
            <Trash2 className="w-4 h-4 mr-1 text-red-500" />
            <span>Delete Farmer</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddCultivationOpen(true)}
            className="w-fit"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Cultivation</span>
          </Button>
        </div>
      </div>

      {/* Farmer Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Farmer Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Contact Number</span>
              <div className="flex items-center gap-2 mt-1 text-slate-800 dark:text-slate-200 font-medium">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 {farmer.mobile}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Status</span>
              <div className="flex items-center gap-2 mt-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="capitalize">{farmer.status || "Active Member"}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Registration Date</span>
              <div className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {farmer.createdAt
                    ? format(new Date(farmer.createdAt), "dd MMMM yyyy")
                    : "—"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block mb-1">Geographical Settlement</span>
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <p>
                  <strong className="text-slate-500">Village:</strong> {farmer.location.village}
                </p>
                <p>
                  <strong className="text-slate-500">Taluka:</strong> {farmer.location.taluka}
                </p>
                <p>
                  <strong className="text-slate-500">District:</strong> {farmer.location.district}
                </p>
                <p>
                  <strong className="text-slate-500">State / Pin:</strong> {farmer.location.state} — {farmer.location.pincode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cultivation History Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Cultivation History</span>
                </CardTitle>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {cultivations.length} {cultivations.length === 1 ? "Cycle" : "Cycles"}
                </span>
              </div>
              <CardDescription>
                Historical and active sugarcane planting records for this grower
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Cycle ID</th>
                    <th className="py-3 px-4">Planting Date</th>
                    <th className="py-3 px-4">Season</th>
                    <th className="py-3 px-4">Sugarcane Variety</th>
                    <th className="py-3 px-4">Row Spacing</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cultivations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <p>No cultivation records yet.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Add the first cultivation cycle for this farmer.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    cultivations.map((c) => (
                      <tr
                        key={c.cultivationId}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {c.cultivationId}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
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
                          <button
                            onClick={() => setCultivationToDelete(c.cultivationId)}
                            title="Delete this cultivation cycle"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Cultivation Modal */}
      <AddCultivationModal
        isOpen={isAddCultivationOpen}
        onClose={() => setIsAddCultivationOpen(false)}
        farmerId={farmer.farmerId}
        farmerName={farmer.farmerName}
        onSuccess={() => {
          setIsAddCultivationOpen(false);
          loadFarmerData();
        }}
      />

      {/* Confirm Delete Farmer Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteFarmerOpen}
        onClose={() => setIsDeleteFarmerOpen(false)}
        onConfirm={handleDeleteFarmer}
        title="Delete Farmer Profile"
        itemName={`${farmer.farmerName} (${farmer.farmerId})`}
        description="Are you sure you want to permanently delete this farmer profile and all their recorded cultivation cycles? This action will permanently remove the record from MongoDB Atlas."
        isDeleting={isDeletingFarmer}
      />

      {/* Confirm Delete Single Cultivation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(cultivationToDelete)}
        onClose={() => setCultivationToDelete(null)}
        onConfirm={handleDeleteCultivation}
        title="Delete Cultivation Cycle"
        itemName={cultivationToDelete || ""}
        description="Are you sure you want to delete this sugarcane cultivation cycle from the database? This action cannot be undone."
        isDeleting={isDeletingCultivation}
      />
    </div>
  );
}
