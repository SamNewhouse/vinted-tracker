"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { updateItem, markItemStatus } from "../../store/trackerSlice";
import type { Item, ItemStatus } from "../../types";
import Modal from "../1-atoms/Modal";
import Input from "../1-atoms/Input";
import Textarea from "../1-atoms/Textarea";
import Select from "../1-atoms/Select";
import Button from "../1-atoms/Button";

interface Props {
  item: Item;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "unlisted", label: "Unlisted" },
  { value: "listed", label: "Listed" },
  { value: "returned", label: "Returned" },
  { value: "unsellable", label: "Unsellable" },
];

const EditItemModal: FC<Props> = ({ item, onClose }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [status, setStatus] = useState<ItemStatus>(item.status === "sold" ? "sold" : item.status);
  const [marginPercent, setMarginPercent] = useState(String(item.targetMarginPercent));
  const [nameError, setNameError] = useState("");
  const [marginError, setMarginError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    const parsedMargin = parseFloat(marginPercent);
    if (isNaN(parsedMargin) || parsedMargin < 0 || parsedMargin > 100) {
      setMarginError("Enter a value between 0 and 100");
      return;
    }

    // updateItem handles name, description, notes, margin
    dispatch(
      updateItem({
        itemId: item.id,
        changes: {
          name: name.trim(),
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          targetMarginPercent: parsedMargin,
        },
      }),
    );

    // Status changes go through markItemStatus so recalculation fires correctly
    if (item.status !== "sold" && status !== item.status) {
      dispatch(markItemStatus({ itemId: item.id, status }));
    }

    onClose();
  };

  return (
    <Modal title="Edit Item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError("");
          }}
          error={nameError}
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Target Margin"
              type="number"
              min="0"
              max="100"
              step="1"
              suffix="%"
              value={marginPercent}
              onChange={(e) => {
                setMarginPercent(e.target.value);
                setMarginError("");
              }}
              error={marginError}
              hint="Overrides the global default for this item"
            />
          </div>
        </div>

        {item.status !== "sold" && (
          <Select
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(e) => setStatus(e.target.value as ItemStatus)}
          />
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" fullWidth>
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default memo(EditItemModal);
