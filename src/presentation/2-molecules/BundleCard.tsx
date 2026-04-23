import { FC, memo } from "react";
import { useAppSelector } from "../../store/hooks";
import type { Bundle } from "../../types";
import { selectBundleSummary } from "../../store/selectors";
import { formatCurrency, formatPercent } from "../../utils/finance";
import Badge from "../1-atoms/Badge";
import Button from "../1-atoms/Button";
import ProgressBar from "../1-atoms/ProgressBar";
import CostCell from "../1-atoms/CostCell";
import ProfitValue from "../1-atoms/ProfitValue";

interface Props {
  bundle: Bundle;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const BundleCard: FC<Props> = ({ bundle, onView, onDelete }) => {
  const allItems = useAppSelector((state) => state.tracker.items);
  const summary = selectBundleSummary(bundle, allItems);
  const progress = summary.itemCount > 0 ? (summary.soldItemCount / summary.itemCount) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-heading font-semibold text-slate-900 dark:text-white truncate">
            {bundle.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {bundle.source} · {new Date(bundle.purchaseDate).toLocaleDateString("en-GB")}
          </p>
        </div>
        <Badge
          label={summary.isProfitable ? "Profit" : summary.isBreakEven ? "Break-even" : "Loss"}
          status={summary.isProfitable ? "profit" : summary.isBreakEven ? "neutral" : "loss"}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <CostCell label="Invested" value={formatCurrency(summary.totalInvested)} />
        <CostCell label="Revenue" value={formatCurrency(summary.totalRevenue)} colour="profit" />
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-0.5">P&amp;L</p>
          <ProfitValue value={summary.totalProfit} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {summary.soldItemCount}/{summary.itemCount} items sold
          {summary.profitMargin !== 0 && (
            <>
              {" "}
              ·{" "}
              <span
                className={
                  summary.profitMargin >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500"
                }
              >
                {formatPercent(summary.profitMargin, true)} margin
              </span>
            </>
          )}
        </span>
      </div>

      <ProgressBar value={progress} className="mb-4" />

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" fullWidth onClick={() => onView(bundle.id)}>
          View Details
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(bundle.id)}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default memo(BundleCard);
