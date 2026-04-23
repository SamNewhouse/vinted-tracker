"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { markItemStatus, addExtraCost } from "../../store/trackerSlice";
import {
  calcBreakEvenPrice,
  calcItemProfit,
  calcMinSalePrice,
  calcTotalAdditionalCosts,
  formatCurrency,
} from "../../utils/finance";
import type { BundleItem, ExtraCost, ExtraCostCategory } from "../../types";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import CostCell from "../1-atoms/CostCell";
import ProfitValue from "../1-atoms/ProfitValue";
import Modal from "../1-atoms/Modal";

interface Props {
  bundleId: string;
  item: BundleItem;
  onClose: () => void;
}

const DEFAULT_COST_ROWS: Array<{ key: ExtraCostCategory; label: string; hint: string }> = [
  { key: "postage", label: "Postage out", hint: "Shipping label cost" },
  { key: "packaging", label: "Packaging", hint: "Box, bag, bubble wrap" },
  { key: "platform_fee", label: "Platform fee", hint: "Vinted, eBay, Depop fee" },
  { key: "other", label: "Other", hint: "Any other sale cost" },
];

function buildInitialCosts(existingCosts: ExtraCost[], itemId: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of DEFAULT_COST_ROWS) {
    const found = existingCosts.find(
      (c) => c.timing === "sale" && c.category === row.key && c.itemId === itemId,
    );
    map[row.key] = found ? found.amount.toFixed(2) : "";
  }
  return map;
}

// Builds a preview list for the profit calculation — not dispatched directly
function costMapToPreview(map: Record<string, string>): Array<{ amount: number }> {
  return DEFAULT_COST_ROWS.map((row) => ({ amount: Number(map[row.key]) || 0 })).filter(
    (c) => c.amount > 0,
  );
}

interface MarkSoldModalProps extends Props {
  /** All extra costs already on the bundle — needed to pre-fill existing sale costs */
  bundleExtraCosts: ExtraCost[];
}

const MarkSoldModal: FC<MarkSoldModalProps> = ({ bundleId, item, bundleExtraCosts, onClose }) => {
  const dispatch = useAppDispatch();
  const [salePrice, setSalePrice] = useState(item.salePrice?.toFixed(2) ?? "");
  const [costMap, setCostMap] = useState<Record<string, string>>(
    buildInitialCosts(bundleExtraCosts, item.id),
  );
  const [error, setError] = useState("");

  const setCost = (key: string, value: string) => setCostMap((prev) => ({ ...prev, [key]: value }));

  const costPreview = costMapToPreview(costMap);
  const parsedSalePrice = Number(salePrice) || 0;
  const totalAdditionalCosts = calcTotalAdditionalCosts(costPreview);
  const breakEven = calcBreakEvenPrice(item.allocatedCost, item.extraCostsShare);
  const minSale = calcMinSalePrice(item.allocatedCost, item.extraCostsShare);
  const netRevenue = parsedSalePrice - totalAdditionalCosts;
  const profit =
    parsedSalePrice > 0
      ? calcItemProfit(parsedSalePrice, item.allocatedCost, item.extraCostsShare, costPreview)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salePrice || isNaN(Number(salePrice)) || Number(salePrice) <= 0) {
      setError("Enter the sale price");
      return;
    }

    // 1. Mark the item as sold with just the sale price
    dispatch(
      markItemStatus({
        bundleId,
        itemId: item.id,
        status: "sold",
        salePrice: Number(salePrice),
      }),
    );

    // 2. Dispatch each non-zero sale cost as a proper ExtraCost on the bundle
    for (const row of DEFAULT_COST_ROWS) {
      const amount = Number(costMap[row.key]) || 0;
      if (amount > 0) {
        dispatch(
          addExtraCost({
            bundleId,
            cost: {
              label: row.label,
              category: row.key,
              timing: "sale",
              amount,
              itemId: item.id, // pinned to this item, not split
            },
          }),
        );
      }
    }

    onClose();
  };

  return (
    <Modal title="Mark as Sold" subtitle={item.name} onClose={onClose}>
      {/* Item cost reference strip */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-3 gap-3 text-center">
          <CostCell
            label="Item cost"
            value={formatCurrency(item.allocatedCost + item.extraCostsShare)}
            colour="muted"
          />
          <CostCell label="Break-even" value={formatCurrency(breakEven)} colour="muted" />
          <CostCell label="Min. sale (+15%)" value={formatCurrency(minSale)} colour="warning" />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5 space-y-5">
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
              setError("");
            }}
            error={error}
            hint="The price the buyer paid on Vinted / eBay etc."
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Additional Costs{" "}
              <span className="font-normal normal-case tracking-normal">
                (optional — deducted from profit)
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_COST_ROWS.map((row) => (
                <Input
                  key={row.key}
                  label={row.label}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  prefix="£"
                  value={costMap[row.key]}
                  onChange={(e) => setCost(row.key, e.target.value)}
                  hint={row.hint}
                />
              ))}
            </div>
          </div>

          {parsedSalePrice > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-3 text-center">
                  <CostCell
                    label="Additional costs"
                    value={formatCurrency(totalAdditionalCosts)}
                    colour="muted"
                  />
                </div>
                <div className="px-4 py-3 text-center">
                  <CostCell label="Net revenue" value={formatCurrency(netRevenue)} />
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Profit</p>
                  {profit !== null ? (
                    <ProfitValue value={profit} size="base" />
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
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
