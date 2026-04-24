import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  Bundle,
  Item,
  ItemStatus,
  Cost,
  DraftItem,
  ViewMode,
  FilterState,
  AppConfig,
  Source,
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
    defaultSaleCosts: [],
  },
};


// ── Helpers ──────────────────────────────────────────────────


function isActiveItem(item: Item): boolean {
  return item.status !== "unsellable" && item.status !== "returned" && item.status !== "sold";
}


/**
 * Recalculates cost allocations for all non-sold items in a bundle.
 *
 * Rules:
 * - Sold items are FROZEN — their allocatedPurchaseCost is a historical record, never touched.
 * - The remaining unrecovered cost (total invested minus what sold items locked in) is split
 *   equally across active (unsold, sellable) items only.
 * - Unsellable/returned items get zero allocation — their share moves to active items.
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
  const totalExtraCosts = bundle.costs.reduce((s, c) => s + c.amount, 0);

  const lockedPurchaseCost = soldItems.reduce((s, i) => s + i.allocatedPurchaseCost, 0);
  const remainingPurchaseCost = Math.max(0, bundle.purchaseCost - lockedPurchaseCost);

  const lockedCostShare = soldItems.reduce((s, i) => s + i.allocatedCostShare, 0);
  const remainingExtraCosts = Math.max(0, totalExtraCosts - lockedCostShare);

  const count = activeItems.length;
  const perItemPurchase = count > 0 ? remainingPurchaseCost / count : 0;
  const perItemExtra = count > 0 ? remainingExtraCosts / count : 0;

  for (const item of unsoldItems) {
    const active = isActiveItem(item);
    item.allocatedPurchaseCost = active ? perItemPurchase : 0;
    item.allocatedCostShare = active ? perItemExtra : 0;
    item.purchaseCost = active ? perItemPurchase : 0;
    item.breakEvenPrice = active ? perItemPurchase + perItemExtra : 0;
    item.minSalePrice = active
      ? item.breakEvenPrice * (1 + (item.targetMarginPercent ?? defaultMarginPercent) / 100)
      : 0;
    item.updatedAt = now;
  }
}


/**
 * Recalculates prices for a standalone item in-place.
 */
