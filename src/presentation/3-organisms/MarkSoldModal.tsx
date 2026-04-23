"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { markItemStatus } from "../../store/trackerSlice";
import {
  calcBreakEvenPrice,
  calcItemProfit,
  calcMinSalePrice,
  calcTotalSaleCosts,
  formatCurrency,
} from "../../utils/finance";
import type { BundleItem, SaleCosts } from "../../types";
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

const EMPTY_SALE_COSTS: SaleCosts = { postageOut: 0, packaging: 0, platformFee: 0, otherCosts: 0 };

const MarkSoldModal: FC<Props> = ({ bundleId, item, onClose }) => {
  const dispatch = useAppDispatch();
  const [salePrice, setSalePrice] = useState(item.salePrice?.toFixed(2) ?? "");
  const [saleCosts, setSaleCosts] = useState<SaleCosts>(item.saleCosts ?? { ...EMPTY_SALE_COSTS });
  const [error, setError] = useState("");

  const setCost = (key: keyof SaleCosts, value: string) =>
    setSaleCosts((prev) => ({ ...prev, [key]: Number(value) || 0 }));

  const parsedSalePrice = Number(salePrice) || 0;
  const totalSaleCosts = calcTotalSaleCosts(saleCosts);
  const breakEven = calcBreakEvenPrice(item.allocatedCost, item.extraCostsShare);
  const minSale = calcMinSalePrice(item.allocatedCost, item.extraCostsShare);
  const netRevenue = parsedSalePrice - totalSaleCosts;
  const profit =
    parsedSalePrice > 0
      ? calcItemProfit(parsedSalePrice, item.allocatedCost, item.extraCostsShare, saleCosts)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salePrice || isNaN(Number(salePrice)) || Number(salePrice) <= 0) {
      setError("Enter the sale price");
      return;
    }
    dispatch(
      markItemStatus({
        bundleId,
        itemId: item.id,
        status: "sold",
        salePrice: Number(salePrice),
        saleCosts,
      }),
    );
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
              Sale Costs{" "}
              <span className="font-normal normal-case tracking-normal">
                (optional — deducted from profit)
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Postage out"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                prefix="£"
                value={saleCosts.postageOut || ""}
                onChange={(e) => setCost("postageOut", e.target.value)}
                hint="Shipping label cost"
              />
              <Input
                label="Packaging"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                prefix="£"
                value={saleCosts.packaging || ""}
                onChange={(e) => setCost("packaging", e.target.value)}
                hint="Box, bag, bubble wrap"
              />
              <Input
                label="Platform fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                prefix="£"
                value={saleCosts.platformFee || ""}
                onChange={(e) => setCost("platformFee", e.target.value)}
                hint="Vinted, eBay, Depop fee"
              />
              <Input
                label="Other"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                prefix="£"
                value={saleCosts.otherCosts || ""}
                onChange={(e) => setCost("otherCosts", e.target.value)}
                hint="Any other sale cost"
              />
            </div>
          </div>

          {parsedSalePrice > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-3 text-center">
                  <CostCell
                    label="Sale costs"
                    value={formatCurrency(totalSaleCosts)}
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
