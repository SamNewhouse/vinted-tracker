"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setDefaultMargin, setDefaultSaleCosts } from "../../store/trackerSlice";
import type { CostCategory } from "../../types";
import { COST_CATEGORIES } from "../../config/constants";

const SettingsPage: FC = () => {
  const dispatch = useAppDispatch();
  const defaultMarginPercent = useAppSelector((s) => s.tracker.config.defaultMarginPercent);
  const defaultSaleCosts = useAppSelector((s) => s.tracker.config.defaultSaleCosts) ?? [];

  const [value, setValue] = useState(String(defaultMarginPercent));
  const [localCosts, setLocalCosts] = useState(defaultSaleCosts);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="max-w-xl">
      <h1 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-1">
        Settings
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Configure your tracker preferences.
      </p>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <div className="px-5 py-4">
          <h2 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
            Pricing
          </h2>
        </div>

        {/* Default margin */}
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-start justify-between gap-6">
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

        {/* Default sale costs */}
        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">
              Default sale costs
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Pre-filled on every new sale. Editable before confirming.
            </p>
          </div>

          {/* Added rows */}
          {localCosts.length > 0 && (
            <div className="space-y-2">
              {localCosts.map((cost, i) => {
                const meta = COST_CATEGORIES.find((c) => c.value === cost.category);
                if (!meta) return null;
                return (
                  <div key={cost.category} className="flex items-center gap-3">
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

          {/* Dropdown to add */}
          {availableCategories.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const cat = e.target.value as CostCategory;
                setLocalCosts([...localCosts, { category: cat, amount: 0 }]);
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

        {/* Save */}
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
    </div>
  );
};

export default memo(SettingsPage);