function recalculateStandalone(item: Item, defaultMarginPercent: number): void {
  const totalCosts = item.costs.reduce((s, c) => s + c.amount, 0);
  item.breakEvenPrice = item.purchaseCost + totalCosts;
  item.allocatedPurchaseCost = item.purchaseCost;
  item.allocatedCostShare = totalCosts;
  item.minSalePrice =
    item.breakEvenPrice * (1 + (item.targetMarginPercent ?? defaultMarginPercent) / 100);
  item.updatedAt = new Date().toISOString();
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
        bundle: Omit<Bundle, "id" | "createdAt" | "updatedAt" | "costs"> & {
          costs: Omit<Cost, "id">[];
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
        costs: bundle.costs.map((c) => ({ ...c, id: uuidv4() })),
        createdAt: now,
        updatedAt: now,
      });

      for (const draft of draftItems) {
        state.items.push({
          id: uuidv4(),
          bundleId,
          source: bundle.source,
          purchaseDate: bundle.purchaseDate,
          purchaseCost: perItemPurchaseCost,
          name: draft.name,
          description: draft.description,
          notes: draft.notes,
          allocatedPurchaseCost: perItemPurchaseCost,
          allocatedCostShare: 0,
          targetMarginPercent: state.config.defaultMarginPercent,
          breakEvenPrice: perItemPurchaseCost,
          minSalePrice: 0,
          costs: [],
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
        changes: Partial<Omit<Bundle, "id" | "createdAt" | "costs">>;
      }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.id);
      if (!bundle) return;
      Object.assign(bundle, action.payload.changes, { updatedAt: new Date().toISOString() });

      const { source, purchaseDate, purchaseCost } = action.payload.changes;
      if (source !== undefined || purchaseDate !== undefined) {
        for (const item of state.items.filter((i) => i.bundleId === bundle.id)) {
          if (source !== undefined) item.source = source;
          if (purchaseDate !== undefined) item.purchaseDate = purchaseDate;
          item.updatedAt = new Date().toISOString();
        }
      }

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


    /**
     * Add a single item to an existing bundle.
     * For adding multiple items at once to an existing bundle, use addBundleItems.
     */
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
        source: bundle.source,
        purchaseDate: bundle.purchaseDate,
        purchaseCost: 0,
        name: action.payload.name,
        description: action.payload.description,
        notes: action.payload.notes,
        allocatedPurchaseCost: 0,
        allocatedCostShare: 0,
        targetMarginPercent: state.config.defaultMarginPercent,
        breakEvenPrice: 0,
        minSalePrice: 0,
        costs: [],
        saleCosts: [],
        status: "unlisted",
        createdAt: now,
        updatedAt: now,
      });

      bundle.updatedAt = now;
      recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },


    /**
     * Add multiple items at once to an existing bundle.
     * Used when a user wants to bulk-add items to a bundle after it's been created.
     */
    addBundleItems(
      state,
      action: PayloadAction<{
        bundleId: string;
        draftItems: DraftItem[];
      }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;

      const now = new Date().toISOString();

      for (const draft of action.payload.draftItems) {
        state.items.push({
          id: uuidv4(),
          bundleId: bundle.id,
          source: bundle.source,
          purchaseDate: bundle.purchaseDate,
          purchaseCost: 0,
          name: draft.name,
          description: draft.description,
          notes: draft.notes,
          allocatedPurchaseCost: 0,
          allocatedCostShare: 0,
          targetMarginPercent: state.config.defaultMarginPercent,
          breakEvenPrice: 0,
          minSalePrice: 0,
          costs: [],
          saleCosts: [],
          status: "unlisted",
          createdAt: now,
          updatedAt: now,
        });
      }

      bundle.updatedAt = now;
      recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },


    addStandaloneItem(
      state,
      action: PayloadAction<{
        name: string;
        source: Source;
        purchaseDate: string;
        purchaseCost: number;
        description?: string;
        notes?: string;
        costs?: Omit<Cost, "id">[];
      }>,
    ) {
      const now = new Date().toISOString();
      const { name, source, purchaseDate, purchaseCost, description, notes, costs = [] } =
        action.payload;
      const resolvedCosts = costs.map((c) => ({ ...c, id: uuidv4() }));
      const totalCosts = resolvedCosts.reduce((s, c) => s + c.amount, 0);
      const breakEven = purchaseCost + totalCosts;
      const minSale = breakEven * (1 + state.config.defaultMarginPercent / 100);

      state.items.push({
        id: uuidv4(),
        bundleId: undefined,
        source,
        purchaseDate,
        purchaseCost,
        name,
        description,
        notes,
        allocatedPurchaseCost: purchaseCost,
        allocatedCostShare: totalCosts,
        breakEvenPrice: breakEven,
        minSalePrice: minSale,
        targetMarginPercent: state.config.defaultMarginPercent,
        costs: resolvedCosts,
        saleCosts: [],
        status: "unlisted",
        createdAt: now,
        updatedAt: now,
      });
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

      if (action.payload.changes.targetMarginPercent !== undefined) {
        item.marginOverridden = true;
      }

      if (item.bundleId) {
        const bundle = state.bundles.find((b) => b.id === item.bundleId);
        if (bundle) recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
      } else {
        recalculateStandalone(item, state.config.defaultMarginPercent);
      }
    },


    deleteItem(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      const bundle = item.bundleId
        ? state.bundles.find((b) => b.id === item.bundleId)
        : undefined;
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
        saleCosts: Cost[];
      }>,
    ) {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (!item) return;
      const now = new Date().toISOString();

      item.status = "sold";
      item.salePrice = action.payload.salePrice;
      item.soldAt = now;
      item.saleCosts = action.payload.saleCosts;
      item.updatedAt = now;

      if (item.bundleId) {
        const bundle = state.bundles.find((b) => b.id === item.bundleId);
        if (bundle) recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
      }
    },


    markItemStatus(state, action: PayloadAction<{ itemId: string; status: ItemStatus }>) {
      const item = state.items.find((i) => i.id === action.payload.itemId);
      if (!item) return;
      item.status = action.payload.status;

      if (action.payload.status !== "sold") {
        item.salePrice = undefined;
        item.soldAt = undefined;
        item.saleCosts = [];
      }
      item.updatedAt = new Date().toISOString();

      if (item.bundleId) {
        const bundle = state.bundles.find((b) => b.id === item.bundleId);
        if (bundle) recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
      }
    },


    // ── Bundle Costs ─────────────────────────────────────────


    addBundleCost(
      state,
      action: PayloadAction<{ bundleId: string; cost: Omit<Cost, "id"> }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.costs.push({ ...action.payload.cost, id: uuidv4() });
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle, state.items, state.config.defaultMarginPercent);
    },


    deleteBundleCost(state, action: PayloadAction<{ bundleId: string; costId: string }>) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.costs = bundle.costs.filter((c) => c.id !== action.payload.costId);
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
      state.config.defaultMarginPercent = action.payload;

      // Update targetMarginPercent on all non-sold, non-overridden items
      for (const item of state.items) {
        if (item.status !== "sold" && !item.marginOverridden) {
          item.targetMarginPercent = action.payload;
        }
      }

      // Recalculate bundle items
      for (const bundle of state.bundles) {
        recalculateAllocations(bundle, state.items, action.payload);
      }

      // Recalculate standalone items
      for (const item of state.items) {
        if (!item.bundleId && item.status !== "sold" && !item.marginOverridden) {
          recalculateStandalone(item, action.payload);
        }
      }
    },


    setDefaultSaleCosts(state, action: PayloadAction<Cost[]>) {
      state.config.defaultSaleCosts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (_state, action: any) => {
      if (action.key === "vinted-tracker-root" && action.payload?.tracker) {
        const tracker = action.payload.tracker;
        const items = (tracker.items ?? []).map((item: any) => ({
          ...item,
          source: item.source ?? item.bundleSource ?? "other",
          purchaseCost: item.purchaseCost ?? item.allocatedPurchaseCost ?? 0,
          allocatedCostShare: item.allocatedCostShare ?? item.allocatedExtraCostShare ?? 0,
          costs: item.costs ?? [],
          saleCosts: item.saleCosts ?? [],
          bundleId: item.bundleId ?? undefined,
        }));
        const bundles = (tracker.bundles ?? []).map((bundle: any) => ({
          ...bundle,
          costs: bundle.costs ?? bundle.extraCosts ?? [],
        }));
        return { ...initialState, ...tracker, items, bundles, filters: defaultFilters };
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
  addBundleItems,
  addStandaloneItem,
  updateItem,
  deleteItem,
  markItemSold,
  markItemStatus,
  addBundleCost,
  deleteBundleCost,
  setView,
  setActiveBundleId,
  setFilter,
  clearFilters,
  setDefaultMargin,
  setDefaultSaleCosts,
} = trackerSlice.actions;


export default trackerSlice.reducer;
