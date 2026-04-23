import { FC, memo } from "react";
import type { BundleStatus } from "../../types";

interface Props {
  label: string;
  status?: BundleStatus;
  size?: "sm" | "md";
}

const statusClasses: Record<BundleStatus, string> = {
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  profit:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  loss: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

const Badge: FC<Props> = ({ label, status = "neutral", size = "sm" }) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${statusClasses[status]}`}
    >
      {label}
    </span>
  );
};

export default memo(Badge);
