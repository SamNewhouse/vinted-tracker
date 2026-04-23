"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addItem } from "../../store/trackerSlice";
import Input from "../1-atoms/Input";
import Button from "../1-atoms/Button";

interface Props {
  bundleId: string;
  onClose: () => void;
}

const AddItemForm: FC<Props> = ({ bundleId, onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Item name is required" });
      return;
    }
    dispatch(
      addItem({
        bundleId,
        item: {
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          status: "unlisted",
          listedAt: undefined,
          soldAt: undefined,
          salePrice: undefined,
        },
      }),
    );
    onClose();
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 mt-4">
      <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white mb-4">
        Add Item
      </h3>
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
        <Input
          label="Notes (optional)"
          placeholder="Any private notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-2 pt-1">
          <Button type="submit" size="sm">
            Add Item
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default memo(AddItemForm);
