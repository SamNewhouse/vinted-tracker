"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { openAdd, setActiveBundleId, setView } from "../../store/trackerSlice";
import type { AddTab } from "../../types";
import Tabs from "../1-atoms/Tabs";
import Select from "../1-atoms/Select";
import EmptyState from "../1-atoms/EmptyState";
import Button from "../1-atoms/Button";
import AddItemForm from "../3-organisms/AddItemForm";
import AddBundleForm from "../3-organisms/AddBundleForm";
import AddExtraCostForm from "../3-organisms/AddCostForm";
import ImportListingsForm from "../3-organisms/ImportListingsForm";

const TABS: { id: AddTab; label: string; hint: string }[] = [
  {
    id: "single",
    label: "Single item",
    hint: "One thing bought on its own, for its own price.",
  },
  {
    id: "bundle",
    label: "Bundle",
    hint: "Several things bought together for one price. The price is split across them, and each becomes its own item.",
  },
  {
    id: "expense",
    label: "Expense",
    hint: "An extra cost on a purchase, such as entry, travel, postage or cleaning. On a bundle it's split across the unsold items.",
  },
  {
    id: "import",
    label: "Import",
    hint: "Add many listings at once from a marketplace page. Vinted for now.",
  },
];

const NEW_BUNDLE = "";

const isAddTab = (id: string): id is AddTab => TABS.some((t) => t.id === id);

const AddPage: FC = () => {
  const dispatch = useAppDispatch();
  const target = useAppSelector((s) => s.tracker.addTarget);
  const purchases = useAppSelector((s) => s.tracker.bundles);

  const current = TABS.find((t) => t.id === target.tab) ?? TABS[0];
  const [purchaseId, setPurchaseId] = useState(target.bundleId ?? "");

  const bundles = purchases.filter((b) => b.kind === "bundle");
  const chosenBundle = bundles.find((b) => b.id === purchaseId)?.id ?? NEW_BUNDLE;
  // An expense can go on any purchase; fall back to the first one if none is chosen.
  const expensePurchase = purchases.find((p) => p.id === purchaseId) ?? purchases[0];

  const goToPurchase = (id: string) => {
    const purchase = purchases.find((p) => p.id === id);
    if (purchase?.kind === "bundle") {
      dispatch(setActiveBundleId(id));
      dispatch(setView("bundle-detail"));
    } else {
      dispatch(setView("items"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 space-y-4">
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">Add</h2>
        <Tabs
          label="What to add"
          tabs={TABS}
          active={current.id}
          onChange={(id) => {
            if (isAddTab(id)) dispatch(openAdd({ tab: id, bundleId: purchaseId || undefined }));
          }}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">{current.hint}</p>
      </div>

      <div
        id={`panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${current.id}`}
        className="space-y-4"
      >
        {current.id === "single" && <AddItemForm bundleId={null} />}

        {current.id === "bundle" && (
          <>
            {bundles.length > 0 && (
              <Select
                label="Bundle"
                value={chosenBundle}
                onChange={(e) => setPurchaseId(e.target.value)}
                options={[
                  { value: NEW_BUNDLE, label: "New bundle" },
                  ...bundles.map((b) => ({ value: b.id, label: `Add items to: ${b.name}` })),
                ]}
              />
            )}
            {chosenBundle === NEW_BUNDLE ? (
              <AddBundleForm />
            ) : (
              <AddItemForm key={chosenBundle} bundleId={chosenBundle} />
            )}
          </>
        )}

        {current.id === "expense" &&
          (!expensePurchase ? (
            <EmptyState
              icon="◻"
              title="Nothing bought yet"
              description="Expenses belong to a purchase. Add a single item or a bundle first."
              action={
                <Button onClick={() => dispatch(openAdd({ tab: "bundle" }))}>+ Add Bundle</Button>
              }
            />
          ) : (
            <>
              <Select
                label="Purchase"
                value={expensePurchase.id}
                onChange={(e) => setPurchaseId(e.target.value)}
                options={purchases.map((p) => ({
                  value: p.id,
                  label: p.kind === "single" ? `${p.name} (single item)` : p.name,
                }))}
              />
              <AddExtraCostForm
                key={expensePurchase.id}
                bundleId={expensePurchase.id}
                onClose={() => goToPurchase(expensePurchase.id)}
              />
            </>
          ))}

        {current.id === "import" && <ImportListingsForm />}
      </div>
    </div>
  );
};

export default memo(AddPage);
