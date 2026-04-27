"use client";
import { FC, memo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setDefaultMargin,
  setDefaultSaleCosts,
  replaceData,
  mergeData,
} from "../../store/trackerSlice";
import { exportJSON, clearAllData, parseImportFile } from "../../utils/data";
import type { ImportMode, ImportResult } from "../../utils/data";
import type { Cost, CostCategory } from "../../types";
import { COST_CATEGORIES } from "../../config/constants";
import { v4 as uuidv4 } from "uuid";

const SettingsPage: FC = () => {
  const dispatch = useAppDispatch();
  const trackerState = useAppSelector((s) => s.tracker);
  const { bundles, items } = trackerState;
  const defaultMarginPercent = trackerState.config.defaultMarginPercent;
  const defaultSaleCosts = trackerState.config.defaultSaleCosts ?? [];

  const [value, setValue] = useState(String(defaultMarginPercent));
  const [localCosts, setLocalCosts] = useState<Cost[]>(defaultSaleCosts);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [confirmWipe, setConfirmWipe] = useState(false);

  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importParsed, setImportParsed] = useState<ImportResult["data"] | null>(null);
  const [importStatus, setImportStatus] = useState<"success" | "error" | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    value !== String(defaultMarginPercent) ||
    JSON.stringify(localCosts) !== JSON.stringify(defaultSaleCosts);

  const availableCategories = COST_CATEGORIES.filter(
    (cat) => !localCosts.find((d) => d.category === cat.value),
  );

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError("Enter a value between 0 and 100");
      return;
    }
    dispatch(setDefaultMargin(parsed));
    dispatch(setDefaultSaleCosts(localCosts));
    setSaved(true);
    setError("");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    setImportParsed(null);
    setImportStatus(null);
    setImportMessage("");
    const result = await parseImportFile(file);
    setImportResult(result);
    if (result.ok) setImportParsed(result.data ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = () => {
    if (!importParsed) return;
    try {
      if (importMode === "replace") {
        dispatch(
          replaceData({
            bundles: importParsed.bundles,
            items: importParsed.items,
            config: importParsed.config ?? trackerState.config,
          }),
        );
        setImportStatus("success");
        setImportMessage("All data replaced.");
      } else {
        const existingBundleIds = new Set(bundles.map((b) => b.id));
        const existingItemIds = new Set(items.map((i) => i.id));
        const newBundles = importParsed.bundles.filter((b) => !existingBundleIds.has(b.id)).length;
        const newItems = importParsed.items.filter((i) => !existingItemIds.has(i.id)).length;

        dispatch(
          mergeData({
            bundles: importParsed.bundles,
            items: importParsed.items,
          }),
        );

        setImportStatus("success");
        setImportMessage(
          newBundles === 0 && newItems === 0
            ? "Nothing new — all entries already exist."
            : `Added ${newBundles} bundle${newBundles !== 1 ? "s" : ""} and ${newItems} item${newItems !== 1 ? "s" : ""}.`,
        );
      }
      setTimeout(() => {
        setImportStatus(null);
        setImportMessage("");
      }, 4000);
    } catch {
      setImportStatus("error");
      setImportMessage("Import failed. Please try again.");
      setTimeout(() => {
        setImportStatus(null);
        setImportMessage("");
      }, 4000);
    }
    setImportParsed(null);
    setImportResult(null);
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-1">
        Settings
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Configure your tracker preferences.
      </p>

      {/* Pricing */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 mb-6">
        <div className="px-5 py-4">
          <h2 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
            Pricing
          </h2>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
                Default profit margin
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Applied to all items when calculating minimum sale price. Changing this updates all
                existing items immediately.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setSaved(false);
                  setError("");
                }}
                className="w-20 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
              Default sale costs
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Pre-filled on every new sale. Editable before confirming.
            </p>
          </div>

          {localCosts.length > 0 && (
            <div className="space-y-2">
              {localCosts.map((cost, i) => {
                const meta = COST_CATEGORIES.find((c) => c.value === cost.category);
                if (!meta) return null;
                return (
                  <div key={cost.id} className="flex items-center gap-3">
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                      {meta.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">£</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={cost.amount}
                        onChange={(e) => {
                          const updated = [...localCosts];
                          updated[i] = { ...cost, amount: parseFloat(e.target.value) || 0 };
                          setLocalCosts(updated);
                        }}
                        className="w-20 px-2 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                      />
                    </div>
                    <button
                      onClick={() => setLocalCosts(localCosts.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {availableCategories.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const cat = e.target.value as CostCategory;
                const label = COST_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
                setLocalCosts([...localCosts, { id: uuidv4(), label, category: cat, amount: 0 }]);
              }}
              className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            >
              <option value="" disabled>
                + Add a cost...
              </option>
              {availableCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="px-5 py-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
          {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Saved</span>}
        </div>
      </div>

      {/* Export / Import */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 mb-6">
        <div className="px-5 py-4">
          <h2 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
            Export / Import
          </h2>
        </div>

        {/* Export JSON */}
        <div className="px-5 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
              Export backup
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Full JSON backup of all bundles, items, and settings. Use this to restore or migrate
              your data.
            </p>
          </div>
          <button
            onClick={() => exportJSON(trackerState)}
            disabled={bundles.length === 0 && items.length === 0}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Download JSON
          </button>
        </div>

        {/* Import JSON */}
        <div className="px-5 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
              Import backup
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Restore from a JSON backup. Choose whether to replace all existing data or merge new
              entries alongside it.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {!importParsed ? (
              <label className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                Choose file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="flex flex-col items-end gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {importParsed.bundles.length} bundle{importParsed.bundles.length !== 1 ? "s" : ""}
                  , {importParsed.items.length} item{importParsed.items.length !== 1 ? "s" : ""}
                </span>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex gap-2">
                    {(["replace", "merge"] as ImportMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setImportMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                          importMode === mode
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {importMode === "replace"
                      ? "Overwrites all current data"
                      : "Adds new entries, skips duplicates"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImport}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                  >
                    {importMode === "replace" ? "Replace" : "Merge"}
                  </button>
                  <button
                    onClick={() => {
                      setImportParsed(null);
                      setImportResult(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {importStatus === "success" && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                ✓ {importMessage}
              </span>
            )}
            {(importStatus === "error" || (importResult && !importResult.ok)) && (
              <p className="text-xs text-red-500">
                {importStatus === "error" ? importMessage : importResult?.error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900 divide-y divide-red-100 dark:divide-red-900">
        <div className="px-5 py-4">
          <h2 className="font-heading font-semibold text-sm text-red-600 dark:text-red-400">
            Danger zone
          </h2>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
                Clear all data
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Permanently deletes all bundles, items, and settings. This cannot be undone.
              </p>
            </div>
            {!confirmWipe ? (
              <button
                onClick={() => setConfirmWipe(true)}
                className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                Clear data
              </button>
            ) : (
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Are you sure?</span>
                <button
                  onClick={clearAllData}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Yes, wipe
                </button>
                <button
                  onClick={() => setConfirmWipe(false)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SettingsPage);
