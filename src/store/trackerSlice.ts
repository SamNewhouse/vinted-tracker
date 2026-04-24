import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  Bundle,
  Item,
  ItemStatus,
  ItemSaleCost,
  BundleExtraCost,
  DraftItem,
  ViewMode,
  FilterState,
  AppConfig,
} from "../types";
import { REHYDRATE } from "redux-persist";

// ── State ────────────────────────────────────────────────────

interface TrackerState {
  bundles: Bundle[];
  items: Item[];
  activeBundleId: string | null;
  view: ViewMode;
  filters: FilterState;
  config: AppConfig;
}

const defaultFilters: FilterState = {
  search: "",
  status: "all",
  bundleId: "all",
  sortField: "date",
  sortDirection: "desc",
};

export const initialState: TrackerState = {
  bundles: [],
  items: [],
  activeBundleId: null,
  view: "dashboard",
  filters: defaultFilters,
  config: {
    defaultMarginPercent: 15,
  },
};

// ── Helpers ──────────────────────────────────────────────────

/**
 * Active = still in play, needs to recover cost.
 * Sold items are finished - their allocation is locked in at time of sale.
 * Unsellable/returned items are excluded - their cost burden moves to active items.
 */
function isActiveItem(item: Item): boolean {
  return item.status !== "unsellable" && item.status !== "returned" && item.status !== "sold";
}

/**
 * Recalculates cost allocations for all non-sold items in a bundle.
 *
 * Rules:
 * - Sold items are FROZEN - their allocatedPurchaseCost is a historical record, never touched.
 * - The remaining unrecovered cost (total invested minus what sold items locked in) is split
 *   equally across active (unsold, sellable) items only.
 * - Unsellable/returned items get zero allocation - their share moves to active items.
 * - If all remaining items are inactive, everything zeroes out.
 */
function recalculateAllocations(
  bundle: Bundle,
  allItems: Item[],
  defaultMarginPercent: number,
): void {
  const bundleItems = allItems.filter((i) => i.bundleId === bundle.id);
  const soldItems = bundleItems.filter((i) => i.status === "sold");
  const unsoldItems = bundleItems.filter((i) => i.status !== "sold");
  const activeItems = unsoldItems.filter(isActiveItem);

  const now = new Date().toISOString();
  const totalExtraCosts = bundle.extraCosts.reduce((s, c) => s + c.amount, 0);
  const totalInvested = bundle.purchaseCost + totalExtraCosts;

  // Subtract what sold items already locked in - we only need to recover the rest
  const lockedCost = soldItems.reduce(
    (s, i) => s + i.allocatedPurchaseCost + i.allocatedExtraCostShare,
    0,
  );
  const remainingCost = Math.max(0, totalInvested - lockedCost);

  // Split remaining cost across active unsold items only
  const perItemShare = activeItems.length > 0 ? remainingCost / activeItems.length : 0;

  // Only recalculate unsold items - sold items are never touched
  for (const item of unsoldItems) {
    const active = isActiveItem(item);
    item.allocatedPurchaseCost = active ? perItemShare : 0;
    item.allocatedExtraCostShare = 0;
    item.breakEvenPrice = active ? perItemShare : 0;
    item.minSalePrice = active
      ? perItemShare * (1 + (item.targetMarginPercent ?? defaultMarginPercent) / 100)
      : 0;
    item.updatedAt = now;
  }
}

// ── Slice ────────────────────────────────────────────────────

