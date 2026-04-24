import { FC, memo } from "react";
import type { Item } from "../../types";
import { formatCurrency } from "../../utils/finance";
import Button from "../1-atoms/Button";

interface Props {
  item: Item;
  isInactive: boolean;
  totalCost: number;
  totalSaleCosts: number;
  profit: number | null;
  roi: number | null;
  onUndoSale: () => void;
}

const ItemRowPricingBreakdown: FC<Props> = ({
  item,
  isInactive,
  totalCost,
  totalSaleCosts,
  profit,
  roi,
  onUndoSale,
}) => (
  <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Cost allocated</p>
      <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
        {isInactive ? "—" : formatCurrency(totalCost)}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Break-even</p>
      <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
        {isInactive ? "—" : formatCurrency(item.breakEvenPrice)}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
        Min sale ({item.targetMarginPercent}%)
      </p>
      <p className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
        {isInactive ? "—" : formatCurrency(item.minSalePrice)}
      </p>
    </div>

    {item.status === "sold" && item.salePrice != null && (
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Sale price</p>
        <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
          {formatCurrency(item.salePrice)}
        </p>
      </div>
    )}

    {totalSaleCosts > 0 && (
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Sale costs</p>
        <p className="text-sm font-semibold tabular-nums text-red-500 dark:text-red-400">
          -{formatCurrency(totalSaleCosts)}
        </p>
      </div>
    )}

    {profit !== null && (
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Net profit</p>
        <p className={`text-sm font-semibold tabular-nums ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
          {formatCurrency(profit)}
        </p>
      </div>
    )}

    {roi !== null && (
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">ROI</p>
        <p className={`text-sm font-semibold tabular-nums ${roi >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
          {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
        </p>
      </div>
    )}

    {item.notes && (
      <div className="col-span-2 sm:col-span-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Notes</p>
        <p className="text-xs text-slate-600 dark:text-slate-300">{item.notes}</p>
      </div>
    )}

    {item.saleCosts.length > 0 && (
      <div className="col-span-2 sm:col-span-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">Sale costs breakdown</p>
        <div className="flex flex-wrap gap-2">
          {item.saleCosts.map((c) => (
            <span
              key={c.id}
              className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-0.5 tabular-nums text-slate-600 dark:text-slate-300"
            >
              {c.label}: {formatCurrency(c.amount)}
            </span>
          ))}
        </div>
      </div>
    )}

    {item.status === "sold" && (
      <div className="col-span-2 sm:col-span-4 pt-2 mt-1 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Sold {item.soldAt ? new Date(item.soldAt).toLocaleDateString("en-GB") : ""}
          {item.salePrice != null && ` · ${formatCurrency(item.salePrice)}`}
        </p>
        <Button size="sm" variant="danger" onClick={onUndoSale}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5"/>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
          </svg>
          Undo sale
        </Button>
      </div>
    )}
  </div>
);

export default memo(ItemRowPricingBreakdown);
