import { FC, memo } from "react";
import type { Item } from "../../types";
import { formatCurrency, calcItemProfit } from "../../utils/finance";
import Badge from "../1-atoms/Badge";
import Button from "../1-atoms/Button";

interface Props {
  item: Item;
  gridClass: string;
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

const ItemRow: FC<Props> = ({
  item,
  gridClass,
  showBundle = false,
  onMarkSold,
  onEdit,
  onDelete,
}) => {
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
    <div
      className={`grid ${gridClass} gap-4 items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
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

      {showBundle && (
        <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
          {item.bundleName}
        </span>
      )}

      <span className="text-right text-sm tabular-nums text-slate-500 dark:text-slate-400">
        {formatCurrency(item.allocatedPurchaseCost + item.allocatedExtraCostShare)}
      </span>

      <span className="text-right text-sm tabular-nums font-semibold text-amber-600 dark:text-amber-400">
        {formatCurrency(item.minSalePrice)}
      </span>

      <span
        className={`text-right text-sm tabular-nums font-semibold ${
          profit === null
            ? "text-slate-400 dark:text-slate-500"
            : profit >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
        }`}
      >
        {profit !== null ? formatCurrency(profit) : "—"}
      </span>

      <div className="flex gap-1.5 justify-end">
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
