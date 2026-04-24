"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { markItemSold } from "../../store/trackerSlice";
import { calcItemProfit, formatCurrency } from "../../utils/finance";
import type { Item, CostCategory } from "../../types";
import { COST_CATEGORIES } from "../../config/constants";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import Select from "../1-atoms/Select";
import ValueCell from "../1-atoms/ValueCell";
import ProfitValue from "../1-atoms/ProfitValue";
import Modal from "../1-atoms/Modal";

interface Props {
  item: Item;
  onClose: () => void;
}

type DraftSaleCost = {
  tempId: string;
  category: CostCategory;
  label: string;
  amount: string;
};

const newDraftCost = (): DraftSaleCost => ({
  tempId: crypto.randomUUID(),
  category: "postage",
  label: "Postage Out",
  amount: "",
});

const MarkSoldModal: FC<Props> = ({ item, onClose }) => {
  const dispatch = useAppDispatch();
  const [salePrice, setSalePrice] = useState("");
  const [salePriceError, setSalePriceError] = useState("");
  const [draftCosts, setDraftCosts] = useState<DraftSaleCost[]>([]);

  const parsedPrice = parseFloat(salePrice);

  // Only costs with a valid positive amount contribute to the preview/submit
  const activeCosts = draftCosts
    .map((c) => ({ ...c, amount: parseFloat(c.amount) }))
    .filter((c) => !isNaN(c.amount) && c.amount > 0);

  const previewProfit =
    !isNaN(parsedPrice) && parsedPrice > 0
      ? calcItemProfit(
          parsedPrice,
          item.allocatedPurchaseCost,
          item.allocatedExtraCostShare,
          activeCosts.map(({ category, label, amount }) => ({
            id: "",
            category,
            label,
            amount,
          })),
        )
      : null;

  const updateCost = (tempId: string, changes: Partial<DraftSaleCost>) =>
    setDraftCosts((prev) => prev.map((c) => (c.tempId === tempId ? { ...c, ...changes } : c)));

  const removeCost = (tempId: string) =>
    setDraftCosts((prev) => prev.filter((c) => c.tempId !== tempId));

  const handleCategoryChange = (tempId: string, category: CostCategory) => {
    const found = COST_CATEGORIES.find((c) => c.value === category);
    updateCost(tempId, {
      category,
      label: found?.label ?? category,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salePrice || isNaN(parsedPrice) || parsedPrice <= 0) {
      setSalePriceError("Enter a valid sale price");
      return;
    }
    dispatch(
      markItemSold({
        itemId: item.id,
        salePrice: parsedPrice,
        saleCosts: activeCosts.map(({ category, label, amount }) => ({
          category,
          label,
          amount,
        })),
      }),
    );
    onClose();
  };

  return (
    <Modal title={`Mark "${item.name}" as Sold`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reference pricing */}
        <div className="grid grid-cols-2 gap-3">
          <ValueCell
            label="Break-even"
            value={formatCurrency(item.breakEvenPrice)}
            colour="muted"
          />
          <ValueCell
            label={`Min. sale (${item.targetMarginPercent}%)`}
            value={formatCurrency(item.minSalePrice)}
            colour="warning"
          />
        </div>

        {/* Sale price */}
        <Input
          label="Sale Price"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          prefix="£"
          value={salePrice}
          onChange={(e) => {
            setSalePrice(e.target.value);
            setSalePriceError("");
          }}
          error={salePriceError}
        />

        {/* Sale costs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sale Costs
            </p>
            <button
              type="button"
              onClick={() => setDraftCosts((prev) => [...prev, newDraftCost()])}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              + Add cost
            </button>
          </div>

          {draftCosts.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
              No sale costs added — postage, platform fees, packaging, etc.
            </p>
          )}

          {draftCosts.map((cost) => (
            <div key={cost.tempId} className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={cost.category}
                  onChange={(e) =>
                    handleCategoryChange(cost.tempId, e.target.value as CostCategory)
                  }
                  options={COST_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                />
              </div>
              <div className="w-28 shrink-0">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  prefix="£"
                  value={cost.amount}
                  onChange={(e) => updateCost(cost.tempId, { amount: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeCost(cost.tempId)}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-lg leading-none pb-0.5"
                aria-label="Remove cost"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Profit preview */}
        {previewProfit !== null && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Net profit</span>
            <ProfitValue value={previewProfit} />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" fullWidth>
            Confirm Sale
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default memo(MarkSoldModal);
