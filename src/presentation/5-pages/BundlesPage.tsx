"use client";
import { FC, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setView, setFilter, clearFilters } from "../../store/trackerSlice";
import type { SortField } from "../../types";
import Button from "../1-atoms/Button";
import Input from "../1-atoms/Input";
import PageHeader from "../1-atoms/PageHeader";
import Select from "../1-atoms/Select";
import BundleList from "../3-organisms/BundleList";

const SORT_OPTIONS = [
  { value: "date", label: "Sort: Date" },
  { value: "name", label: "Sort: Name" },
  { value: "spend", label: "Sort: Spend" },
];

const BundlesPage: FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.tracker.filters);
  const bundleCount = useAppSelector((s) => s.tracker.bundles.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bundles"
        subtitle={`${bundleCount} bundle${bundleCount !== 1 ? "s" : ""}`}
        actions={<Button onClick={() => dispatch(setView("add-bundle"))}>+ Add Bundle</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search bundles or items..."
            value={filters?.search}
            onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 items-end">
          <Select
            value={filters?.sortField}
            options={SORT_OPTIONS}
            onChange={(e) => dispatch(setFilter({ sortField: e.target.value as SortField }))}
          />
          <button
            onClick={() =>
              dispatch(
                setFilter({ sortDirection: filters?.sortDirection === "asc" ? "desc" : "asc" }),
              )
            }
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            {filters?.sortDirection === "asc" ? "↑" : "↓"}
          </button>
          {(filters?.search || filters?.sortField !== "date") && (
            <Button size="sm" variant="ghost" onClick={() => dispatch(clearFilters())}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <BundleList />
    </div>
  );
};

export default memo(BundlesPage);
