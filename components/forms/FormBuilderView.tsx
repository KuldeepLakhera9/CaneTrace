"use client";

import React, { useState } from "react";
import { FormRecord, FormVersionRecord, FormFieldItem, FormFieldType } from "@/types";
import { FormPreviewModal } from "@/components/forms/FormPreviewModal";
import { Button } from "@/components/ui/Button";
import {
  Save,
  Eye,
  Rocket,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Settings2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Type,
  Hash,
  Phone,
  Mail,
  Calendar,
  ListFilter,
  CheckSquare,
  AlignLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface FormBuilderViewProps {
  initialForm: FormRecord;
  initialVersion: FormVersionRecord;
}

const FIELD_TYPE_OPTIONS: { type: FormFieldType; label: string; icon: any }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "number", label: "Number", icon: Hash },
  { type: "mobile", label: "Mobile", icon: Phone },
  { type: "email", label: "Email", icon: Mail },
  { type: "date", label: "Date", icon: Calendar },
  { type: "dropdown", label: "Dropdown", icon: ListFilter },
  { type: "radio", label: "Radio", icon: ListFilter },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare },
  { type: "textarea", label: "Textarea", icon: AlignLeft },
];

export function FormBuilderView({
  initialForm,
  initialVersion,
}: FormBuilderViewProps) {
  const [form, setForm] = useState<FormRecord>(initialForm);
  const [fields, setFields] = useState<FormFieldItem[]>(
    initialVersion.fields || []
  );
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    fields[0]?.id || null
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  // Reorder field up or down
  const moveField = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= fields.length) return;

    const copy = [...fields];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // re-assign order numbers
    copy.forEach((f, i) => {
      f.order = i + 1;
    });

    setFields(copy);
  };

  // Add field from palette
  const handleAddField = (type: FormFieldType) => {
    const newFieldId = `field-${Date.now()}`;
    const newField: FormFieldItem = {
      id: newFieldId,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      type,
      required: false,
      placeholder: "",
      helpText: "",
      options: ["dropdown", "radio"].includes(type)
        ? ["Option 1", "Option 2"]
        : [],
      order: fields.length + 1,
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newFieldId);
  };

  // Remove field
  const handleRemoveField = (fieldId: string) => {
    if (fields.length <= 1) {
      alert("A form must have at least one field.");
      return;
    }
    const updated = fields.filter((f) => f.id !== fieldId);
    updated.forEach((f, i) => {
      f.order = i + 1;
    });
    setFields(updated);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(updated[0]?.id || null);
    }
  };

  // Update field attributes
  const updateSelectedField = (updates: Partial<FormFieldItem>) => {
    if (!selectedFieldId) return;
    setFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f))
    );
  };

  // Save draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/forms/${form.formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-draft",
          name: form.name,
          description: form.description,
          fields,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      setFeedback({ type: "success", message: "Draft saved successfully!" });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save draft",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Form (or publish new version)
  const handlePublish = async () => {
    setIsPublishing(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/forms/${form.formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish-new-version",
          fields,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish version");

      setForm(data.form);
      setFeedback({
        type: "success",
        message: `Version ${data.version?.version || 1} published successfully! Live at /f/${form.slug}`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to publish",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {form.name}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                form.status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : form.status === "DRAFT"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {form.status}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              v{form.currentVersion}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Slug: <code className="font-mono text-emerald-700 dark:text-emerald-400">/f/{form.slug}</code></span>
            {form.status === "PUBLISHED" && (
              <a
                href={`/f/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-semibold"
              >
                <span>Open Live Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            Preview Form
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handlePublish}
            isLoading={isPublishing}
            className="flex items-center gap-1.5 min-w-[140px]"
          >
            <Rocket className="w-4 h-4" />
            Publish Form
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Form Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PALETTE & FIELDS LIST (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Add Field Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Add Field to Form
            </span>
            <div className="flex flex-wrap gap-2">
              {FIELD_TYPE_OPTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddField(item.type)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields Stack */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Form Fields ({fields.length})
              </span>
              <span className="text-xs text-slate-400">
                Click a field to configure its properties
              </span>
            </div>

            <div className="space-y-2">
              {fields.map((f, idx) => {
                const isSelected = f.id === selectedFieldId;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 shadow-sm"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col gap-0.5 text-slate-400">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(idx, "up");
                          }}
                          className="hover:text-slate-700 disabled:opacity-20"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(idx, "down");
                          }}
                          className="hover:text-slate-700 disabled:opacity-20"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {f.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono capitalize">
                            {f.type}
                          </span>
                          {f.required ? (
                            <span className="text-[10px] text-red-600 font-bold">
                              Required
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Optional
                            </span>
                          )}
                          {f.systemKey && (
                            <span className="text-[10px] text-emerald-600 font-mono">
                              sys:{f.systemKey}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveField(f.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FIELD CONFIGURATION DRAWER (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Field Properties
              </span>
            </div>
            {selectedField && (
              <span className="text-xs font-mono text-slate-400">
                {selectedField.id}
              </span>
            )}
          </div>

          {selectedField ? (
            <div className="space-y-4">
              {/* Field Label */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateSelectedField({ label: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Field Type
                </label>
                <select
                  value={selectedField.type}
                  onChange={(e) =>
                    updateSelectedField({
                      type: e.target.value as FormFieldType,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {FIELD_TYPE_OPTIONS.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Required Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Mandatory Field
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Farmer must provide this value before submitting
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(e) =>
                    updateSelectedField({ required: e.target.checked })
                  }
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Placeholder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={selectedField.placeholder || ""}
                  placeholder="e.g. Enter value..."
                  onChange={(e) =>
                    updateSelectedField({ placeholder: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Help Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Help / Guidance Text
                </label>
                <input
                  type="text"
                  value={selectedField.helpText || ""}
                  placeholder="Small note displayed below field"
                  onChange={(e) =>
                    updateSelectedField({ helpText: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Options List for Dropdown / Radio / Checkbox */}
              {["dropdown", "radio", "checkbox"].includes(selectedField.type) && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Selectable Options
                  </label>
                  <div className="space-y-1.5">
                    {(selectedField.options || []).map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(selectedField.options || [])];
                            newOpts[i] = e.target.value;
                            updateSelectedField({ options: newOpts });
                          }}
                          className="flex-1 px-3 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = (selectedField.options || []).filter(
                              (_, idx) => idx !== i
                            );
                            updateSelectedField({ options: newOpts });
                          }}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = [
                          ...(selectedField.options || []),
                          `Option ${(selectedField.options || []).length + 1}`,
                        ];
                        updateSelectedField({ options: newOpts });
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select a field from the list to modify its settings
            </div>
          )}
        </div>
      </div>

      {/* Desktop & Mobile Preview Modal */}
      <FormPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={form}
        fields={fields}
      />
    </div>
  );
}
