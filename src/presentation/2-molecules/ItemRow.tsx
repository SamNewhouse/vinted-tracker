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
}) => {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  const isInactive = item.status === "unsellable" || item.status === "returned";
  const totalCost = item.allocatedPurchaseCost + item.allocatedExtraCostShare;
  const totalSaleCosts = item.saleCosts.reduce((s, c) => s + c.amount, 0);

  const profit =
    item.salePrice != null
      ? calcItemProfit(item.salePrice, item.allocatedPurchaseCost, item.allocatedExtraCostShare, item.saleCosts)
      : null;

  const roi =
    profit !== null ? calcROI(profit, totalCost) : null;

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

  const undoSale = () =>
    dispatch(markItemStatus({ itemId: item.id, status: "listed" }));

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      {/* Main row */}
      <div className="flex items-center gap-4 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 min-w-0 text-left group"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300">
              {expanded ? "▾" : "▸"}
            </span>
            <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
              {item.name}
            </span>
            <Badge label={item.status} status={statusVariant[item.status]} />
          </div>
          {showBundle && (
            <span
              onClick={(e) => { e.stopPropagation(); onBundleClick?.(item.bundleId); }}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-0.5 ml-4 cursor-pointer transition-colors"
            >
              {item.bundleName} →
            </span>
          )}
          {item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate ml-4">
              {item.description}
            </p>
          )}
        </button>

        <div className="flex gap-4 shrink-0">
          <span className="text-sm tabular-nums font-semibold text-amber-600 dark:text-amber-400 w-20 text-right">
            {isInactive ? "—" : formatCurrency(item.minSalePrice)}
          </span>
          <span className="text-sm tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 w-20 text-right">
            {profit !== null ? formatCurrency(profit) : ""}
          </span>
        </div>

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

      {/* Expanded panel */}
      {expanded && (
        <div className="ml-4 mb-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
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
      )}
    </div>
  );
};

export default memo(ItemRow);
