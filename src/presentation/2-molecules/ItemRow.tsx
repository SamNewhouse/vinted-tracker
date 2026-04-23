import { FC, memo } from "react";
import type { Item } from "../../types";
import { formatCurrency, calcItemProfit } from "../../utils/finance";
import Badge from "../1-atoms/Badge";
import Button from "../1-atoms/Button";

interface Props {
  item: Item;
  showBundle?: boolean;
  onMarkSold: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
}

const statusVariant = {
  unlisted: "neutral",
  listed: "info",
  sold: "success",
  returned: "warning",
  unsellable: "error",
} as const;

const ItemRow: FC<Props> = ({ item, showBundle = false, onMarkSold, onEdit, onDelete }) => {
  const profit =
    item.salePrice != null
      ? calcItemProfit(
          item.salePrice,
          item.allocatedPurchaseCost,
          item.allocatedExtraCostShare,
          item.saleCosts,
        )
      : null;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      {/* Col 1 — Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
            {item.name}
          </span>
          <Badge label={item.status} status={statusVariant[item.status]} />
        </div>
        {showBundle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.bundleName}</p>
        )}
        {item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {item.description}
          </p>
        )}
      </div>

      {/* Col 2 — Values (fixed width, never flex) */}
      <div className="flex gap-4 shrink-0">
        <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400 w-20 text-right">
          {formatCurrency(item.allocatedPurchaseCost + item.allocatedExtraCostShare)}
        </span>
        <span className="text-sm tabular-nums font-semibold text-amber-600 dark:text-amber-400 w-20 text-right">
          {formatCurrency(item.minSalePrice)}
        </span>
        <span
          className={`text-sm tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 w-20 text-right ...`}
        >
          {profit !== null ? formatCurrency(profit) : ""}
        </span>
      </div>

      {/* Col 3 — Actions (fixed width, never moves) */}
      <div className="flex gap-1.5 shrink-0 flex-none justify-end">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onMarkSold(item)}
          disabled={item.status === "sold"}
          className={item.status === "sold" ? "invisible" : ""}
        >
          Sold
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
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
