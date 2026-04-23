import { FC, memo } from "react";
import type { Item } from "../../types";
import { formatCurrency, calcItemProfit } from "../../utils/finance";
import Badge from "../1-atoms/Badge";
import Button from "../1-atoms/Button";
import ItemRow from "./ItemRow";

interface Props {
  items: Item[];
  onMarkSold: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
  showBundle?: boolean;
}

const statusVariant = {
  unlisted: "neutral",
  listed: "info",
  sold: "success",
  returned: "warning",
  unsellable: "error",
} as const;

// Grid template changes based on whether bundle column is shown
const gridCols = (showBundle: boolean) =>
  showBundle
    ? "grid-cols-[1fr_160px_80px_80px_80px_108px]"
    : "grid-cols-[1fr_80px_80px_80px_108px]";

const HEADERS = ["Cost", "Min. sale", "Profit"];

const ItemsTable: FC<Props> = ({ items, onMarkSold, onEdit, onDelete, showBundle = false }) => (
  <div>
    {/* Header */}
    <div
      className={`grid ${gridCols(showBundle)} gap-4 py-2 border-b border-slate-100 dark:border-slate-800`}
    >
      <div />
      {showBundle && <span className="text-xs text-slate-400 dark:text-slate-500">Bundle</span>}
      {HEADERS.map((h) => (
        <span key={h} className="text-xs text-slate-400 dark:text-slate-500 text-right">
          {h}
        </span>
      ))}
      <div />
    </div>

    {/* Rows */}
    {items.map((item) => (
      <ItemRow
        key={item.id}
        item={item}
        gridClass={gridCols(showBundle)}
        showBundle={showBundle}
        onMarkSold={onMarkSold}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default memo(ItemsTable);
