import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { Bundle, Item, BundleSummary, DashboardStats } from "../types";
import { calcItemProfit } from "../utils/finance";

// ── Base selectors ───────────────────────────────────────────

const selectBundles = (state: RootState) => state.tracker.bundles;
const selectAllItems = (state: RootState) => state.tracker.items;
const selectFilters = (state: RootState) => state.tracker.filters;
const selectActiveBundleId = (state: RootState) => state.tracker.activeBundleId;

// ── Active bundle ────────────────────────────────────────────

export const selectActiveBundle = createSelector(
  [selectBundles, selectActiveBundleId],
  (bundles, id) => bundles.find((b) => b.id === id) ?? null,
);

export const selectActiveBundleItems = createSelector(
  [selectAllItems, selectActiveBundleId],
  (items, id) => (id ? items.filter((i) => i.bundleId === id) : []),
);

// ── Bundle summary ───────────────────────────────────────────

export const selectBundleSummary = (bundle: Bundle, items: Item[]): BundleSummary => {
  const bundleItems = items.filter((i) => i.bundleId === bundle.id);
  const itemCount = bundleItems.length;

  const totalInvested = bundle.purchaseCost + bundle.costs.reduce((s, c) => s + c.amount, 0);
  const perItemCost = itemCount > 0 ? totalInvested / itemCount : 0;

  const soldItems = bundleItems.filter((i) => i.status === "sold");
  const totalRevenue = soldItems.reduce((s, i) => s + (i.salePrice ?? 0), 0);
  const totalSaleCosts = bundleItems.reduce(
    (s, i) => s + i.saleCosts.reduce((sc, c) => sc + c.amount, 0),
    0,
  );
  const totalProfit = totalRevenue - totalInvested - totalSaleCosts;
  const profitMargin = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return {
    bundleId: bundle.id,
    itemCount,
    totalInvested,
    perItemCost,
    totalRevenue,
    totalSaleCosts,
    totalProfit,
    profitMargin,
    soldItemCount: soldItems.length,
    listedItemCount: bundleItems.filter((i) => i.status === "listed").length,
    unlistedItemCount: bundleItems.filter((i) => i.status === "unlisted").length,
    returnedItemCount: bundleItems.filter((i) => i.status === "returned").length,
    unsellableItemCount: bundleItems.filter((i) => i.status === "unsellable").length,
    isProfitable: totalProfit > 0,
    isBreakEven: totalProfit >= 0,
  };
};

// ── Dashboard stats ──────────────────────────────────────────

export const selectDashboardStats = createSelector(
  [selectBundles, selectAllItems],
  (bundles, items): DashboardStats => {
    const summaries = bundles.map((b) => selectBundleSummary(b, items));

    const bundleSpend = summaries.reduce((s, b) => s + b.totalInvested, 0);
    const bundleSaleCosts = summaries.reduce((s, b) => s + b.totalSaleCosts, 0);
    const bundleRevenue = summaries.reduce((s, b) => s + b.totalRevenue, 0);

    const standaloneItems = items.filter((i) => !i.bundleId);
    const standaloneSpend = standaloneItems.reduce(
      (s, i) => s + i.purchaseCost + i.costs.reduce((sc, c) => sc + c.amount, 0),
      0,
    );
    const standaloneSaleCosts = standaloneItems.reduce(
      (s, i) => s + i.saleCosts.reduce((sc, c) => sc + c.amount, 0),
      0,
    );
    const standaloneRevenue = standaloneItems
      .filter((i) => i.status === "sold")
      .reduce((s, i) => s + (i.salePrice ?? 0), 0);

    const totalSpend = bundleSpend + standaloneSpend;
    const totalSaleCosts = bundleSaleCosts + standaloneSaleCosts;
    const totalRevenue = bundleRevenue + standaloneRevenue;
    const totalProfit = totalRevenue - totalSpend - totalSaleCosts;
    const overallROI = totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;

    const soldItems = items.filter((i) => i.status === "sold");
    const avgProfitPerItem =
      soldItems.length > 0
        ? soldItems.reduce(
            (s, i) =>
              s +
              calcItemProfit(
                i.salePrice ?? 0,
                i.allocatedPurchaseCost,
                i.allocatedCostShare,
                i.saleCosts,
              ),
            0,
          ) / soldItems.length
        : 0;

    return {
      totalSpend,
      totalSaleCosts,
      totalRevenue,
      totalProfit,
      overallROI,
      totalBundles: bundles.length,
      totalItems: items.length,
      soldItems: soldItems.length,
      listedItems: items.filter((i) => i.status === "listed").length,
      unlistedItems: items.filter((i) => i.status === "unlisted").length,
      returnedItems: items.filter((i) => i.status === "returned").length,
      unsellableItems: items.filter((i) => i.status === "unsellable").length,
      avgProfitPerItem,
    };
  },
);

// ── Filtered bundles ─────────────────────────────────────────

export const selectFilteredBundles = createSelector(
  [selectBundles, selectAllItems, selectFilters],
  (bundles, items, filters) => {
    let result = [...bundles];

    if (filters?.search) {
      const q = filters?.search.toLowerCase();
      result = result.filter((b) => {
        const bundleItems = items.filter((i) => i.bundleId === b.id);
        return (
          b.name.toLowerCase().includes(q) ||
          b.source.toLowerCase().includes(q) ||
          bundleItems.some((i) => i.name.toLowerCase().includes(q))
        );
      });
    }

    result.sort((a, b) => {
      const dir = filters?.sortDirection === "asc" ? 1 : -1;
      switch (filters?.sortField) {
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

// ── All items (filtered/sorted) - for the Items view ────────

export const selectFilteredItems = createSelector(
  [selectAllItems, selectBundles, selectFilters],
  (items, bundles, filters) => {
    let result = [...items];

    if (filters?.status && filters.status !== "all") {
      result = result.filter((i) => i.status === filters.status);
    }

    if (filters?.bundleId && filters.bundleId !== "all") {
      if (filters.bundleId === "standalone") {
        result = result.filter((i) => !i.bundleId);
      } else {
        result = result.filter((i) => i.bundleId === filters.bundleId);
      }
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) => {
        if (i.name.toLowerCase().includes(q)) return true;
        if (i.source.toLowerCase().includes(q)) return true;
        if (i.bundleId) {
          const bundle = bundles.find((b) => b.id === i.bundleId);
          if (bundle?.name.toLowerCase().includes(q)) return true;
        }
        return false;
      });
    }

    result.sort((a, b) => {
      const dir = filters?.sortDirection === "asc" ? 1 : -1;
      switch (filters?.sortField) {
        case "date":
          return (a.purchaseDate > b.purchaseDate ? 1 : -1) * dir;
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "profit": {
          const pa =
            a.salePrice != null
              ? calcItemProfit(
                  a.salePrice,
                  a.allocatedPurchaseCost,
                  a.allocatedCostShare,
                  a.saleCosts,
                )
              : -Infinity;
          const pb =
            b.salePrice != null
              ? calcItemProfit(
                  b.salePrice,
                  b.allocatedPurchaseCost,
                  b.allocatedCostShare,
                  b.saleCosts,
                )
              : -Infinity;
          return (pa - pb) * dir;
        }
        default:
          return 0;
      }
    });

    return result;
  },
);
