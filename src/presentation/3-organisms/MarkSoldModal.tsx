"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { markItemSold } from "../../store/trackerSlice";
import { calcItemProfit, formatCurrency } from "../../utils/finance";
import type { Item, Cost, CostCategory } from "../../types";
import { COST_CATEGORIES } from "../../config/constants";
import { v4 as uuidv4 } from "uuid";
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
  id: string;
  category: CostCategory;
  label: string;
  amount: string; // string for controlled input, parsed on submit
};

const newDraftCost = (): DraftSaleCost => ({
  id: uuidv4(),
  category: "postage",
  label: "Postage",
  amount: "",
});

const MarkSoldModal: FC<Props> = ({ item, onClose }) => {
  const dispatch = useAppDispatch();
  const defaultSaleCosts = useAppSelector((s) => s.tracker.config.defaultSaleCosts) ?? [];

  const [salePrice, setSalePrice] = useState("");
  const [salePriceError, setSalePriceError] = useState("");
  const [draftCosts, setDraftCosts] = useState<DraftSaleCost[]>(() =>
    defaultSaleCosts.map((c) => ({
      id: uuidv4(),
      category: c.category,
      label: COST_CATEGORIES.find((cat) => cat.value === c.category)?.label ?? c.category,
      amount: c.amount > 0 ? String(c.amount) : "",
    })),
  );

  const parsedPrice = parseFloat(salePrice);

  const activeCosts = draftCosts
    .map((c) => ({ ...c, amount: parseFloat(c.amount) }))
    .filter((c) => !isNaN(c.amount) && c.amount > 0);

  const previewProfit =
    !isNaN(parsedPrice) && parsedPrice > 0
      ? calcItemProfit(
          parsedPrice,
          item.allocatedPurchaseCost,
          item.allocatedCostShare,
          activeCosts.map(
            ({ id, category, label, amount }): Cost => ({ id, category, label, amount }),
          ),
        )
      : null;

  const updateCost = (id: string, changes: Partial<DraftSaleCost>) =>
    setDraftCosts((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));

  const removeCost = (id: string) => setDraftCosts((prev) => prev.filter((c) => c.id !== id));

  const handleCategoryChange = (id: string, category: CostCategory) => {
    const found = COST_CATEGORIES.find((c) => c.value === category);
    updateCost(id, { category, label: found?.label ?? category });
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
        saleCosts: activeCosts.map(
          ({ id, category, label, amount }): Cost => ({
            id,
            category,
            label,
            amount,
          }),
        ),
      }),
    );
    onClose();
  };

  return (
    <Modal title={`Mark "${item.name}" as Sold`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
              No sale costs added - postage, platform fees, packaging, etc.
            </p>
          )}

          {draftCosts.map((cost) => (
            <div key={cost.id} className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={cost.category}
                  onChange={(e) => handleCategoryChange(cost.id, e.target.value as CostCategory)}
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
                  onChange={(e) => updateCost(cost.id, { amount: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeCost(cost.id)}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-lg leading-none pb-0.5"
                aria-label="Remove cost"
              >
                ×
              </button>
            </div>
          ))}
        </div>

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
