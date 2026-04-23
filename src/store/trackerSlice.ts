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
} from "../types";
import { REHYDRATE } from "redux-persist";

interface TrackerState {
  bundles: Bundle[];
  items: Item[];
  activeBundleId: string | null;
  view: ViewMode;
  filters: FilterState;
}

export const initialState: TrackerState = {
  bundles: [],
  items: [],
  activeBundleId: null,
  view: "dashboard",
  filters: {
    search: "",
    status: "all",
    bundleId: "all",
    sortField: "date",
    sortDirection: "desc",
  },
};

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
          targetMarginPercent: 15,
          breakEvenPrice: perItemPurchaseCost,
          minSalePrice: perItemPurchaseCost * 1.15,
          saleCosts: [],
          status: "unlisted",
          createdAt: now,
          updatedAt: now,
        });
      }

      // Recalculate now that extraCosts are on the bundle
      const newBundle = state.bundles.find((b) => b.id === bundleId)!;
      recalculateAllocations(newBundle, state.items);

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

      const { name, source, purchaseDate } = action.payload.changes;
      if (name !== undefined || source !== undefined || purchaseDate !== undefined) {
        for (const item of state.items.filter((i) => i.bundleId === bundle.id)) {
          if (name !== undefined) item.bundleName = name;
          if (source !== undefined) item.bundleSource = source;
          if (purchaseDate !== undefined) item.purchaseDate = purchaseDate;
          item.updatedAt = new Date().toISOString();
        }
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
      const bundleItems = state.items.filter((i) => i.bundleId === bundle.id);
      const newCount = bundleItems.length + 1;

      const perItemPurchaseCost = bundle.purchaseCost / newCount;
      const sharedExtraCosts = bundle.extraCosts.reduce((s, c) => s + c.amount, 0);
      const perItemExtraShare = sharedExtraCosts / newCount;

      for (const item of bundleItems) {
        item.allocatedPurchaseCost = perItemPurchaseCost;
        item.allocatedExtraCostShare = perItemExtraShare;
        item.breakEvenPrice = perItemPurchaseCost + perItemExtraShare;
        item.minSalePrice = item.breakEvenPrice * (1 + item.targetMarginPercent / 100);
        item.updatedAt = now;
      }

      state.items.push({
        id: uuidv4(),
        bundleId: bundle.id,
        bundleName: bundle.name,
        bundleSource: bundle.source,
        purchaseDate: bundle.purchaseDate,
        name: action.payload.name,
        description: action.payload.description,
        notes: action.payload.notes,
        allocatedPurchaseCost: perItemPurchaseCost,
        allocatedExtraCostShare: perItemExtraShare,
        targetMarginPercent: 15,
        breakEvenPrice: perItemPurchaseCost + perItemExtraShare,
        minSalePrice: (perItemPurchaseCost + perItemExtraShare) * 1.15,
        saleCosts: [],
        status: "unlisted",
        createdAt: now,
        updatedAt: now,
      });

      bundle.updatedAt = now;
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
        item.minSalePrice = item.breakEvenPrice * (1 + item.targetMarginPercent / 100);
      }
    },

    deleteItem(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (!item) return;
      const bundle = state.bundles.find((b) => b.id === item.bundleId);
      state.items = state.items.filter((i) => i.id !== action.payload);
      if (bundle) {
        bundle.updatedAt = new Date().toISOString();
        recalculateAllocations(bundle, state.items);
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
      item.status = "sold";
      item.salePrice = action.payload.salePrice;
      item.soldAt = now;
      item.saleCosts = action.payload.saleCosts.map((c) => ({ ...c, id: uuidv4() }));
      item.updatedAt = now;
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
      recalculateAllocations(bundle, state.items);
    },

    deleteBundleExtraCost(state, action: PayloadAction<{ bundleId: string; costId: string }>) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.extraCosts = bundle.extraCosts.filter((c) => c.id !== action.payload.costId);
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle, state.items);
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
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: any) => {
      if (action.key === "vinted-tracker-root") {
        state.filters = initialState.filters;
      }
    });
  },
});

function recalculateAllocations(bundle: Bundle, allItems: Item[]): void {
  const bundleItems = allItems.filter((i) => i.bundleId === bundle.id);
  const itemCount = bundleItems.length;
  if (itemCount === 0) return;

  const now = new Date().toISOString();
  const perItemPurchaseCost = bundle.purchaseCost / itemCount;
  const sharedExtraCosts = bundle.extraCosts.reduce((s, c) => s + c.amount, 0);
  const perItemExtraShare = sharedExtraCosts / itemCount;

  for (const item of bundleItems) {
    item.allocatedPurchaseCost = perItemPurchaseCost;
    item.allocatedExtraCostShare = perItemExtraShare;
    item.breakEvenPrice = perItemPurchaseCost + perItemExtraShare;
    item.minSalePrice = item.breakEvenPrice * (1 + item.targetMarginPercent / 100);
    item.updatedAt = now;
  }
}

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
} = trackerSlice.actions;

export default trackerSlice.reducer;
