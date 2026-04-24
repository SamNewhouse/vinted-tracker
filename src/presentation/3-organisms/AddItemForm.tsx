"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addItem, addStandaloneItem, setView } from "../../store/trackerSlice";
import type { Cost, Source } from "../../types";
import Input from "../1-atoms/Input";
import Button from "../1-atoms/Button";
import Select from "../1-atoms/Select";
import DraftCostList from "../2-molecules/DraftCostList";
import { SOURCES } from "../../config/constants";

interface BundleProps {
  bundleId: string;
  onClose: () => void;
}

interface StandaloneProps {
  bundleId?: undefined;
  onClose?: never;
}

type Props = BundleProps | StandaloneProps;

const AddItemForm: FC<Props> = ({ bundleId, onClose }) => {
  const dispatch = useAppDispatch();
  const isStandalone = bundleId === undefined;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<Source>("vinted");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Item name is required";
    if (isStandalone && (!purchaseCost || isNaN(Number(purchaseCost)) || Number(purchaseCost) < 0))
      errs.purchaseCost = "Enter a valid purchase cost";
    if (isStandalone && !purchaseDate) errs.purchaseDate = "Purchase date is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (isStandalone) {
      dispatch(
        addStandaloneItem({
          name: name.trim(),
          source,
          purchaseDate,
          purchaseCost: Number(purchaseCost),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          costs,
        }),
      );
      dispatch(setView("items"));
    } else {
      dispatch(
        addItem({
          bundleId,
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      );
      onClose();
    }
  };

  const totalExtraCosts = costs.reduce((s, c) => s + c.amount, 0);
  const totalInvested = (Number(purchaseCost) || 0) + totalExtraCosts;

  return (
    <div
      className={
        isStandalone
          ? "max-w-2xl mx-auto"
          : "rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 mt-4"
      }
    >
      {isStandalone ? (
        <div className="mb-6">
          <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
            Add Standalone Item
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log a single item purchased on its own, not as part of a bundle.
          </p>
        </div>
      ) : (
        <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white mb-4">
          Add Item
        </h3>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
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

        {isStandalone && (
          <>
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
          </>
        )}

        <Input
          label="Notes (optional)"
          placeholder="Any private notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-2 pt-1">
          <Button type="submit" size={isStandalone ? "md" : "sm"} fullWidth={isStandalone}>
            Add Item
          </Button>
          <Button
            type="button"
            size={isStandalone ? "md" : "sm"}
            variant="ghost"
            onClick={isStandalone ? () => dispatch(setView("items")) : onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default memo(AddItemForm);
