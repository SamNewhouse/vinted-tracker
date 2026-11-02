"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { importListings } from "../../store/trackerSlice";
import { parseVintedHtml } from "../../utils/import/vinted";
import { listingChange } from "../../utils/import/listings";
import { formatCurrency } from "../../utils/finance";
import type { BundleStatus, ImportedListing, ListingChange, Source } from "../../types";
import { SOURCES } from "../../config/constants";
import Button from "../1-atoms/Button";
import Select from "../1-atoms/Select";
import Textarea from "../1-atoms/Textarea";
import Input from "../1-atoms/Input";
import Badge from "../1-atoms/Badge";

const CHANGE_BADGE: Record<ListingChange, BundleStatus> = {
  new: "success",
  update: "info",
  unchanged: "neutral",
};

const NEW_BUNDLE = "__new__";

interface Row {
  listing: ImportedListing;
  change: ListingChange;
  selected: boolean;
}

const ImportListingsForm: FC = () => {
  const dispatch = useAppDispatch();
  const bundles = useAppSelector((s) => s.tracker.bundles);
  const items = useAppSelector((s) => s.tracker.items);

  const [html, setHtml] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [bundleId, setBundleId] = useState("");
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newSource, setNewSource] = useState<Source>("car_boot");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRead = () => {
    const result = parseVintedHtml(html);
    setSkipped(result.skipped);
    setMessage(
      result.listings.length === 0
        ? "No listings found. Copy the wardrobe grid's HTML as described above."
        : "",
    );
    setRows(
      result.listings.length === 0
        ? null
        : result.listings.map((listing) => {
            const change = listingChange(
              listing,
              items.find((i) => i.externalId === listing.externalId),
            );
            return { listing, change, selected: change !== "unchanged" };
          }),
    );
  };

  const updateRow = (index: number, changes: Partial<Row>) =>
    setRows((prev) => prev && prev.map((r, i) => (i === index ? { ...r, ...changes } : r)));

  const selected = rows?.filter((r) => r.selected) ?? [];

  const handleImport = () => {
    const listings = selected.map((r) => r.listing);

    if (bundleId === NEW_BUNDLE) {
      const errs: Record<string, string> = {};
      if (!newName.trim()) errs.name = "Bundle name is required";
      if (!newCost || isNaN(Number(newCost)) || Number(newCost) < 0)
        errs.cost = "Enter what you paid for the whole purchase";
      if (!newDate) errs.date = "Purchase date is required";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      dispatch(
        importListings({
          bundleId: null,
          newBundle: {
            name: newName.trim(),
            source: newSource,
            purchaseDate: newDate,
            purchaseCost: Number(newCost),
          },
          listings,
        }),
      );
    } else {
      dispatch(importListings({ bundleId: bundleId || null, listings }));
    }
    setMessage(`✓ Imported ${selected.length} listing${selected.length !== 1 ? "s" : ""}.`);
    setRows(null);
    setHtml("");
  };

  const handleCancel = () => {
    setRows(null);
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          On your Vinted wardrobe page, right-click an item → Inspect, select the element holding
          the whole grid of items, then right-click it → Copy → Copy outerHTML, and paste it here.
          Importing again later updates items you've already imported instead of adding them twice.
        </p>
      </div>

      {!rows ? (
        <>
          <Textarea
            label="Wardrobe HTML"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder='<div class="…feed-grid">…'
            className="font-mono text-xs"
          />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleRead} disabled={!html.trim()}>
              Read listings
            </Button>
            {message && (
              <span className="text-xs text-slate-500 dark:text-slate-400" role="status">
                {message}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400" role="status">
            Found {rows.length} listing{rows.length !== 1 ? "s" : ""}
            {skipped > 0 && `, skipped ${skipped} that couldn't be read`}. Sold listings use the
            listed price as the sale price; change it below if it sold for less.
          </p>

          <Select
            label="Add new items to"
            value={bundleId}
            onChange={(e) => setBundleId(e.target.value)}
            options={[
              { value: "", label: "No bundle (standalone, add purchase cost later)" },
              { value: NEW_BUNDLE, label: "New bundle (these all came from one purchase)" },
              ...bundles.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />

          {bundleId === NEW_BUNDLE && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <Input
                label="Bundle Name"
                placeholder="e.g. Car boot haul"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                error={errors.name}
              />
              <Select
                label="Source"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value as Source)}
                options={SOURCES}
              />
              <Input
                label="Total Purchase Cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                prefix="£"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                error={errors.cost}
                hint="Split across the new items"
              />
              <Input
                label="Purchase Date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                error={errors.date}
              />
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="text-xs text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-3 py-2 w-8">
                    <span className="sr-only">Import</span>
                  </th>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 w-32">Price</th>
                  <th className="px-3 py-2">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, i) => (
                  <tr key={row.listing.externalId}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`Import ${row.listing.name}`}
                        checked={row.selected}
                        disabled={row.change === "unchanged"}
                        onChange={(e) => updateRow(i, { selected: e.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <a
                        href={row.listing.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-slate-900 dark:text-white hover:underline"
                      >
                        {row.listing.name}
                      </a>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {[row.listing.brand, row.listing.size, row.listing.condition]
                          .filter(Boolean)
                          .join(" · ")}
                        {row.listing.views !== undefined &&
                          ` · ${row.listing.views} views, ${row.listing.favourites ?? 0} favourites`}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        label={
                          row.listing.pending
                            ? "Sold (processing)"
                            : row.listing.status === "sold"
                              ? "Sold"
                              : "Listed"
                        }
                        status={row.listing.status === "sold" ? "profit" : "neutral"}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {row.change === "unchanged" ? (
                        formatCurrency(row.listing.price)
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          prefix="£"
                          aria-label={`Price for ${row.listing.name}`}
                          value={row.listing.price}
                          onChange={(e) =>
                            updateRow(i, {
                              listing: { ...row.listing, price: Number(e.target.value) || 0 },
                            })
                          }
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge label={row.change} status={CHANGE_BADGE[row.change]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleImport} disabled={selected.length === 0}>
              Import {selected.length} listing{selected.length !== 1 ? "s" : ""}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(ImportListingsForm);
