import { FC, memo } from "react";
import type { BundleItem, ExtraCost } from "../../types";
import {
  formatCurrency,
  calcMinSalePrice,
  calcBreakEvenPrice,
  calcItemProfit,
  calcTotalAdditionalCosts,
} from "../../utils/finance";
import Badge from "../1-atoms/Badge";
import Button from "../1-atoms/Button";
import CostCell from "../1-atoms/CostCell";
import ProfitValue from "../1-atoms/ProfitValue";

interface Props {
  item: BundleItem;
  bundleExtraCosts: ExtraCost[];
  onMarkSold: (itemId: string) => void;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

const statusVariant = {
  unlisted: "neutral",
  listed: "info",
  sold: "success",
  returned: "warning",
  unsellable: "error",
} as const;

const ItemRow: FC<Props> = ({ item, bundleExtraCosts, onMarkSold, onEdit, onDelete }) => {
  const minSalePrice = calcMinSalePrice(item.allocatedCost, item.extraCostsShare);
  const breakEven = calcBreakEvenPrice(item.allocatedCost, item.extraCostsShare);

  // Sale costs pinned to this item — timing: "sale" + itemId match
  const saleCosts = bundleExtraCosts.filter(
    (c) => c.timing === "sale" && c.itemId === item.id,
  );
  const totalSaleCosts = calcTotalAdditionalCosts(saleCosts);

  const profit =
    item.salePrice != null
      ? calcItemProfit(item.salePrice, item.allocatedCost, item.extraCostsShare, saleCosts)
      : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
            {item.name}
          </span>
          <Badge label={item.status} status={statusVariant[item.status]} />
        </div>
        {item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {item.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-right shrink-0">
        <CostCell
          label="Cost"
          value={formatCurrency(item.allocatedCost + item.extraCostsShare)}
          colour="muted"
        />
        <CostCell label="Break-even" value={formatCurrency(breakEven)} colour="muted" />
        <CostCell label="Min. sale" value={formatCurrency(minSalePrice)} colour="warning" />
        {item.status === "sold" && profit !== null && (
          <div>
            <p className="text-xs text-slate-400 mb-0.5">
              Profit
              {totalSaleCosts > 0 && (
                <span className="text-slate-300 dark:text-slate-600 ml-1">
                  (after {formatCurrency(totalSaleCosts)} costs)
                </span>
              )}
            </p>
            <ProfitValue value={profit} />
          </div>
        )}
      </div>

      <div className="flex gap-1.5 shrink-0">
        {item.status !== "sold" && (
          <Button size="sm" variant="secondary" onClick={() => onMarkSold(item.id)}>
            Sold
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onEdit(item.id)}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onDelete(item.id)}
        >
          ✕
        </Button>
      </div>
    </div>
  );
};

export default memo(ItemRow);
