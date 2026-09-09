"use client";

import React, { useState, useEffect } from "react";
import { FormRecord, FormFieldItem } from "@/types";
import { calculatePlantingSeason } from "@/lib/utils/season";
import { Logo } from "@/components/ui/Logo";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  User,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface PublicDynamicFormProps {
  form: FormRecord;
  fields: FormFieldItem[];
}

export function PublicDynamicForm({ form, fields }: PublicDynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success state with Reference Number
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Location auto-resolution states
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Initialize form default values
  useEffect(() => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") {
        initial[f.id] = false;
      } else if (f.type === "dropdown" && f.options && f.options.length > 0) {
        initial[f.id] = f.options[0];
      } else {
        initial[f.id] = "";
      }
    });
    setFormData(initial);
  }, [fields]);

  // Find key fields
  const plantingDateField = fields.find(
    (f) => f.systemKey === "plantingDate" || f.type === "date"
  );
  const pincodeField = fields.find(
    (f) => f.systemKey === "pincode" || f.label.toLowerCase().includes("pincode")
  );
  const villageField = fields.find(
    (f) => f.systemKey === "village" || f.label.toLowerCase().includes("village")
  );

  const watchPlantingDate = plantingDateField ? formData[plantingDateField.id] : null;
  const seasonResult = watchPlantingDate
    ? calculatePlantingSeason(watchPlantingDate)
    : null;

  // Handle Pincode Resolution
  useEffect(() => {
    if (!pincodeField) return;
    const pin = (formData[pincodeField.id] || "").toString().trim();

    if (pin.length === 6 && /^\d{6}$/.test(pin)) {
      let isMounted = true;
      setIsFetchingLocation(true);
      setLocationMessage(null);

      fetch(`/api/location/pincode/${pin}`)
        .then(async (res) => {
          const data = await res.json();
          if (!isMounted) return;

          if (res.ok && data.success) {
            setAvailableVillages(data.villages || []);

            // Auto-fill related fields
            setFormData((prev) => {
              const updated = { ...prev };
              fields.forEach((f) => {
                if (f.systemKey === "taluka") updated[f.id] = data.taluka || "";
                if (f.systemKey === "district") updated[f.id] = data.district || "";
                if (f.systemKey === "state") updated[f.id] = data.state || "Maharashtra";
                if (f.systemKey === "village" && data.villages?.length > 0) {
                  updated[f.id] = data.villages[0];
                }
              });
              return updated;
            });
            setLocationMessage(`Detected: ${data.taluka}, ${data.district}`);
          } else {
            setLocationMessage("Pincode not found. Please type location manually.");
            setAvailableVillages([]);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLocationMessage("Could not verify pincode. Please enter manually.");
          }
        })
        .finally(() => {
          if (isMounted) setIsFetchingLocation(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setAvailableVillages([]);
      setLocationMessage(null);
    }
  }, [pincodeField ? formData[pincodeField.id] : null]);

  const handleChange = (fieldId: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
    // Clear validation error when modified
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    fields.forEach((f) => {
      const val = formData[f.id];

      if (f.required) {
        if (f.type === "checkbox" && !val) {
          errs[f.id] = `${f.label} is required`;
        } else if (val === undefined || val === null || String(val).trim() === "") {
          errs[f.id] = `${f.label} is required`;
        }
      }

      // Mobile check
      if (f.type === "mobile" && val) {
        const clean = String(val).trim();
        if (!/^[6-9]\d{9}$/.test(clean)) {
          errs[f.id] = "Please enter a valid 10-digit Indian mobile number";
        }
      }

      // Number check
      if (f.type === "number" && val) {
        if (isNaN(Number(val))) {
          errs[f.id] = "Must be a valid number";
        }
      }

      // Date & Planting Season check
      if (f.systemKey === "plantingDate" && val) {
        const season = calculatePlantingSeason(val);
        if (!season.isValid) {
          errs[f.id] = season.message || "Planting date falls in unsupported period";
        }
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Construct payload mapping system keys if applicable
      const payload: Record<string, any> = {};
      fields.forEach((f) => {
        const val = formData[f.id];
        payload[f.id] = val;
        if (f.systemKey) {
          payload[f.systemKey] = val;
        }
      });

      const res = await fetch(`/api/public/forms/${form.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || "Failed to submit form. Please try again.");
      }

      setSubmittedRef(resData.referenceNumber);
    } catch (err: unknown) {
      console.error("Submission failed", err);
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setSubmitError(null);
    setErrors({});
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") initial[f.id] = false;
      else if (f.type === "dropdown" && f.options && f.options.length > 0)
        initial[f.id] = f.options[0];
      else initial[f.id] = "";
    });
    setFormData(initial);
  };

  // SUCCESS CONFIRMATION STATE
  if (submittedRef) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wide uppercase dark:bg-emerald-950 dark:text-emerald-300">
              ✓ Submission Successful
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Thank You!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Your information has been successfully submitted to CaneTrace.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Public Reference Number
            </p>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider">
              {submittedRef}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Please save this reference number for future communication.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-emerald-600/25 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  // PUBLIC FORM SUBMISSION SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-950 dark:to-slate-900 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <Logo size="lg" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {form.name}
            </h1>
            {form.description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {form.description}
              </p>
            )}
          </div>
        </div>

        {/* Error Notice */}
        {submitError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Submission Notice</p>
              <p className="text-xs mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {fields
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  const error = errors[field.id];
                  const value = formData[field.id] ?? "";

                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>

                      {/* TEXT / MOBILE / NUMBER / EMAIL */}
                      {["text", "mobile", "number", "email"].includes(field.type) && (
                        <div className="relative">
                          {field.type === "mobile" && (
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
                              +91
                            </span>
                          )}
                          <input
                            type={
                              field.type === "number"
                                ? "number"
                                : field.type === "email"
                                ? "email"
                                : field.type === "mobile"
                                ? "tel"
                                : "text"
                            }
                            maxLength={
                              field.type === "mobile"
                                ? 10
                                : field.systemKey === "pincode"
                                ? 6
                                : undefined
                            }
                            value={value}
                            placeholder={field.placeholder || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className={`w-full py-3 px-4 text-base border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 transition-all ${
                              field.type === "mobile" ? "pl-12" : ""
                            } ${
                              error
                                ? "border-red-400 focus:ring-red-400"
                                : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                            }`}
                          />
                        </div>
                      )}

                      {/* DATE */}
                      {field.type === "date" && (
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={value}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className={`w-full py-3 px-4 text-base border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 transition-all ${
                              error
                                ? "border-red-400 focus:ring-red-400"
                                : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                            }`}
                          />

                          {/* Live Season Calculation Banner */}
                          {field.systemKey === "plantingDate" && watchPlantingDate && (
                            <div className="pt-1">
                              {seasonResult?.isValid && seasonResult.seasonDetails ? (
                                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      Calculated Season:
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded font-extrabold border ${seasonResult.seasonDetails.badgeClass}`}
                                    >
                                      {seasonResult.seasonDetails.name}
                                    </span>
                                  </div>
                                  <span className="font-mono text-emerald-800 dark:text-emerald-300 hidden sm:inline">
                                    {seasonResult.seasonDetails.period}
                                  </span>
                                </div>
                              ) : (
                                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                  <span>{seasonResult?.message}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* DROPDOWN */}
                      {field.type === "dropdown" && (
                        <div>
                          {/* If village field and pincode returned multiple options, show them */}
                          {field.systemKey === "village" &&
                          availableVillages.length > 1 ? (
                            <select
                              value={value}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              className="w-full py-3 px-4 text-base border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                              {availableVillages.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={value}
                              onChange={(e) => handleChange(field.id, e.target.value)}
                              className="w-full py-3 px-4 text-base border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                              {(field.options || []).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* RADIO */}
                      {field.type === "radio" && (
                        <div className="flex flex-wrap gap-4 pt-1">
                          {(field.options || []).map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={opt}
                                checked={value === opt}
                                onChange={() => handleChange(field.id, opt)}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* CHECKBOX */}
                      {field.type === "checkbox" && (
                        <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => handleChange(field.id, e.target.checked)}
                            className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {field.helpText || field.label}
                          </span>
                        </label>
                      )}

                      {/* TEXTAREA */}
                      {field.type === "textarea" && (
                        <textarea
                          rows={3}
                          value={value}
                          placeholder={field.placeholder || ""}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className="w-full py-3 px-4 text-base border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      )}

                      {/* Pincode loader & feedback */}
                      {field.systemKey === "pincode" && (
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          {isFetchingLocation ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Detecting postal area...
                            </span>
                          ) : locationMessage ? (
                            <span className="text-slate-500 font-medium">
                              {locationMessage}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Auto-populates district and taluka
                            </span>
                          )}
                        </div>
                      )}

                      {/* Help Text */}
                      {field.helpText && field.type !== "checkbox" && (
                        <p className="text-xs text-slate-400">{field.helpText}</p>
                      )}

                      {/* Validation Error */}
                      {error && (
                        <p className="text-xs text-red-600 flex items-center gap-1 pt-0.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{error}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || Boolean(watchPlantingDate && !seasonResult?.isValid)}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Your Information...
                  </>
                ) : (
                  <>
                    Submit Information
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Public Footer */}
        <div className="text-center text-xs text-slate-400 py-4">
          CaneTrace — Smart Sugarcane Farmer Data Platform &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
