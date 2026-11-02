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

const TABS: { id: AddTab; label: string; hint: string }[] = [
  {
    id: "item",
    label: "Item",
    hint: "Add a single item bought on its own, or add one or more items to a bundle.",
  },
  {
    id: "bundle",
    label: "Bundle",
    hint: "Log a purchase of several items. Sale costs are recorded per item when you mark it as sold.",
  },
  {
    id: "expense",
    label: "Expense",
    hint: "Add a cost to a bundle, such as entry, travel or cleaning. It's split across the bundle's unsold items.",
  },
];

const isAddTab = (id: string): id is AddTab => TABS.some((t) => t.id === id);

const AddPage: FC = () => {
  const dispatch = useAppDispatch();
  const target = useAppSelector((s) => s.tracker.addTarget);
  const bundles = useAppSelector((s) => s.tracker.bundles);

  const tab = target.tab;
  const [bundleId, setBundleId] = useState(target.bundleId ?? "");
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];

  const bundleOptions = bundles.map((b) => ({ value: b.id, label: b.name }));
  // The expense tab needs a bundle; fall back to the first one if none is chosen.
  const expenseBundleId = bundleId || bundles[0]?.id || "";

  const backToBundle = (id: string) => {
    dispatch(setActiveBundleId(id));
    dispatch(setView("bundle-detail"));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 space-y-4">
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">Add</h2>
        <Tabs
          label="What to add"
          tabs={TABS}
          active={tab}
          onChange={(id) => {
            if (isAddTab(id)) dispatch(openAdd({ tab: id, bundleId: bundleId || undefined }));
          }}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">{current.hint}</p>
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-4">
        {tab === "item" && (
          <>
            <Select
              label="Bundle"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
              options={[{ value: "", label: "No bundle (standalone item)" }, ...bundleOptions]}
            />
            <AddItemForm key={bundleId || "standalone"} bundleId={bundleId || null} />
          </>
        )}

        {tab === "bundle" && <AddBundleForm />}

        {tab === "expense" &&
          (bundles.length === 0 ? (
            <EmptyState
              icon="◻"
              title="No bundles yet"
              description="Expenses belong to a bundle. Add a bundle first."
              action={
                <Button onClick={() => dispatch(openAdd({ tab: "bundle" }))}>+ Add Bundle</Button>
              }
            />
          ) : (
            <>
              <Select
                label="Bundle"
                value={expenseBundleId}
                onChange={(e) => setBundleId(e.target.value)}
                options={bundleOptions}
              />
              <AddExtraCostForm
                key={expenseBundleId}
                bundleId={expenseBundleId}
                onClose={() => backToBundle(expenseBundleId)}
              />
            </>
          ))}
      </div>
    </div>
  );
};

export default memo(AddPage);
