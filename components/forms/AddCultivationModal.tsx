"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  SUGARCANE_VARIETIES,
  SUGARCANE_SPACINGS,
  SOIL_TYPES,
  WATER_SOURCES,
  PLANTING_MATERIALS,
} from "@/config/sugarcane";
import { calculatePlantingSeason } from "@/lib/utils/season";

import { Calendar, AlertCircle, CheckCircle2, Sprout } from "lucide-react";

interface AddCultivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerId: string;
  farmerName?: string;
  onSuccess?: () => void;
}

export function AddCultivationModal({
  isOpen,
  onClose,
  farmerId,
  farmerName,
  onSuccess,
}: AddCultivationModalProps) {
  const [plantingDate, setPlantingDate] = useState("");
  const [sugarcaneVariety, setSugarcaneVariety] = useState<string>("86032");
  const [spacing, setSpacing] = useState<string>("4.5 × 1.5");
  const [soilType, setSoilType] = useState<string>("Black Soil (खोल माती)");
  const [waterSource, setWaterSource] = useState<string>("1. Borewell / Tube well (१. बोअरवेल / ट्यूबवेल)");
  const [plantingMaterial, setPlantingMaterial] = useState<string>("Cane / बेणे (Bene)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seasonResult = plantingDate ? calculatePlantingSeason(plantingDate) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!plantingDate) {
      setError("Please select a planting date");
      return;
    }

    if (!seasonResult?.isValid) {
      setError(seasonResult?.message || "Invalid planting season for this date");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/cultivations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId,
          plantingDate,
          sugarcaneVariety,
          spacing,
          soilType,
          waterSource,
          plantingMaterial,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add cultivation cycle");
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving cultivation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-600" />
          <span>Add Cultivation Cycle</span>
        </div>
      }
      description={`Record new sugarcane planting for ${farmerName ? `${farmerName} (${farmerId})` : `Farmer ${farmerId}`}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Planting Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Planting Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              required
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Season Calculation Indicator */}
          {plantingDate && (
            <div className="mt-2">
              {seasonResult?.isValid && seasonResult.seasonDetails ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Calculated Season:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${seasonResult.seasonDetails.badgeClass}`}>
                    {seasonResult.seasonDetails.name} ({seasonResult.seasonDetails.period})
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {seasonResult?.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sugarcane Variety */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sugarcane Variety <span className="text-red-500">*</span>
          </label>
          <select
            value={sugarcaneVariety}
            onChange={(e) => setSugarcaneVariety(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {SUGARCANE_VARIETIES.map((v) => (
              <option key={v.varietyId} value={v.varietyId}>
                {v.displayName} — {v.durationMonths} months
              </option>
            ))}
          </select>
        </div>

        {/* Spacing */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Row Spacing <span className="text-red-500">*</span>
          </label>
          <select
            value={spacing}
            onChange={(e) => setSpacing(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {SUGARCANE_SPACINGS.map((s) => (
              <option key={s.spacingId} value={s.spacingValue}>
                {s.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Soil Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Soil Type (मातीचा प्रकार)
          </label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {SOIL_TYPES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Water Source */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Water Source (पाण्याचे स्त्रोत)
          </label>
          <select
            value={waterSource}
            onChange={(e) => setWaterSource(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {WATER_SOURCES.map((ws) => (
              <option key={ws.value} value={ws.value}>
                {ws.label}
              </option>
            ))}
          </select>
        </div>

        {/* Planting Material */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Planting Material (लागवड साहित्य)
          </label>
          <select
            value={plantingMaterial}
            onChange={(e) => setPlantingMaterial(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {PLANTING_MATERIALS.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3">

          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={Boolean(plantingDate && !seasonResult?.isValid)}
          >
            Save Cultivation Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
