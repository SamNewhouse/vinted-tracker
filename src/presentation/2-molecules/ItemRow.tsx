import { FC, memo, useState } from "react";
import type { Item, ItemStatus } from "../../types";
import { formatCurrency, calcItemProfit, calcROI } from "../../utils/finance";
import { useAppDispatch } from "../../store/hooks";
import { updateItem, markItemStatus } from "../../store/trackerSlice";
import Badge from "../1-atoms/Badge";
import Button from "../1-atoms/Button";
import ItemRowEditableFields from "./ItemRowEditableFields";
import ItemRowPricingBreakdown from "./ItemRowPricingBreakdown";

interface Props {
  item: Item;
  showBundle?: boolean;
  onMarkSold: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
  onBundleClick?: (bundleId: string) => void;
  isOnly?: boolean;
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
  showBundle = false,
  onMarkSold,
  onEdit,
  onDelete,
  onBundleClick,
  isOnly = false,
}) => {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  const isInactive = item.status === "unsellable" || item.status === "returned";
  const totalCost = item.allocatedPurchaseCost + item.allocatedCostShare;
  const totalSaleCosts = item.saleCosts.reduce((s, c) => s + c.amount, 0);

  const profit =
    item.salePrice != null
      ? calcItemProfit(
          item.salePrice,
          item.allocatedPurchaseCost,
          item.allocatedCostShare,
          item.saleCosts,
        )
      : null;

  const roi = profit !== null ? calcROI(profit, totalCost) : null;

  const saveName = (val: string) => {
    const trimmed = val.trim();
    if (trimmed) dispatch(updateItem({ itemId: item.id, changes: { name: trimmed } }));
  };

  const saveMargin = (val: string) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100)
      dispatch(updateItem({ itemId: item.id, changes: { targetMarginPercent: parsed } }));
  };

  const saveListedPrice = (val: string) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0)
      dispatch(updateItem({ itemId: item.id, changes: { listedPrice: parsed } }));
  };

  const saveStatus = (val: string) => {
    if (val !== item.status)
      dispatch(markItemStatus({ itemId: item.id, status: val as ItemStatus }));
  };

  const undoSale = () => dispatch(markItemStatus({ itemId: item.id, status: "listed" }));

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className={!isOnly ? "border-b border-slate-100 dark:border-slate-800 last:border-0" : ""}>
      {/* Main row */}
      <div
        role="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-3 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors -mx-5 px-5"
      >
        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
              {item.name}
            </span>
            <Badge label={item.status} status={statusVariant[item.status]} />
          </div>

          {/* Mobile: cost info */}
          <div className="flex items-center gap-3 mt-0.5 sm:hidden">
            {!isInactive && (
              <span className="text-xs tabular-nums text-amber-600 dark:text-amber-400">
                Min {formatCurrency(item.minSalePrice)}
              </span>
            )}
            {profit !== null && (
              <span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                P&L {formatCurrency(profit)}
              </span>
            )}
          </div>

          {/* Desktop: description */}
          {item.description && (
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">
              {item.description}
            </p>
          )}
        </div>

        {/* Value columns — desktop only */}
        <div className="hidden sm:flex gap-4 shrink-0">
          <span
            className={`text-sm tabular-nums font-semibold w-20 text-right ${
              item.status === "sold"
                ? "text-blue-400 dark:text-blue-300"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {isInactive ? "-" : formatCurrency(item.minSalePrice)}
          </span>
          <span className="text-sm tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 w-20 text-right">
            {profit !== null ? formatCurrency(profit) : ""}
          </span>
        </div>

        {/* Actions */}
        <div
          onClick={stopProp}
          className="flex gap-0.5 shrink-0 [&>button]:px-2 sm:[&>button]:px-3"
        >
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

      {/* Expanded panel */}
      {expanded && (
        <div className="mb-3 space-y-2">
          {showBundle && item.bundleId && (
            <button
              onClick={() => onBundleClick?.(item.bundleId!)}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors ml-1"
            >
              {item.source} → view bundle
            </button>
          )}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
            <ItemRowEditableFields
              item={item}
              isInactive={isInactive}
              onSaveName={saveName}
              onSaveMargin={saveMargin}
              onSaveListedPrice={saveListedPrice}
              onSaveStatus={saveStatus}
            />
            <ItemRowPricingBreakdown
              item={item}
              isInactive={isInactive}
              totalCost={totalCost}
              totalSaleCosts={totalSaleCosts}
              profit={profit}
              roi={roi}
              onUndoSale={undoSale}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ItemRow);
