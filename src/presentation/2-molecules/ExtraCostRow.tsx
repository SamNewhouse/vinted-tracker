"use client";
import { FC, memo } from "react";
import { ExtraCost } from "../../types";
import { formatCurrency } from "../../utils/finance";
import Button from "../1-atoms/Button";

interface Props {
  cost: ExtraCost;
  onDelete: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  postage_in: "Postage (in)",
  postage_out: "Postage (out)",
  car_boot_entry: "Car Boot Entry",
  platform_fee: "Platform Fee",
  packaging: "Packaging",
  other: "Other",
};

const ExtraCostRow: FC<Props> = ({ cost, onDelete }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div>
      <span className="text-sm text-slate-900 dark:text-white font-medium">{cost.label}</span>
      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
        {categoryLabels[cost.category] ?? cost.category}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
        {formatCurrency(cost.amount)}
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={() => onDelete(cost.id)}
      >
        ✕
      </Button>
    </div>
  </div>
);

export default memo(ExtraCostRow);
