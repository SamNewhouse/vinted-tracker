"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addBundle, setActiveBundleId, setView } from "../../store/trackerSlice";
import type { DraftItem, DraftCost } from "../../types";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import Textarea from "../1-atoms/Textarea";
import DraftCostList from "../2-molecules/DraftCostList";
import DraftItemList from "../2-molecules/DraftItemList";

const AddBundleForm: FC = () => {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftCosts, setDraftCosts] = useState<DraftCost[]>([]);
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

    // Single dispatch — slice handles bundle + item creation atomically
    const bundleId = dispatch(
      addBundle({
        bundle: {
          name: name.trim(),
          source: source.trim(),
          purchaseCost: Number(purchaseCost),
          purchaseDate,
          notes: notes.trim() || undefined,
        },
        draftItems,
      }),
    );

    // addBundle returns the new bundle's ID via the action payload creator
    // Navigate to the new bundle's detail view
    // Note: since addBundle is synchronous (no thunk), the bundle exists immediately
    dispatch(setView("bundle-detail"));
  };

  const totalExtraCosts = draftCosts.reduce((s, c) => s + c.amount, 0);
  const totalInvested = (Number(purchaseCost) || 0) + totalExtraCosts;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
          Add New Bundle
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Log a purchase. Add items now — sale costs are recorded per item when you mark it as sold.
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

        {/* Items defined upfront */}
        <DraftItemList
          items={draftItems}
          error={errors.items}
          onAdd={(item) => setDraftItems((prev) => [...prev, item])}
          onRemove={(tempId) => setDraftItems((prev) => prev.filter((i) => i.tempId !== tempId))}
        />

        {/* Purchase-side costs */}
        <DraftCostList
          costs={draftCosts}
          totalInvested={totalInvested}
          onAdd={(cost) => setDraftCosts((prev) => [...prev, cost])}
          onRemove={(tempId) => setDraftCosts((prev) => prev.filter((c) => c.tempId !== tempId))}
        />

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
