"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectActiveBundle, selectActiveBundleItems, selectBundleSummary } from "../../store/selectors";
import { deleteItem, deleteBundleExtraCost, setView } from "../../store/trackerSlice";
import { formatCurrency, formatPercent } from "../../utils/finance";
import type { Item, BundleExtraCost } from "../../types";
import Button from "../1-atoms/Button";
import Badge from "../1-atoms/Badge";
import CostCell from "../1-atoms/CostCell";
import ProfitValue from "../1-atoms/ProfitValue";
import SectionHeader from "../1-atoms/SectionHeader";
import EmptyState from "../1-atoms/EmptyState";
import ItemRow from "../2-molecules/ItemRow";
import ExtraCostRow from "../2-molecules/ExtraCostRow";
import AddItemForm from "../3-organisms/AddItemForm";
import AddExtraCostForm from "../3-organisms/AddExtraCostForm";
import MarkSoldModal from "../3-organisms/MarkSoldModal";

const BundleDetailPage: FC = () => {
  const dispatch = useAppDispatch();
  const bundle = useAppSelector(selectActiveBundle);
  const items = useAppSelector(selectActiveBundleItems);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCost, setShowAddCost] = useState(false);
  const [soldItem, setSoldItem] = useState<Item | null>(null);

  if (!bundle) {
    return (
      <EmptyState
        icon="🔍"
        title="Bundle not found"
        description="This bundle may have been deleted."
        action={<Button onClick={() => dispatch(setView("bundles"))}>Back to Bundles</Button>}
      />
    );
  }

  const allItems = useAppSelector((state) => state.tracker.items);
  const summary = selectBundleSummary(bundle, allItems);

  const totalExtraCosts = bundle.extraCosts.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => dispatch(setView("bundles"))}
          className="mt-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-lg leading-none"
          aria-label="Back"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
              {bundle.name}
            </h1>
            <Badge
              label={summary.isProfitable ? "Profit" : summary.isBreakEven ? "Break-even" : "Loss"}
              status={summary.isProfitable ? "profit" : summary.isBreakEven ? "neutral" : "loss"}
              size="md"
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {bundle.source} · {new Date(bundle.purchaseDate).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <CostCell label="Purchase Cost" value={formatCurrency(bundle.purchaseCost)} />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <CostCell label="Extra Costs" value={formatCurrency(totalExtraCosts)} />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <CostCell label="Total Invested" value={formatCurrency(summary.totalInvested)} />
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Net P&L
          </p>
          <ProfitValue value={summary.totalProfit} size="lg" />
          {summary.totalInvested > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {formatPercent(summary.profitMargin, true)} margin
            </p>
          )}
        </div>
      </div>

      {/* Items section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <SectionHeader
          title="Items"
          subtitle={`${summary.soldItemCount}/${summary.itemCount} sold · Min. sale = cost + 15% margin`}
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { setShowAddItem(true); setShowAddCost(false); }}
            >
              + Add Item
            </Button>
          }
        />

        <div className="px-5">
          {items.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
              No items yet. Add items to start splitting costs.
            </div>
          ) : (
            items.map((item: Item) => (
              <ItemRow
                key={item.id}
                item={item}
                onMarkSold={(id) => {
                  const found = items.find((i) => i.id === id);
                  if (found) setSoldItem(found);
                }}
                onEdit={() => {}}
                onDelete={(id) => dispatch(deleteItem(id))}
              />
            ))
          )}
        </div>

        {showAddItem && (
          <div className="px-5 pb-5">
            <AddItemForm bundleId={bundle.id} onClose={() => setShowAddItem(false)} />
          </div>
        )}
      </div>

      {/* Purchase extra costs section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <SectionHeader
          title="Purchase Costs"
          subtitle="Car boot entry, inbound postage, repair, cleaning etc — split equally across all items"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { setShowAddCost(true); setShowAddItem(false); }}
            >
              + Add Cost
            </Button>
          }
        />

        <div className="px-5">
          {bundle.extraCosts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
              No purchase costs yet.
            </div>
          ) : (
            bundle.extraCosts.map((cost: BundleExtraCost) => (
              <ExtraCostRow
                key={cost.id}
                cost={cost}
                onDelete={(id) => dispatch(deleteBundleExtraCost({ bundleId: bundle.id, costId: id }))}
              />
            ))
          )}
        </div>

        {showAddCost && (
          <div className="px-5 pb-5">
            <AddExtraCostForm bundleId={bundle.id} onClose={() => setShowAddCost(false)} />
          </div>
        )}
      </div>

      {/* Notes */}
      {bundle.notes && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Notes
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{bundle.notes}</p>
        </div>
      )}

      {soldItem && (
        <MarkSoldModal item={soldItem} onClose={() => setSoldItem(null)} />
      )}
    </div>
  );
};

export default memo(BundleDetailPage);
