import { FC, memo } from "react";
import type { Item } from "../../types";
import { formatCurrency, calcItemProfit, calcTotalSaleCosts } from "../../utils/finance";
import Badge from "../1-atoms/Badge";
import Button from "../1-atoms/Button";
import ValueCell from "../1-atoms/ValueCell";

interface Props {
  item: Item;
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

const ItemRow: FC<Props> = ({ item, onMarkSold, onEdit, onDelete }) => {
  const totalSaleCosts = calcTotalSaleCosts(item.saleCosts);

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

      <div className="grid grid-cols-4 gap-4 text-right shrink-0 w-[340px]">
        <ValueCell
          value={formatCurrency(item.allocatedPurchaseCost + item.allocatedExtraCostShare)}
          colour="muted"
        />
        <ValueCell value={formatCurrency(item.breakEvenPrice)} colour="muted" />
        <ValueCell value={formatCurrency(item.minSalePrice)} colour="warning" />
        <ValueCell
          value={profit !== null ? formatCurrency(profit) : ""}
          colour={profit === null ? "muted" : profit >= 0 ? "profit" : "loss"}
        />
      </div>

      <div className="flex gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onMarkSold(item.id)}
          disabled={item.status === "sold"}
          className={item.status === "sold" ? "invisible" : ""}
        >
          Sold
        </Button>
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
