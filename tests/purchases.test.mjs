// Quick check that older data (items with no purchase) converts without changing totals.
import { test } from "node:test";
import assert from "node:assert/strict";
import { toPurchases } from "../src/utils/purchases.ts";

const cost = (amount) => ({ id: `c${amount}`, label: "x", category: "postage", amount });
const item = (id, extra) => ({
  id,
  name: `Item ${id}`,
  source: "car_boot",
  purchaseDate: "2026-01-01",
  purchaseCost: 0,
  status: "listed",
  saleCosts: [],
  createdAt: "t",
  updatedAt: "t",
  ...extra,
});
const spend = (bundles) =>
  bundles.reduce((s, b) => s + b.purchaseCost + b.costs.reduce((c, x) => c + x.amount, 0), 0);

test("items with no purchase become single-item purchases with the same spend", () => {
  const oldBundles = [
    {
      id: "b1",
      name: "Haul",
      source: "car_boot",
      purchaseDate: "2026-01-01",
      purchaseCost: 20,
      costs: [cost(3)],
    },
  ];
  const oldItems = [
    item("a", { bundleId: "b1", purchaseCost: 10, costs: [] }),
    item("b", { bundleId: "b1", purchaseCost: 10 }),
    item("c", { purchaseCost: 5, costs: [cost(2)] }),
    item("d", { purchaseCost: 4 }),
  ];
  const oldSpend = spend(oldBundles) + 5 + 2 + 4;

  const { bundles, items } = toPurchases(oldBundles, oldItems);

  assert.equal(bundles.length, 3);
  assert.equal(bundles[0].kind, "bundle");
  assert.deepEqual(
    bundles.slice(1).map((b) => b.kind),
    ["single", "single"],
  );
  assert.equal(spend(bundles), oldSpend);
  assert.ok(items.every((i) => bundles.some((b) => b.id === i.bundleId)));
  assert.ok(items.every((i) => !("costs" in i)));
  assert.equal(bundles.find((b) => b.id === items[2].bundleId).name, "Item c");
});

test("already-converted data is left alone", () => {
  const first = toPurchases([], [item("x", { purchaseCost: 3 })]);
  const again = toPurchases(first.bundles, first.items);
  assert.deepEqual(again, first);
});
