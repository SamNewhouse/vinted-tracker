import { FC, memo, useState } from "react";
import type { DraftCost, CostCategoryOption, AdditionalCostCategory } from "../../types";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import Select from "../1-atoms/Select";

const COST_CATEGORIES: CostCategoryOption[] = [
  { value: "postage", label: "Postage in", hint: "Postage paid to receive the bundle" },
  { value: "car_boot_entry", label: "Car boot entry", hint: "Entry fee for the car boot / market" },
  { value: "other", label: "Other", hint: "Any other upfront cost before selling" },
];

interface Props {
  costs: DraftCost[];
  totalInvested: number;
  onAdd: (cost: DraftCost) => void;
  onRemove: (tempId: string) => void;
}

const DraftCostList: FC<Props> = ({ costs, totalInvested, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<AdditionalCostCategory>("car_boot_entry");
  const [amount, setAmount] = useState("");
  const [costError, setCostError] = useState("");

  const selectedHint = COST_CATEGORIES.find((c) => c.value === category)?.hint;

  const handleAdd = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setCostError("Enter a valid amount");
      return;
    }
    const autoLabel =
      label.trim() || COST_CATEGORIES.find((c) => c.value === category)?.label || "Extra cost";
    onAdd({ tempId: `${Date.now()}`, label: autoLabel, category, amount });
    setLabel("");
    setCategory("car_boot_entry");
    setAmount("");
    setCostError("");
    setShowForm(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Upfront Costs
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Split equally across all items · postage in, entry fees
          </p>
        </div>
        {!showForm && (
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(true)}>
            + Add
          </Button>
        )}
      </div>

      {costs.length > 0 && (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {costs.map((c) => (
            <li key={c.tempId} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">{c.label}</span>
                <span className="ml-2 text-xs text-slate-400">
                  {COST_CATEGORIES.find((cat) => cat.value === c.category)?.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                  £{Number(c.amount).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(c.tempId)}
                  className="text-slate-400 hover:text-red-500 transition-colors text-xs"
                  aria-label="Remove cost"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="px-4 py-3 space-y-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={category}
              options={COST_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              hint={selectedHint}
              onChange={(e) => {
                setCategory(e.target.value as AdditionalCostCategory);
                setLabel("");
                setCostError("");
              }}
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              prefix="£"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setCostError("");
              }}
              error={costError}
            />
          </div>
          <Input
            label="Label (optional)"
            placeholder={COST_CATEGORIES.find((c) => c.value === category)?.label ?? ""}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={handleAdd}>
              Add Cost
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setCostError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(costs.length > 0 || totalInvested > 0) && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Invested
          </span>
          <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
            £{totalInvested.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default memo(DraftCostList);
