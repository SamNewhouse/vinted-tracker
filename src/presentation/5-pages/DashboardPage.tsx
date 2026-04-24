"use client";
import { FC, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setView } from "../../store/trackerSlice";
import Button from "../1-atoms/Button";
import EmptyState from "../1-atoms/EmptyState";
import PageHeader from "../1-atoms/PageHeader";
import BundleList from "../3-organisms/BundleList";
import DashboardStatsOrganism from "../3-organisms/DashboardStats";

const DashboardPage: FC = () => {
  const dispatch = useAppDispatch();
  const bundleCount = useAppSelector((s) => s.tracker.bundles.length);
  const itemCount = useAppSelector((s) => s.tracker.items.length);
  const hasData = bundleCount > 0 || itemCount > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle="Your reselling finance summary"
        actions={
          <>
            <Button variant="secondary" onClick={() => dispatch(setView("add-item"))}>
              + Add Item
            </Button>
            <Button onClick={() => dispatch(setView("add-bundle"))}>+ Add Bundle</Button>
          </>
        }
      />

      {hasData ? (
        <>
          <DashboardStatsOrganism />
          {bundleCount > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
                  Recent Bundles
                </h2>
                <button
                  onClick={() => dispatch(setView("bundles"))}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  View all →
                </button>
              </div>
              <BundleList />
            </>
          )}
        </>
      ) : (
        <EmptyState
          icon="🛍️"
          title="Start tracking your reselling"
          description="Log a bundle to split costs across multiple items, or add a single item you bought on its own."
          action={
            <div className="flex gap-3">
              <Button onClick={() => dispatch(setView("add-bundle"))}>+ Add Bundle</Button>
              <Button variant="secondary" onClick={() => dispatch(setView("add-item"))}>
                + Add Item
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
};

export default memo(DashboardPage);
