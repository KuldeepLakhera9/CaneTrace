"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FormRecord } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Archive,
  ExternalLink,
  Calendar,
  Layers,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { FormPreviewModal } from "@/components/forms/FormPreviewModal";

interface FormsListViewProps {
  initialForms: FormRecord[];
}

export function FormsListView({ initialForms }: FormsListViewProps) {
  const [forms, setForms] = useState<FormRecord[]>(initialForms);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormSlug, setNewFormSlug] = useState("");
  const [newFormDesc, setNewFormDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Preview state
  const [previewForm, setPreviewForm] = useState<FormRecord | null>(null);
  const [previewFields, setPreviewFields] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Copied link state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/f/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFormName,
          slug: newFormSlug,
          description: newFormDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create form");

      setForms([data.form, ...forms]);
      setIsCreateOpen(false);
      setNewFormName("");
      setNewFormSlug("");
      setNewFormDesc("");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenPreview = async (f: FormRecord) => {
    try {
      const res = await fetch(`/api/forms/${f.formId}`);
      const data = await res.json();
      if (res.ok && data.form) {
        setPreviewForm(data.form);
        setPreviewFields(data.version?.fields || []);
        setIsPreviewOpen(true);
      }
    } catch (e) {
      console.error("Preview load error", e);
    }
  };

  const handleArchive = async (formId: string) => {
    if (!confirm("Are you sure you want to archive this form? Public submissions will be halted.")) return;
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      const data = await res.json();
      if (res.ok && data.form) {
        setForms(forms.map((item) => (item.formId === formId ? data.form : item)));
      }
    } catch (e) {
      console.error("Archive error", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Form Management
          </h1>
          <p className="text-sm text-slate-500">
            Create, version, and manage field data collection forms.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create New Form
        </Button>
      </div>

      {/* Forms Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Form Name & Slug</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Public URL</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {forms.map((f) => (
                <tr
                  key={f.formId}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {f.name}
                    </div>
                    {f.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {f.description}
                      </p>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        f.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : f.status === "DRAFT"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      v{f.currentVersion}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs text-slate-500 font-mono">
                        /f/{f.slug}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(f.slug)}
                        title="Copy public link"
                        className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {copiedSlug === f.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(f)}
                        className="p-1.5 text-xs text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      <Link
                        href={`/form-builder/${f.formId}`}
                        className="p-1.5 text-xs text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Form</span>
                      </Link>

                      {f.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => handleArchive(f.formId)}
                          className="p-1.5 text-xs text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Archive form"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Form Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create New Data Collection Form
            </h3>

            {createError && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2.5 rounded-lg">
                {createError}
              </p>
            )}

            <form onSubmit={handleCreateForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Form Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soil Data Survey 2027"
                  value={newFormName}
                  onChange={(e) => {
                    setNewFormName(e.target.value);
                    if (!newFormSlug) {
                      setNewFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-300 dark:border-slate-700 rounded-l-lg text-xs text-slate-400 font-mono">
                    /f/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="soil-data-2027"
                    value={newFormSlug}
                    onChange={(e) => setNewFormSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border rounded-r-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Purpose of this data collection..."
                  value={newFormDesc}
                  onChange={(e) => setNewFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isCreating}
                >
                  Create Form
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Preview Modal */}
      {previewForm && (
        <FormPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          form={previewForm}
          fields={previewFields}
        />
      )}
    </div>
  );
}
