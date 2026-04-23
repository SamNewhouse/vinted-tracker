"use client";
import { FC, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setView } from "../../store/trackerSlice";
import Button from "../1-atoms/Button";
import EmptyState from "../1-atoms/EmptyState";
import BundleList from "../3-organisms/BundleList";
import DashboardStatsOrganism from "../3-organisms/DashboardStats";

const DashboardPage: FC = () => {
  const dispatch = useAppDispatch();
  const bundleCount = useAppSelector((s) => s.tracker.bundles.length);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your reselling finance summary
          </p>
        </div>
        <Button onClick={() => dispatch(setView("add-bundle"))}>+ New Bundle</Button>
      </div>

      <DashboardStatsOrganism />

      {bundleCount > 0 ? (
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
      ) : (
        <EmptyState
          icon="🛍️"
          title="Start tracking your reselling"
          description="Log a purchase bundle, split the cost across items, add postage and entry fees, and see exactly what you need to sell each item for."
          action={
            <Button size="lg" onClick={() => dispatch(setView("add-bundle"))}>
              Add Your First Bundle
            </Button>
          }
        />
      )}
    </div>
  );
};

export default memo(DashboardPage);
