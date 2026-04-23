"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectActiveBundle, selectBundleSummary } from "../../store/selectors";
import { deleteItem, deleteExtraCost, setView } from "../../store/trackerSlice";
import { formatCurrency, formatPercent } from "../../utils/finance";
import type { BundleItem, ExtraCost } from "../../types";
import Button from "../1-atoms/Button";
import Badge from "../1-atoms/Badge";
import ItemRow from "../2-molecules/ItemRow";
import ExtraCostRow from "../2-molecules/ExtraCostRow";
import AddItemForm from "../3-organisms/AddItemForm";
import AddExtraCostForm from "../3-organisms/AddExtraCostForm";
import MarkSoldModal from "../3-organisms/MarkSoldModal";

const BundleDetailPage: FC = () => {
  const dispatch = useAppDispatch();
  const bundle = useAppSelector(selectActiveBundle);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCost, setShowAddCost] = useState(false);
  const [soldItem, setSoldItem] = useState<BundleItem | null>(null);

  if (!bundle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-3">🔍</span>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Bundle not found.</p>
        <Button onClick={() => dispatch(setView("bundles"))}>Back to Bundles</Button>
      </div>
    );
  }

  const summary = selectBundleSummary(bundle);
  const totalExtraCosts = bundle.extraCosts.reduce((s: number, c: ExtraCost) => s + c.amount, 0);

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
        {(
          [
            {
              label: "Purchase Cost",
              value: formatCurrency(bundle.purchaseCost),
              colour: undefined,
              sub: undefined,
            },
            {
              label: "Extra Costs",
              value: formatCurrency(totalExtraCosts),
              colour: undefined,
              sub: undefined,
            },
            {
              label: "Total Invested",
              value: formatCurrency(summary.totalInvested),
              colour: undefined,
              sub: undefined,
            },
            {
              label: "Net P&L",
              value: formatCurrency(summary.totalProfit),
              colour:
                summary.totalProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              sub:
                summary.totalInvested > 0
                  ? formatPercent(summary.profitMargin, true) + " margin"
                  : undefined,
            },
          ] satisfies {
            label: string;
            value: string;
            colour: string | undefined;
            sub: string | undefined;
          }[]
        ).map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p
              className={`text-lg font-bold tabular-nums font-heading ${s.colour ?? "text-slate-900 dark:text-white"}`}
            >
              {s.value}
            </p>
            {s.sub && <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Items section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-heading font-semibold text-slate-900 dark:text-white">Items</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {summary.soldItemCount}/{bundle.items.length} sold · Min. sale price = cost ÷ items +
              extras + 15% margin
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowAddItem(true);
              setShowAddCost(false);
            }}
          >
            + Add Item
          </Button>
        </div>

        <div className="px-5">
          {bundle.items.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
              No items yet. Add items to start splitting costs.
            </div>
          ) : (
            bundle.items.map((item: BundleItem) => (
              <ItemRow
                key={item.id}
                item={item}
                onMarkSold={(id: string) => {
                  const found = bundle.items.find((i: BundleItem) => i.id === id);
                  if (found) setSoldItem(found);
                }}
                onEdit={() => {}}
                onDelete={(id: string) => dispatch(deleteItem({ bundleId: bundle.id, itemId: id }))}
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

      {/* Extra costs section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-heading font-semibold text-slate-900 dark:text-white">
              Extra Costs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Postage, car boot entry fees, packaging etc — split equally across all items
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowAddCost(true);
              setShowAddItem(false);
            }}
          >
            + Add Cost
          </Button>
        </div>

        <div className="px-5">
          {bundle.extraCosts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
              No extra costs yet.
            </div>
          ) : (
            bundle.extraCosts.map((cost: ExtraCost) => (
              <ExtraCostRow
                key={cost.id}
                cost={cost}
                onDelete={(id: string) =>
                  dispatch(deleteExtraCost({ bundleId: bundle.id, costId: id }))
                }
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

      {bundle.notes && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Notes
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{bundle.notes}</p>
        </div>
      )}

      {soldItem && (
        <MarkSoldModal bundleId={bundle.id} item={soldItem} onClose={() => setSoldItem(null)} />
      )}
    </div>
  );
};

export default memo(BundleDetailPage);
