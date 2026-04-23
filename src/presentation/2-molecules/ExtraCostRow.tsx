"use client";
import { FC, memo } from "react";
import type { BundleExtraCost } from "../../types";
import { formatCurrency } from "../../utils/finance";
import { COST_CATEGORIES } from "../../config/constants";
import Button from "../1-atoms/Button";

interface Props {
  cost: BundleExtraCost;
  onDelete: (id: string) => void;
}

const categoryLabel = (category: string) =>
  COST_CATEGORIES.find((c) => c.value === category)?.label ?? category;

const ExtraCostRow: FC<Props> = ({ cost, onDelete }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div>
      <span className="text-sm text-slate-900 dark:text-white font-medium">{cost.label}</span>
      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
        {categoryLabel(cost.category)}
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
