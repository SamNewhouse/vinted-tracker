import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { Bundle, BundleSummary, DashboardStats } from "../types";

const selectBundles = (state: RootState) => state.tracker.bundles;
const selectFilters = (state: RootState) => state.tracker.filters;
const selectActiveBundleId = (state: RootState) => state.tracker.activeBundleId;

export const selectActiveBundle = createSelector(
  [selectBundles, selectActiveBundleId],
  (bundles, id) => bundles.find((b) => b.id === id) ?? null,
);

export const selectBundleSummary = (bundle: Bundle): BundleSummary => {
  const totalExtraCosts = bundle.extraCosts.reduce((s, c) => s + c.amount, 0);
  const totalInvested = bundle.purchaseCost + totalExtraCosts;
  const soldItems = bundle.items.filter((i) => i.status === "sold");
  const totalRevenue = soldItems.reduce((s, i) => s + (i.salePrice ?? 0), 0);
  const totalProfit = totalRevenue - totalInvested;
  const profitMargin = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const itemCount = bundle.items.length;
  const perItemCost = itemCount > 0 ? totalInvested / itemCount : 0;
  // Minimum sale price = per-item cost * 1.15 to allow 15% margin
  const averageMinSalePrice = perItemCost * 1.15;

  return {
    bundleId: bundle.id,
    totalInvested,
    totalRevenue,
    totalProfit,
    profitMargin,
    soldItemCount: soldItems.length,
    unsoldItemCount: bundle.items.filter((i) => i.status !== "sold").length,
    averageMinSalePrice,
    isBreakEven: totalProfit >= 0,
    isProfitable: totalProfit > 0,
  };
};

export const selectDashboardStats = createSelector([selectBundles], (bundles): DashboardStats => {
  const allItems = bundles.flatMap((b) => b.items);
  const summaries = bundles.map(selectBundleSummary);

  const totalSpend = summaries.reduce((s, b) => s + b.totalInvested, 0);
  const totalRevenue = summaries.reduce((s, b) => s + b.totalRevenue, 0);
  const totalProfit = totalRevenue - totalSpend;
  const overallProfitMargin = totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;

  const bestBundle = summaries.reduce(
    (best, s) => (!best || s.totalProfit > best.totalProfit ? s : best),
    null as BundleSummary | null,
  );
  const worstBundle = summaries.reduce(
    (worst, s) => (!worst || s.totalProfit < worst.totalProfit ? s : worst),
    null as BundleSummary | null,
  );

  return {
    totalSpend,
    totalRevenue,
    totalProfit,
    overallProfitMargin,
    totalBundles: bundles.length,
    totalItems: allItems.length,
    soldItems: allItems.filter((i) => i.status === "sold").length,
    activeListings: allItems.filter((i) => i.status === "listed").length,
    unlistedItems: allItems.filter((i) => i.status === "unlisted").length,
    bestPerformingBundle: bestBundle
      ? bundles.find((b) => b.id === bestBundle.bundleId)?.name
      : undefined,
    worstPerformingBundle: worstBundle
      ? bundles.find((b) => b.id === worstBundle.bundleId)?.name
      : undefined,
  };
});

export const selectFilteredBundles = createSelector(
  [selectBundles, selectFilters],
  (bundles, filters) => {
    let result = [...bundles];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.source.toLowerCase().includes(q) ||
          b.items.some((i) => i.name.toLowerCase().includes(q)),
      );
    }

    result.sort((a, b) => {
      const dir = filters.sortDirection === "asc" ? 1 : -1;
      switch (filters.sortField) {
        case "date":
          return (a.purchaseDate > b.purchaseDate ? 1 : -1) * dir;
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "spend":
          return (a.purchaseCost - b.purchaseCost) * dir;
        default:
          return 0;
      }
    });

    return result;
  },
);
