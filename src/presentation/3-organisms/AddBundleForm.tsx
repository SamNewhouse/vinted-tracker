"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addBundle, addExtraCost, setActiveBundleId, setView } from "../../store/trackerSlice";
import type { CostCategoryOption, DraftCost, ExtraCostCategory } from "../../types";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import Select from "../1-atoms/Select";
import Textarea from "../1-atoms/Textarea";

const COST_CATEGORIES: CostCategoryOption[] = [
  { value: "postage", label: "Postage in", hint: "Postage paid to receive the bundle" },
  { value: "car_boot_entry", label: "Car boot entry", hint: "Entry fee for the car boot / market" },
  { value: "other", label: "Other", hint: "Any other upfront cost before selling" },
];

const AddBundleForm: FC = () => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [extraCosts, setExtraCosts] = useState<DraftCost[]>([]);
  const [showCostForm, setShowCostForm] = useState(false);
  const [newCostLabel, setNewCostLabel] = useState("");
  const [newCostCategory, setNewCostCategory] = useState<ExtraCostCategory>("car_boot_entry");
  const [newCostAmount, setNewCostAmount] = useState("");
  const [costError, setCostError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Bundle name is required";
    if (!source.trim()) e.source = "Source is required";
    if (!purchaseCost || isNaN(Number(purchaseCost)) || Number(purchaseCost) < 0)
      e.purchaseCost = "Enter a valid purchase cost";
    if (!purchaseDate) e.purchaseDate = "Purchase date is required";
    return e;
  };

  const handleAddCost = () => {
    if (!newCostAmount || isNaN(Number(newCostAmount)) || Number(newCostAmount) <= 0) {
      setCostError("Enter a valid amount");
      return;
    }
    const autoLabel =
      newCostLabel.trim() ||
      COST_CATEGORIES.find((c) => c.value === newCostCategory)?.label ||
      "Extra cost";

    setExtraCosts((prev) => [
      ...prev,
      {
        tempId: `${Date.now()}`,
        label: autoLabel,
        category: newCostCategory,
        amount: newCostAmount,
      },
    ]);
    setNewCostLabel("");
    setNewCostCategory("car_boot_entry");
    setNewCostAmount("");
    setCostError("");
    setShowCostForm(false);
  };

  const removeCost = (tempId: string) => {
    setExtraCosts((prev) => prev.filter((c) => c.tempId !== tempId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    dispatch(
      addBundle({
        name: name.trim(),
        source: source.trim(),
        purchaseCost: Number(purchaseCost),
        purchaseDate,
        notes: notes.trim() || undefined,
      }),
    );

    dispatch((_: any, getState: any) => {
      const bundles = getState().tracker.bundles;
      const newest = bundles[bundles.length - 1];
      if (!newest) return;
      extraCosts.forEach((c) => {
        dispatch(
          addExtraCost({
            bundleId: newest.id,
            cost: {
              label: c.label,
              category: c.category,
              amount: Number(c.amount),
            },
          }),
        );
      });
      dispatch(setActiveBundleId(newest.id));
      dispatch(setView("bundle-detail"));
    });
  };

  const totalExtraCosts = extraCosts.reduce((s, c) => s + Number(c.amount), 0);
  const totalInvested = (Number(purchaseCost) || 0) + totalExtraCosts;
  const selectedCategoryHint = COST_CATEGORIES.find((c) => c.value === newCostCategory)?.hint;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
          Add New Bundle
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Log a purchase. Selling postage is recorded per item when you mark it as sold.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Bundle Name"
          placeholder="e.g. Car boot haul – 12 Apr"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Source"
          placeholder="e.g. Car boot – Wigan, Charity shop, Vinted"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          error={errors.source}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Purchase Cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            prefix="£"
            value={purchaseCost}
            onChange={(e) => setPurchaseCost(e.target.value)}
            error={errors.purchaseCost}
          />
          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            error={errors.purchaseDate}
          />
        </div>

        {/* ── Upfront extra costs ── */}
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
            {!showCostForm && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowCostForm(true)}>
                + Add
              </Button>
            )}
          </div>

          {extraCosts.length > 0 && (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {extraCosts.map((c) => (
                <li
                  key={c.tempId}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {c.label}
                    </span>
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
                      onClick={() => removeCost(c.tempId)}
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

          {showCostForm && (
            <div className="px-4 py-3 space-y-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Category"
                  value={newCostCategory}
                  options={COST_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                  hint={selectedCategoryHint}
                  onChange={(e) => {
                    setNewCostCategory(e.target.value as ExtraCostCategory);
                    setNewCostLabel("");
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
                  value={newCostAmount}
                  onChange={(e) => {
                    setNewCostAmount(e.target.value);
                    setCostError("");
                  }}
                  error={costError}
                />
              </div>
              <Input
                label="Label (optional)"
                placeholder={
                  COST_CATEGORIES.find((c) => c.value === newCostCategory)?.label ??
                  "e.g. Royal Mail 2nd class"
                }
                value={newCostLabel}
                onChange={(e) => setNewCostLabel(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={handleAddCost}>
                  Add Cost
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCostForm(false);
                    setCostError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {(extraCosts.length > 0 || Number(purchaseCost) > 0) && (
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

        <Textarea
          label="Notes (optional)"
          placeholder="Any notes about this purchase..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" fullWidth>
            Create Bundle
          </Button>
          <Button type="button" variant="ghost" onClick={() => dispatch(setView("bundles"))}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default memo(AddBundleForm);
