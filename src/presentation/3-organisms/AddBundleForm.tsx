"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addBundle, setView } from "../../store/trackerSlice";
import type { DraftItem, Cost, Source } from "../../types";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import Textarea from "../1-atoms/Textarea";
import DraftCostList from "../2-molecules/DraftCostList";
import DraftItemList from "../2-molecules/DraftItemList";
import Select from "../1-atoms/Select";
import { SOURCES } from "../../config/constants";

const AddBundleForm: FC = () => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [source, setSource] = useState<Source>("vinted");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftCosts, setDraftCosts] = useState<Cost[]>([]);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Bundle name is required";
    if (!source.trim()) e.source = "Source is required";
    if (!purchaseCost || isNaN(Number(purchaseCost)) || Number(purchaseCost) < 0)
      e.purchaseCost = "Enter a valid purchase cost";
    if (!purchaseDate) e.purchaseDate = "Purchase date is required";
    if (draftItems.length === 0) e.items = "Add at least one item";
    return e;
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
        bundle: {
          name: name.trim(),
          source,
          purchaseCost: Number(purchaseCost),
          purchaseDate,
          notes: notes.trim() || undefined,
          costs: draftCosts,
        },
        draftItems,
      }),
    );

    dispatch(setView("bundle-detail"));
  };

  const totalExtraCosts = draftCosts.reduce((s, c) => s + c.amount, 0);
  const totalInvested = (Number(purchaseCost) || 0) + totalExtraCosts;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
          Add New Bundle
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Log a purchase. Add items now - sale costs are recorded per item when you mark it as sold.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Bundle Name"
          placeholder="e.g. Vinted bundle - 3 tshirts, 2 jumpers"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Select
          label="Source"
          value={source}
          onChange={(e) => setSource(e.target.value as Source)}
          options={SOURCES}
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

        <DraftItemList
          items={draftItems}
          error={errors.items}
          onAdd={(item) => setDraftItems((prev) => [...prev, item])}
          onRemove={(id) => setDraftItems((prev) => prev.filter((i) => i.id !== id))}
        />

        <DraftCostList
          costs={draftCosts}
          totalInvested={totalInvested}
          onAdd={(cost) => setDraftCosts((prev) => [...prev, cost])}
          onRemove={(id) => setDraftCosts((prev) => prev.filter((c) => c.id !== id))}
        />

        <Textarea
          label="Notes (optional)"
          placeholder="Any notes about this purchase..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Purchase cost</span>
            <span className="tabular-nums">£{(Number(purchaseCost) || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Upfront costs</span>
            <span className="tabular-nums">£{totalExtraCosts.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1">
            <span>Total invested</span>
            <span className="tabular-nums">£{totalInvested.toFixed(2)}</span>
          </div>
        </div>

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