const trackerSlice = createSlice({
  name: "tracker",
  initialState,
  reducers: {
    // ── Bundles ──────────────────────────────────────────────

    addBundle(
      state,
      action: PayloadAction<{
        bundle: Omit<Bundle, "id" | "createdAt" | "updatedAt" | "extraCosts"> & {
          extraCosts: Omit<BundleExtraCost, "id">[];
        };
        draftItems: DraftItem[];
      }>,
    ) {
      const now = new Date().toISOString();
      const bundleId = uuidv4();
      const { bundle, draftItems } = action.payload;
      const itemCount = draftItems.length;
      const perItemPurchaseCost = itemCount > 0 ? bundle.purchaseCost / itemCount : 0;

      state.bundles.push({
        ...bundle,
        id: bundleId,
        extraCosts: bundle.extraCosts.map((c) => ({ ...c, id: uuidv4() })),
        createdAt: now,
        updatedAt: now,
      });

      // Push draft items with temporary values - recalculate below corrects them
      for (const draft of draftItems) {
        state.items.push({
          id: uuidv4(),
          bundleId,
          bundleName: bundle.name,
          bundleSource: bundle.source,
          purchaseDate: bundle.purchaseDate,
          name: draft.name,
          description: draft.description,
          notes: draft.notes,
          allocatedPurchaseCost: perItemPurchaseCost,
          allocatedExtraCostShare: 0,
          targetMarginPercent: state.config.defaultMarginPercent,
          breakEvenPrice: perItemPurchaseCost,
          minSalePrice: 0,
          saleCosts: [],
          status: "unlisted",
          createdAt: now,
          updatedAt: now,
        });
      }

      const newBundle = state.bundles.find((b) => b.id === bundleId)!;
      recalculateAllocations(newBundle, state.items, state.config.defaultMarginPercent);

      state.activeBundleId = bundleId;
      state.view = "bundle-detail";
    },

    updateBundle(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<Bundle, "id" | "createdAt" | "extraCosts">>;
      }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.id);
      if (!bundle) return;
      Object.assign(bundle, action.payload.changes, { updatedAt: new Date().toISOString() });

      // Keep denormalised item fields in sync
      const { name, source, purchaseDate, purchaseCost } = action.payload.changes;
      if (name !== undefined || source !== undefined || purchaseDate !== undefined) {
        for (const item of state.items.filter((i) => i.bundleId === bundle.id)) {
          if (name !== undefined) item.bundleName = name;
          if (source !== undefined) item.bundleSource = source;
          if (purchaseDate !== undefined) item.purchaseDate = purchaseDate;
          item.updatedAt = new Date().toISOString();
        }
      }

      // Recalculate if purchase cost changed - affects all unsold item allocations
      if (purchaseCost !== undefined) {
        recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
      }
    },

    deleteBundle(state, action: PayloadAction<string>) {
      state.bundles = state.bundles.filter((b) => b.id !== action.payload);
      state.items = state.items.filter((i) => i.bundleId !== action.payload);
      if (state.activeBundleId === action.payload) {
        state.activeBundleId = null;
        state.view = "bundles";
      }
    },

    // ── Items ────────────────────────────────────────────────

    addItem(
      state,
      action: PayloadAction<{
        bundleId: string;
        name: string;
        description?: string;
        notes?: string;
      }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;

      const now = new Date().toISOString();

      state.items.push({
        id: uuidv4(),
        bundleId: bundle.id,
        bundleName: bundle.name,
        bundleSource: bundle.source,
        purchaseDate: bundle.purchaseDate,
        name: action.payload.name,
        description: action.payload.description,
        notes: action.payload.notes,
        allocatedPurchaseCost: 0,
        allocatedExtraCostShare: 0,
        targetMarginPercent: state.config.defaultMarginPercent,
        breakEvenPrice: 0,
        minSalePrice: 0,
        saleCosts: [],
        status: "unlisted",
        createdAt: now,
        updatedAt: now,
      });

      bundle.updatedAt = now;
      recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },

    updateItem(
      state,
      action: PayloadAction<{
        itemId: string;
        changes: Partial<
          Pick<
            Item,
            "name" | "description" | "notes" | "targetMarginPercent" | "listedPrice" | "listedAt"
          >
        >;
      }>,
    ) {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (!item) return;
      Object.assign(item, action.payload.changes, { updatedAt: new Date().toISOString() });

      // If margin changed, recalculate this item's minSalePrice immediately
      if (action.payload.changes.targetMarginPercent !== undefined) {
        item.minSalePrice = item.breakEvenPrice * (1 + item.targetMarginPercent / 100);
      }

      // Recalculate bundle in case allocation-affecting fields changed
      const bundle = state.bundles.find((b) => b.id === item.bundleId);
      if (bundle) recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },

    deleteItem(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      const bundle = state.bundles.find((b) => b.id === item.bundleId);
      state.items = state.items.filter((i) => i.id !== action.payload);
      if (bundle) {
        bundle.updatedAt = new Date().toISOString();
        recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
      }
    },

    markItemSold(
      state,
      action: PayloadAction<{
        itemId: string;
        salePrice: number;
        saleCosts: Omit<ItemSaleCost, "id">[];
      }>,
    ) {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (!item) return;
      const now = new Date().toISOString();

      // Lock in the allocation at current values before freezing
      item.status = "sold";
      item.salePrice = action.payload.salePrice;
      item.soldAt = now;
      item.saleCosts = action.payload.saleCosts.map((c) => ({ ...c, id: uuidv4() }));
      item.updatedAt = now;

      // Recalculate remaining unsold items - they now share a smaller remaining cost
      const bundle = state.bundles.find((b) => b.id === item.bundleId);
      if (bundle) recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },

    markItemStatus(state, action: PayloadAction<{ itemId: string; status: ItemStatus }>) {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (!item) return;
      item.status = action.payload.status;

      // Clear sale data if moving out of sold status
      if (action.payload.status !== "sold") {
        item.salePrice = undefined;
        item.soldAt = undefined;
        item.saleCosts = [];
      }
      item.updatedAt = new Date().toISOString();

      // Redistribution: status change affects the active pool
      const bundle = state.bundles.find((b) => b.id === item.bundleId);
      if (bundle) recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },

    // ── Bundle Extra Costs ───────────────────────────────────

    addBundleExtraCost(
      state,
      action: PayloadAction<{ bundleId: string; cost: Omit<BundleExtraCost, "id"> }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.extraCosts.push({ ...action.payload.cost, id: uuidv4() });
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },

    deleteBundleExtraCost(state, action: PayloadAction<{ bundleId: string; costId: string }>) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.extraCosts = bundle.extraCosts.filter((c) => c.id !== action.payload.costId);
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },

    // ── UI State ─────────────────────────────────────────────

    setView(state, action: PayloadAction<ViewMode>) {
      state.view = action.payload;
    },

    setActiveBundleId(state, action: PayloadAction<string | null>) {
      state.activeBundleId = action.payload;
    },

    setFilter(state, action: PayloadAction<Partial<FilterState>>) {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters(state) {
      state.filters = defaultFilters;
    },

    // ── Config ───────────────────────────────────────────────

    setDefaultMargin(state, action: PayloadAction<number>) {
      const oldDefault = state.config.defaultMarginPercent;
      state.config.defaultMarginPercent = action.payload;

      // Only update items whose margin was never manually overridden
      // Sold items are frozen - never update their margin
      for (const item of state.items) {
        if (item.status !== "sold" && item.targetMarginPercent === oldDefault) {
          item.targetMarginPercent = action.payload;
        }
      }

      // Recalculate all bundles with the new margin
      for (const bundle of state.bundles) {
        recalculateAllocations(bundle, state.items, action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (_state, action: any) => {
      if (action.key === "vinted-tracker-root" && action.payload?.tracker) {
        return {
          ...initialState,
          ...action.payload.tracker,
          filters: defaultFilters,
        };
      }
      return initialState;
    });
  },
});

export const {
  addBundle,
  updateBundle,
  deleteBundle,
  addItem,
  updateItem,
  deleteItem,
  markItemSold,
  markItemStatus,
  addBundleExtraCost,
  deleteBundleExtraCost,
  setView,
  setActiveBundleId,
  setFilter,
  clearFilters,
  setDefaultMargin,
} = trackerSlice.actions;

export default trackerSlice.reducer;
