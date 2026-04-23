import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import {
  Bundle,
  BundleItem,
  ExtraCost,
  FilterState,
  ItemStatus,
  SaleCosts,
  ViewMode,
} from "../types";

interface TrackerState {
  bundles: Bundle[];
  activeBundleId: string | null;
  view: ViewMode;
  filters: FilterState;
}

const initialState: TrackerState = {
  bundles: [],
  activeBundleId: null,
  view: "dashboard",
  filters: {
    search: "",
    status: "all",
    sortField: "date",
    sortDirection: "desc",
  },
};

const trackerSlice = createSlice({
  name: "tracker",
  initialState,
  reducers: {
    // --- Bundles ---
    addBundle(
      state,
      action: PayloadAction<
        Omit<Bundle, "id" | "createdAt" | "updatedAt" | "items" | "extraCosts">
      >,
    ) {
      const now = new Date().toISOString();
      state.bundles.push({
        ...action.payload,
        id: uuidv4(),
        items: [],
        extraCosts: [],
        createdAt: now,
        updatedAt: now,
      });
    },

    updateBundle(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<Bundle, "id" | "createdAt" | "items" | "extraCosts">>;
      }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.id);
      if (bundle) {
        Object.assign(bundle, action.payload.changes, {
          updatedAt: new Date().toISOString(),
        });
      }
    },

    deleteBundle(state, action: PayloadAction<string>) {
      state.bundles = state.bundles.filter((b) => b.id !== action.payload);
      if (state.activeBundleId === action.payload) {
        state.activeBundleId = null;
        state.view = "bundles";
      }
    },

    // --- Items ---
    addItem(
      state,
      action: PayloadAction<{
        bundleId: string;
        item: Omit<BundleItem, "id" | "allocatedCost" | "extraCostsShare">;
      }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;

      const newItem: BundleItem = {
        ...action.payload.item,
        id: uuidv4(),
        allocatedCost: 0,
        extraCostsShare: 0,
      };
      bundle.items.push(newItem);
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle);
    },

    updateItem(
      state,
      action: PayloadAction<{ bundleId: string; itemId: string; changes: Partial<BundleItem> }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      const item = bundle.items.find((i) => i.id === action.payload.itemId);
      if (item) {
        Object.assign(item, action.payload.changes);
        bundle.updatedAt = new Date().toISOString();
        recalculateAllocations(bundle);
      }
    },

    deleteItem(state, action: PayloadAction<{ bundleId: string; itemId: string }>) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.items = bundle.items.filter((i) => i.id !== action.payload.itemId);
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle);
    },

    markItemStatus(
      state,
      action: PayloadAction<{
        bundleId: string;
        itemId: string;
        status: ItemStatus;
        salePrice?: number;
        saleCosts?: SaleCosts;
      }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      const item = bundle.items.find((i) => i.id === action.payload.itemId);
      if (item) {
        item.status = action.payload.status;
        if (action.payload.status === "sold") {
          item.salePrice = action.payload.salePrice;
          item.saleCosts = action.payload.saleCosts;
          item.soldAt = new Date().toISOString();
        }
        bundle.updatedAt = new Date().toISOString();
      }
    },

    // --- Extra Costs ---
    addExtraCost(state, action: PayloadAction<{ bundleId: string; cost: Omit<ExtraCost, "id"> }>) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.extraCosts.push({ ...action.payload.cost, id: uuidv4() });
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle);
    },

    updateExtraCost(
      state,
      action: PayloadAction<{ bundleId: string; costId: string; changes: Partial<ExtraCost> }>,
    ) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      const cost = bundle.extraCosts.find((c) => c.id === action.payload.costId);
      if (cost) {
        Object.assign(cost, action.payload.changes);
        bundle.updatedAt = new Date().toISOString();
        recalculateAllocations(bundle);
      }
    },

    deleteExtraCost(state, action: PayloadAction<{ bundleId: string; costId: string }>) {
      const bundle = state.bundles.find((b) => b.id === action.payload.bundleId);
      if (!bundle) return;
      bundle.extraCosts = bundle.extraCosts.filter((c) => c.id !== action.payload.costId);
      bundle.updatedAt = new Date().toISOString();
      recalculateAllocations(bundle);
    },

    // --- UI State ---
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
});

// --- Pure helper: mutates bundle items in-place (called inside Immer) ---
function recalculateAllocations(bundle: Bundle): void {
  const itemCount = bundle.items.length;
  if (itemCount === 0) return;

  const perItemPurchaseCost = bundle.purchaseCost / itemCount;
  const totalExtraCosts = bundle.extraCosts.reduce((sum, c) => sum + c.amount, 0);
  const perItemExtraCost = totalExtraCosts / itemCount;

  for (const item of bundle.items) {
    item.allocatedCost = perItemPurchaseCost;
    item.extraCostsShare = perItemExtraCost;
  }
}

export const {
  addBundle,
  updateBundle,
  deleteBundle,
  addItem,
  updateItem,
  deleteItem,
  markItemStatus,
  addExtraCost,
  updateExtraCost,
  deleteExtraCost,
  setView,
  setActiveBundleId,
  setFilter,
  clearFilters,
} = trackerSlice.actions;

export default trackerSlice.reducer;
