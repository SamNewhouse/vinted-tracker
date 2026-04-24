"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectFilteredItems } from "../../store/selectors";
import {
  setFilter,
  clearFilters,
  setView,
  setActiveBundleId,
  deleteItem,
} from "../../store/trackerSlice";
import EmptyState from "../1-atoms/EmptyState";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import PageHeader from "../1-atoms/PageHeader";
import Select from "../1-atoms/Select";
import ItemRow from "../2-molecules/ItemRow";
import type { Item, ItemStatus, SortDirection, SortField } from "../../types";
import MarkSoldModal from "../3-organisms/MarkSoldModal";
import EditItemModal from "../3-organisms/EditItemModal";

const ItemsPage: FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectFilteredItems);
  const filters = useAppSelector((s) => s.tracker.filters);
  const bundles = useAppSelector((s) => s.tracker.bundles);
  const allItems = useAppSelector((s) => s.tracker.items);

  const hasStandalone = allItems.some((i) => !i.bundleId);

  const [soldItem, setSoldItem] = useState<Item | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Items"
        subtitle={`${allItems.length} item${allItems.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => dispatch(setView("add-item"))}>
              + Add Item
            </Button>
            <Button variant="ghost" onClick={() => dispatch(clearFilters())}>
              Clear filters
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3 justify-between">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
          />
        </div>
        <Select
          value={filters.status}
          onChange={(e) => dispatch(setFilter({ status: e.target.value as ItemStatus | "all" }))}
          options={[
            { value: "all", label: "All statuses" },
            { value: "unlisted", label: "Unlisted" },
            { value: "listed", label: "Listed" },
            { value: "sold", label: "Sold" },
            { value: "returned", label: "Returned" },
            { value: "unsellable", label: "Unsellable" },
          ]}
        />
        <Select
          value={filters.bundleId}
          onChange={(e) => dispatch(setFilter({ bundleId: e.target.value }))}
          options={[
            { value: "all", label: "All items" },
            ...(hasStandalone ? [{ value: "standalone", label: "Standalone" }] : []),
            ...bundles.map((b) => ({ value: b.id, label: b.name })),
          ]}
        />
        <Select
          value={filters.sortField}
          onChange={(e) => dispatch(setFilter({ sortField: e.target.value as SortField }))}
          options={[
            { value: "date", label: "Sort: Date" },
            { value: "name", label: "Sort: Name" },
            { value: "profit", label: "Sort: Profit" },
          ]}
        />
        <Select
          value={filters.sortDirection}
          onChange={(e) => dispatch(setFilter({ sortDirection: e.target.value as SortDirection }))}
          options={[
            { value: "desc", label: "↓ Desc" },
            { value: "asc", label: "↑ Asc" },
          ]}
        />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 dark:border-slate-800">
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Item
          </span>
          <div className="flex gap-4 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 w-20 text-right">
              Min Sale
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 w-20 text-right">
              Profit
            </span>
          </div>
          <div className="w-full md:w-[136px]" />
        </div>

        <div className="px-5">
          {items.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No items found"
              description="Try adjusting your filters, or add a standalone item or bundle."
              action={
                <Button size="sm" onClick={() => dispatch(setView("add-item"))}>
                  + Add Item
                </Button>
              }
            />
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                isOnly={items.length === 1}
                showBundle
                onMarkSold={setSoldItem}
                onEdit={setEditItem}
                onDelete={(id) => dispatch(deleteItem(id))}
                onBundleClick={(bundleId) => {
                  dispatch(setActiveBundleId(bundleId));
                  dispatch(setView("bundle-detail"));
                }}
              />
            ))
          )}
        </div>
      </div>

      {soldItem && <MarkSoldModal item={soldItem} onClose={() => setSoldItem(null)} />}
      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} />}
    </div>
  );
};

export default memo(ItemsPage);
