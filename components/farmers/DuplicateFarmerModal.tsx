import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, UserCheck, PlusCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DuplicateFarmerInfo {
  farmerId: string;
  farmerName: string;
  mobile: string;
  village: string;
  taluka: string;
  district: string;
}

interface DuplicateFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: DuplicateFarmerInfo | null;
  onAddCultivationClick: (farmerId: string) => void;
}

export function DuplicateFarmerModal({
  isOpen,
  onClose,
  farmer,
  onAddCultivationClick,
}: DuplicateFarmerModalProps) {
  const router = useRouter();

  if (!farmer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>Farmer Already Registered</span>
        </div>
      }
      description="A farmer record with this mobile number already exists in the registry."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Farmer ID:
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-200/60 dark:bg-amber-900 rounded text-amber-900 dark:text-amber-200">
              {farmer.farmerId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Farmer Name:
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {farmer.farmerName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Mobile Number:
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              +91 {farmer.mobile}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Location:
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {farmer.village}, {farmer.taluka}, {farmer.district}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          You cannot create a duplicate farmer record with the same mobile number. You can view the existing farmer profile or attach a new sugarcane cultivation cycle to this farmer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              router.push(`/farmers/${farmer.farmerId}`);
            }}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Farmer</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onAddCultivationClick(farmer.farmerId);
            }}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Cultivation</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
