import { FC, memo } from "react";
import type { Item } from "../../types";
import ItemRow from "./ItemRow";

interface Props {
  items: Item[];
  onMarkSold: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
  showBundle?: boolean;
}

const HEADERS = ["Cost", "Min. sale", "Profit"];

const ItemsTable: FC<Props> = ({ items, onMarkSold, onEdit, onDelete, showBundle = false }) => {
  return (
    <div>
      <div className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex-1" >
          <span className="text-xs text-slate-400 dark:text-slate-500 w-20 text-right">
            Item{showBundle && " & Bundle"} Name
          </span>
        </div>
        <div className="flex gap-4 shrink-0">
          {HEADERS.map((h) => (
            <span key={h} className="text-xs text-slate-400 dark:text-slate-500 w-20 text-right">{h}</span>
          ))}
        </div>
        <div className="flex gap-1.5 flex-none">
          <div className="invisible px-3 py-1.5 text-xs rounded-lg">Sold</div>
          <div className="invisible px-3 py-1.5 text-xs rounded-lg">Edit</div>
          <div className="invisible px-3 py-1.5 text-xs rounded-lg">✕</div>
        </div>
      </div>

      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          showBundle={showBundle}
          onMarkSold={onMarkSold}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default memo(ItemsTable);
