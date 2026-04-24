"use client";
import { FC, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setDefaultMargin } from "../../store/trackerSlice";

const SettingsPage: FC = () => {
  const dispatch = useAppDispatch();
  const defaultMarginPercent = useAppSelector((s) => s.tracker.config.defaultMarginPercent);
  const [value, setValue] = useState(String(defaultMarginPercent));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isDirty = value !== String(defaultMarginPercent);

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError("Enter a value between 0 and 100");
      return;
    }
    dispatch(setDefaultMargin(parsed));
    setSaved(true);
    setError("");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setSaved(false);
    setError("");
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-1">
        Settings
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Configure your tracker preferences.
      </p>

      {/* Pricing section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        <div className="px-5 py-4">
          <h2 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
            Pricing
          </h2>
        </div>

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
                onChange={handleChange}
                className="w-20 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save changes
            </button>
            {saved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Saved</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SettingsPage);
