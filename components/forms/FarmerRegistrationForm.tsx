"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  farmerRegistrationSchema,
  FarmerRegistrationInput,
} from "@/lib/validations/farmer";
import {
  SUGARCANE_VARIETIES,
  SUGARCANE_SPACINGS,
  SOIL_TYPES,
  WATER_SOURCES,
  PLANTING_MATERIALS,
} from "@/config/sugarcane";
import { calculatePlantingSeason } from "@/lib/utils/season";

import { DuplicateFarmerModal, DuplicateFarmerInfo } from "@/components/farmers/DuplicateFarmerModal";
import { SuccessModal } from "@/components/farmers/SuccessModal";
import { AddCultivationModal } from "@/components/forms/AddCultivationModal";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Sprout,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Building2,
  Sparkles,
} from "lucide-react";

export function FarmerRegistrationForm() {
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);
  const [isLocationUnlocked, setIsLocationUnlocked] = useState(false);

  // Duplicate Farmer state
  const [duplicateFarmer, setDuplicateFarmer] = useState<DuplicateFarmerInfo | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Success state
  const [savedFarmerId, setSavedFarmerId] = useState<string | null>(null);
  const [savedCultivationId, setSavedCultivationId] = useState<string | null>(null);
  const [savedFarmerName, setSavedFarmerName] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Modal for adding cultivation to existing duplicate farmer
  const [cultivationFarmerId, setCultivationFarmerId] = useState<string | null>(null);
  const [isAddCultivationOpen, setIsAddCultivationOpen] = useState(false);

  // Form error notification
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FarmerRegistrationInput>({
    resolver: zodResolver(farmerRegistrationSchema),
    defaultValues: {
      farmerName: "",
      mobile: "",
      pincode: "",
      village: "",
      taluka: "",
      district: "",
      state: "Maharashtra",
      plantingDate: "",
      sugarcaneVariety: "86032",
      spacing: "4.5 × 1.5",
      soilType: "Black Soil (खोल माती)",
      waterSource: "1. Borewell / Tube well (१. बोअरवेल / ट्यूबवेल)",
      plantingMaterial: "Cane / बेणे (Bene)",
    },
  });


  const watchPincode = watch("pincode");
  const watchMobile = watch("mobile");
  const watchPlantingDate = watch("plantingDate");
  const watchVillage = watch("village");

  // Live season calculation
  const seasonResult = watchPlantingDate
    ? calculatePlantingSeason(watchPlantingDate)
    : null;

  // Real-time Pincode Lookup
  useEffect(() => {
    const cleanPin = (watchPincode || "").trim();
    if (cleanPin.length === 6 && /^\d{6}$/.test(cleanPin)) {
      let isMounted = true;
      setIsFetchingLocation(true);
      setLocationError(null);

      fetch(`/api/location/pincode/${cleanPin}`)
        .then(async (res) => {
          const data = await res.json();
          if (!isMounted) return;

          if (res.ok && data.success) {
            setAvailableVillages(data.villages || []);
            setValue("taluka", data.taluka || "", { shouldValidate: true });
            setValue("district", data.district || "", { shouldValidate: true });
            setValue("state", data.state || "Maharashtra", { shouldValidate: true });

            if (data.villages && data.villages.length > 0) {
              setValue("village", data.villages[0], { shouldValidate: true });
            }
          } else {
            setLocationError(data.error || "Pincode not found. Please enter manually.");
            setAvailableVillages([]);
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("Location lookup error", err);
          setLocationError("Could not reach location service. Please enter details manually.");
        })
        .finally(() => {
          if (isMounted) setIsFetchingLocation(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setAvailableVillages([]);
      setLocationError(null);
    }
  }, [watchPincode, setValue]);

  // Mobile Duplicate Check on blur or valid 10 digits
  const handleCheckDuplicate = async () => {
    const cleanMobile = (watchMobile || "").trim();
    if (cleanMobile.length === 10 && /^[6-9]\d{9}$/.test(cleanMobile)) {
      setIsCheckingDuplicate(true);
      try {
        const res = await fetch(`/api/farmers/check-mobile?mobile=${cleanMobile}`);
        const data = await res.json();
        if (data.exists && data.farmer) {
          setDuplicateFarmer(data.farmer);
          setIsDuplicateModalOpen(true);
        }
      } catch (err) {
        console.warn("Mobile check error", err);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }
  };

  const onSubmit = async (data: FarmerRegistrationInput) => {
    setSubmitError(null);

    // Final client duplicate check
    try {
      const checkRes = await fetch(`/api/farmers/check-mobile?mobile=${data.mobile.trim()}`);
      const checkData = await checkRes.json();
      if (checkData.exists && checkData.farmer) {
        setDuplicateFarmer(checkData.farmer);
        setIsDuplicateModalOpen(true);
        return;
      }
    } catch (e) {
      // Proceed to server validation
    }

    try {
      const res = await fetch("/api/farmers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (res.status === 409 && resData.existingFarmer) {
          setDuplicateFarmer(resData.existingFarmer);
          setIsDuplicateModalOpen(true);
          return;
        }
        throw new Error(resData.error || "Failed to save farmer record");
      }

      // Success
      setSavedFarmerId(resData.farmer.farmerId);
      setSavedCultivationId(resData.cultivation?.cultivationId);
      setSavedFarmerName(resData.farmer.farmerName);
      setIsSuccessModalOpen(true);
    } catch (err: unknown) {
      console.error("Submission error", err);
      setSubmitError(err instanceof Error ? err.message : "An error occurred while saving.");
    }
  };

  const handleResetForm = () => {
    reset({
      farmerName: "",
      mobile: "",
      pincode: "",
      village: "",
      taluka: "",
      district: "",
      state: "Maharashtra",
      plantingDate: "",
      sugarcaneVariety: "86032",
      spacing: "4.5 × 1.5",
      soilType: "Black Soil (खोल माती)",
      waterSource: "1. Borewell / Tube well (१. बोअरवेल / ट्यूबवेल)",
      plantingMaterial: "Cane / बेणे (Bene)",
    });
    setAvailableVillages([]);
    setIsSuccessModalOpen(false);
    setSubmitError(null);
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to Save Registration</p>
            <p className="text-xs mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION 1 — FARMER INFORMATION */}
        <Card className="border-t-4 border-t-emerald-600">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Section 1 — Farmer Information</CardTitle>
                  <CardDescription>Primary identity and communication details</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 w-fit">
                <span>Farmer ID:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Auto-Generated (F######)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Farmer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Farmer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("farmerName")}
                    placeholder="e.g. Ramesh Narayan Patil"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 ${
                      errors.farmerName
                        ? "border-red-400 focus:ring-red-400"
                        : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                </div>
                {errors.farmerName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.farmerName.message}</span>
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  {isCheckingDuplicate && (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Checking registry...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    {...register("mobile")}
                    onBlur={handleCheckDuplicate}
                    placeholder="98XXXXXXXX"
                    className={`w-full pl-12 pr-3.5 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 ${
                      errors.mobile
                        ? "border-red-400 focus:ring-red-400"
                        : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.mobile.message}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  10-digit Indian mobile number (primary key for duplicate validation)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2 — LOCATION */}
        <Card className="border-t-4 border-t-emerald-600">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Section 2 — Geographical Location</CardTitle>
                  <CardDescription>Automatic postal district resolution</CardDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationUnlocked(!isLocationUnlocked)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {isLocationUnlocked ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isLocationUnlocked ? "Lock Auto-Fill" : "Edit / Unlock Location"}</span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {/* Pincode with live resolution */}
            <div className="max-w-xs">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pincode <span className="text-red-500">*</span>
                </label>
                {isFetchingLocation && (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Fetching location...
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  {...register("pincode")}
                  placeholder="e.g. 416115"
                  className={`w-full px-3.5 py-2.5 text-sm font-mono tracking-wider border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 ${
                    errors.pincode
                      ? "border-red-400 focus:ring-red-400"
                      : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                  }`}
                />
              </div>
              {errors.pincode && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.pincode.message}</span>
                </p>
              )}
              {locationError && (
                <p className="text-xs text-amber-600 mt-1">
                  {locationError}
                </p>
              )}
            </div>

            {/* Resolved Location Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {/* Village selection (Dropdown if multiple post offices, or input) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Village / Post Office <span className="text-red-500">*</span>
                </label>
                {availableVillages.length > 1 ? (
                  <select
                    {...register("village")}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {availableVillages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    {...register("village")}
                    readOnly={!isLocationUnlocked}
                    placeholder="Village"
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none ${
                      isLocationUnlocked
                        ? "bg-white dark:bg-slate-800 border-slate-300 focus:ring-2 focus:ring-emerald-500"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 text-slate-700 dark:text-slate-300"
                    }`}
                  />
                )}
                {errors.village && (
                  <p className="text-xs text-red-600 mt-1">{errors.village.message}</p>
                )}
              </div>

              {/* Taluka */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Taluka / Tehsil <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("taluka")}
                  readOnly={!isLocationUnlocked}
                  placeholder="Taluka"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none ${
                    isLocationUnlocked
                      ? "bg-white dark:bg-slate-800 border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 text-slate-700 dark:text-slate-300"
                  }`}
                />
                {errors.taluka && (
                  <p className="text-xs text-red-600 mt-1">{errors.taluka.message}</p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("district")}
                  readOnly={!isLocationUnlocked}
                  placeholder="District"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none ${
                    isLocationUnlocked
                      ? "bg-white dark:bg-slate-800 border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 text-slate-700 dark:text-slate-300"
                  }`}
                />
                {errors.district && (
                  <p className="text-xs text-red-600 mt-1">{errors.district.message}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("state")}
                  readOnly={!isLocationUnlocked}
                  placeholder="State"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none ${
                    isLocationUnlocked
                      ? "bg-white dark:bg-slate-800 border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 text-slate-700 dark:text-slate-300"
                  }`}
                />
                {errors.state && (
                  <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3 — CULTIVATION DETAILS */}
        <Card className="border-t-4 border-t-emerald-600">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Section 3 — Cultivation Details</CardTitle>
                <CardDescription>Planting calendar, season detection, and agronomic parameters</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Planting Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Planting Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    {...register("plantingDate")}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 ${
                      errors.plantingDate || (seasonResult && !seasonResult.isValid)
                        ? "border-red-400 focus:ring-red-400"
                        : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                    }`}
                  />
                </div>
                {errors.plantingDate && (
                  <p className="text-xs text-red-600 mt-1">{errors.plantingDate.message}</p>
                )}
              </div>

              {/* Sugarcane Variety */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sugarcane Variety <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("sugarcaneVariety")}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SUGARCANE_VARIETIES.map((v) => (
                    <option key={v.varietyId} value={v.varietyId}>
                      {v.displayName}
                    </option>
                  ))}
                </select>
                {errors.sugarcaneVariety && (
                  <p className="text-xs text-red-600 mt-1">{errors.sugarcaneVariety.message}</p>
                )}
              </div>

              {/* Spacing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Row Spacing (ft) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("spacing")}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {SUGARCANE_SPACINGS.map((s) => (
                    <option key={s.spacingId} value={s.spacingValue}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
                {errors.spacing && (
                  <p className="text-xs text-red-600 mt-1">{errors.spacing.message}</p>
                )}
              </div>
            </div>

            {/* Additional Agronomic Parameters: Soil, Water, Material */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              {/* Soil Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Soil Type (मातीचा प्रकार)
                </label>
                <select
                  {...register("soilType")}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Water Source (पाण्याचे स्त्रोत)
                </label>
                <select
                  {...register("waterSource")}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Planting Material (लागवड साहित्य)
                </label>
                <select
                  {...register("plantingMaterial")}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {PLANTING_MATERIALS.map((pm) => (
                    <option key={pm.value} value={pm.value}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            {/* Live Planting Season Detection Banner */}
            {watchPlantingDate && (
              <div className="pt-2">
                {seasonResult?.isValid && seasonResult.seasonDetails ? (
                  <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-600 text-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Determined Season:
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${seasonResult.seasonDetails.badgeClass}`}>
                            {seasonResult.seasonDetails.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {seasonResult.seasonDetails.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-medium text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-slate-800 px-2.5 py-1 rounded border border-emerald-200">
                        {seasonResult.seasonDetails.period}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Unsupported Planting Period: </span>
                      <span>{seasonResult?.message}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleResetForm}
            className="w-full sm:w-auto"
          >
            Clear Form
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={Boolean(watchPlantingDate && !seasonResult?.isValid)}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isSubmitting ? "Saving farmer data..." : "Save Farmer Registration"}
          </Button>
        </div>
      </form>

      {/* Duplicate Farmer Alert Modal */}
      <DuplicateFarmerModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        farmer={duplicateFarmer}
        onAddCultivationClick={(farmerId) => {
          setCultivationFarmerId(farmerId);
          setIsAddCultivationOpen(true);
        }}
      />

      {/* Add Cultivation Modal (triggered from duplicate alert) */}
      {cultivationFarmerId && (
        <AddCultivationModal
          isOpen={isAddCultivationOpen}
          onClose={() => setIsAddCultivationOpen(false)}
          farmerId={cultivationFarmerId}
          farmerName={duplicateFarmer?.farmerName}
          onSuccess={() => {
            setIsAddCultivationOpen(false);
            setSavedFarmerId(cultivationFarmerId);
            setIsSuccessModalOpen(true);
          }}
        />
      )}

      {/* Success Modal */}
      {savedFarmerId && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          farmerId={savedFarmerId}
          cultivationId={savedCultivationId || undefined}
          farmerName={savedFarmerName || undefined}
          onReset={handleResetForm}
        />
      )}
    </div>
  );
}
