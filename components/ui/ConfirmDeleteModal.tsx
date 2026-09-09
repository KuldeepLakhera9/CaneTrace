import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Trash2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title={
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <Trash2 className="w-5 h-5" />
          <span>{title}</span>
        </div>
      }
      description="Permanent Record Removal"
      maxWidth="md"
    >
      <div className="space-y-4">
        {itemName && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs">
            <span className="font-semibold text-red-800 dark:text-red-300 block">
              Target Record:
            </span>
            <span className="font-mono text-sm font-bold text-red-900 dark:text-red-200">
              {itemName}
            </span>
          </div>
        )}

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={onConfirm}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span>Delete Permanently</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
