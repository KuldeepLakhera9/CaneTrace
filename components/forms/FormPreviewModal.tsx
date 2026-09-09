"use client";

import React, { useState } from "react";
import { FormFieldItem, FormRecord } from "@/types";
import { Smartphone, Monitor, X, CheckCircle, AlertCircle } from "lucide-react";

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Partial<FormRecord>;
  fields: FormFieldItem[];
}

export function FormPreviewModal({
  isOpen,
  onClose,
  form,
  fields,
}: FormPreviewModalProps) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Live Preview:
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
              {form.name || "Untitled Form"}
            </span>
          </div>

          {/* Device toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                device === "mobile"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile (Farmer View)
            </button>
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                device === "desktop"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop View
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Screen Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
          {device === "mobile" ? (
            /* Smartphone Frame Bezel */
            <div className="w-[375px] h-[720px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col relative overflow-hidden">
              {/* Speaker notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-20" />

              {/* Screen content */}
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[34px] overflow-y-auto pt-8 px-4 pb-6 space-y-4">
                <div className="text-center pt-2 space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {form.name || "Farmer Registration"}
                  </h3>
                  {form.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3.5 pt-2">
                  {fields
                    .sort((a, b) => a.order - b.order)
                    .map((f) => (
                      <div key={f.id} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          {f.label}
                          {f.required && <span className="text-red-500">*</span>}
                        </label>

                        {f.type === "dropdown" ? (
                          <select className="w-full py-2 px-3 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700">
                            {(f.options || []).map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : f.type === "textarea" ? (
                          <textarea
                            rows={2}
                            placeholder={f.placeholder || ""}
                            className="w-full py-2 px-3 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                          />
                        ) : f.type === "checkbox" ? (
                          <div className="flex items-center gap-2 pt-0.5">
                            <input type="checkbox" className="w-4 h-4 rounded text-emerald-600" />
                            <span className="text-xs text-slate-600">{f.helpText || f.label}</span>
                          </div>
                        ) : (
                          <input
                            type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                            placeholder={f.placeholder || ""}
                            className="w-full py-2 px-3 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                          />
                        )}
                        {f.helpText && f.type !== "checkbox" && (
                          <p className="text-[10px] text-slate-400">{f.helpText}</p>
                        )}
                      </div>
                    ))}
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md mt-4"
                >
                  Submit Information
                </button>
              </div>
            </div>
          ) : (
            /* Desktop View Frame */
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {form.name || "Farmer Registration"}
                </h3>
                {form.description && (
                  <p className="text-sm text-slate-500">{form.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {fields
                  .sort((a, b) => a.order - b.order)
                  .map((f) => (
                    <div key={f.id} className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </label>
                      {f.type === "dropdown" ? (
                        <select className="w-full py-2.5 px-3.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                          {(f.options || []).map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type === "date" ? "date" : "text"}
                          placeholder={f.placeholder || ""}
                          className="w-full py-2.5 px-3.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                        />
                      )}
                      {f.helpText && <p className="text-xs text-slate-400">{f.helpText}</p>}
                    </div>
                  ))}
              </div>

              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
              >
                Submit Information
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
