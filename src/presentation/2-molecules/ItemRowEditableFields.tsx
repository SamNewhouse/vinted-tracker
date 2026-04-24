import { FC, memo, useState } from "react";
import type { Item, ItemStatus } from "../../types";
import { formatCurrency } from "../../utils/finance";
import InlineField from "../1-atoms/InlineField";

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "unlisted", label: "Unlisted" },
  { value: "listed", label: "Listed" },
  { value: "returned", label: "Returned" },
  { value: "unsellable", label: "Unsellable" },
];

interface Props {
  item: Item;
  isInactive: boolean;
  onSaveName: (val: string) => void;
  onSaveMargin: (val: string) => void;
  onSaveListedPrice: (val: string) => void;
  onSaveStatus: (val: string) => void;
}

export const StatusField: FC<{ value: ItemStatus; onSave: (val: string) => void }> = ({
  value,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
          Status
          <span className="ml-1 text-slate-300 dark:text-slate-600 text-xs">✎</span>
        </p>
        <p
          className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:opacity-70 transition-opacity capitalize"
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
        >
          {value}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Status</p>
      <select
        autoFocus
        value={value}
        onChange={(e) => {
          onSave(e.target.value);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        className="text-sm p-1 font-semibold bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none cursor-pointer rounded-sm"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const ItemRowEditableFields: FC<Props> = ({
  item,
  isInactive,
  onSaveName,
  onSaveMargin,
  onSaveListedPrice,
  onSaveStatus,
}) => (
  <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 border-b border-slate-100 dark:border-slate-700">
    <InlineField
      label="Name"
      displayValue={item.name}
      editValue={item.name}
      onSave={onSaveName}
      type="text"
    />
    <InlineField
      label="Margin %"
      displayValue={`${item.targetMarginPercent}%`}
      editValue={String(item.targetMarginPercent)}
      onSave={onSaveMargin}
      type="number"
      suffix="%"
      min={0}
      max={100}
      step={1}
      disabled={isInactive}
    />
    <InlineField
      label="Listed price"
      displayValue={item.listedPrice != null ? formatCurrency(item.listedPrice) : "-"}
      editValue={item.listedPrice != null ? String(item.listedPrice) : ""}
      onSave={onSaveListedPrice}
      type="number"
      prefix="£"
      step={0.01}
      min={0.01}
      disabled={item.status === "sold"}
    />
    {item.status !== "sold" && <StatusField value={item.status} onSave={onSaveStatus} />}
  </div>
);

export default memo(ItemRowEditableFields);
