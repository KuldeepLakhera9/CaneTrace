import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, UserPlus, Eye, LayoutDashboard, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  farmerId: string;
  cultivationId?: string;
  farmerName?: string;
  onReset: () => void;
}

export function SuccessModal({
  isOpen,
  farmerId,
  cultivationId,
  farmerName,
  onReset,
}: SuccessModalProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(farmerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onReset}
      maxWidth="md"
    >
      <div className="text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Farmer Data Saved Successfully
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            The registration and initial cultivation cycle have been securely recorded in the registry.
          </p>
        </div>

        {/* Farmer ID & Details Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Official Farmer ID</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy ID"}</span>
            </button>
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider">
            {farmerId}
          </div>
          {farmerName && (
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {farmerName}
            </p>
          )}
          {cultivationId && (
            <p className="text-[11px] text-slate-400 font-mono">
              Cultivation Record: {cultivationId}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Another Farmer</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/farmers/${farmerId}`)}
            className="w-full sm:w-auto"
          >
            <Eye className="w-4 h-4" />
            <span>View Farmer</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
