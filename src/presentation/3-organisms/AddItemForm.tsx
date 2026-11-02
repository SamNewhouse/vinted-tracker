"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addBundle, addBundleItems, setActiveBundleId, setView } from "../../store/trackerSlice";
import { v4 as uuidv4 } from "uuid";
import type { Cost, DraftItem, Source } from "../../types";
import Input from "../1-atoms/Input";
import Button from "../1-atoms/Button";
import Select from "../1-atoms/Select";
import DraftCostList from "../2-molecules/DraftCostList";
import DraftItemList from "../2-molecules/DraftItemList";
import { SOURCES } from "../../config/constants";

interface Props {
  /** Add one or more items to this bundle, or one single item (its own purchase) when null. */
  bundleId: string | null;
}

const AddItemForm: FC<Props> = ({ bundleId }) => {
  const dispatch = useAppDispatch();

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<Source>("vinted");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goBack = () => {
    if (bundleId) {
      dispatch(setActiveBundleId(bundleId));
      dispatch(setView("bundle-detail"));
    } else {
      dispatch(setView("items"));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (bundleId) {
      if (draftItems.length === 0) {
        setErrors({ items: "Add at least one item" });
        return;
      }
      dispatch(addBundleItems({ bundleId, draftItems }));
      goBack();
      return;
    }

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Item name is required";
    if (!purchaseCost || isNaN(Number(purchaseCost)) || Number(purchaseCost) < 0)
      errs.purchaseCost = "Enter a valid purchase cost";
    if (!purchaseDate) errs.purchaseDate = "Purchase date is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // A single item is a purchase of one.
    dispatch(
      addBundle({
        bundle: {
          kind: "single",
          name: name.trim(),
          source,
          purchaseDate,
          purchaseCost: Number(purchaseCost),
          costs,
        },
        draftItems: [
          {
            id: uuidv4(),
            name: name.trim(),
            description: description.trim() || undefined,
            notes: notes.trim() || undefined,
          },
        ],
      }),
    );
    goBack();
  };

  const totalInvested = (Number(purchaseCost) || 0) + costs.reduce((s, c) => s + c.amount, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {bundleId ? (
        <DraftItemList
          items={draftItems}
          error={errors.items}
          onAdd={(item) => {
            setDraftItems((prev) => [...prev, item]);
            setErrors({});
          }}
          onRemove={(id) => setDraftItems((prev) => prev.filter((i) => i.id !== id))}
        />
      ) : (
        <>
          <Input
            label="Item Name"
            placeholder="e.g. Nike Air Max 90 – Size 10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Description (optional)"
            placeholder="Colour, condition, brand..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
            options={SOURCES}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Purchase Cost"
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
          <DraftCostList
            costs={costs}
            totalInvested={totalInvested}
            onAdd={(cost) => setCosts((prev) => [...prev, cost])}
            onRemove={(id) => setCosts((prev) => prev.filter((c) => c.id !== id))}
          />
          <Input
            label="Notes (optional)"
            placeholder="Any private notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" fullWidth>
          {bundleId
            ? draftItems.length > 0
              ? `Add ${draftItems.length} item${draftItems.length === 1 ? "" : "s"} to bundle`
              : "Add items to bundle"
            : "Add Item"}
        </Button>
        <Button type="button" variant="ghost" onClick={goBack}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default memo(AddItemForm);
