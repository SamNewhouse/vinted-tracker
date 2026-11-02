import type { Bundle, Cost, Item, PurchaseKind } from "../types";

/** Item and bundle shapes as stored by older versions (local storage and JSON backups). */
export type LegacyItem = Omit<Item, "bundleId"> & { bundleId?: string; costs?: Cost[] };
export type LegacyBundle = Omit<Bundle, "kind"> & { kind?: PurchaseKind };

/**
 * Older data had items with no purchase, carrying their own `costs`. Each becomes a
 * single-item purchase with the same cost and extra costs, so totals don't change.
 */
export const toPurchases = (
  bundles: LegacyBundle[],
  items: LegacyItem[],
): { bundles: Bundle[]; items: Item[] } => {
  const purchases: Bundle[] = bundles.map((b) => ({ ...b, kind: b.kind ?? "bundle" }));

  const converted = items.map(({ costs = [], bundleId, ...item }): Item => {
    if (bundleId) return { ...item, bundleId };
    const id = crypto.randomUUID();
    purchases.push({
      id,
      kind: "single",
      name: item.name,
      source: item.source,
      purchaseDate: item.purchaseDate,
      purchaseCost: item.purchaseCost,
      costs,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
    return { ...item, bundleId: id };
  });

  return { bundles: purchases, items: converted };
};
