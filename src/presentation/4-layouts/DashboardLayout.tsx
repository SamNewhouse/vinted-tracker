"use client";
import { FC, memo, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setView } from "../../store/trackerSlice";
import { ViewMode } from "../../types";

interface Props {
  children: ReactNode;
}

const navItems: { label: string; view: ViewMode; icon: string }[] = [
  { label: "Dashboard", view: "dashboard", icon: "◈" },
  { label: "Items", view: "items", icon: "▤" },
  { label: "Bundles", view: "bundles", icon: "◻" },
  { label: "Analytics", view: "analytics", icon: "◧" },
];

const DashboardLayout: FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector((s) => s.tracker.view);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="VintedTracker">
              <rect width="28" height="28" rx="7" fill="#0f172a" />
              <path
                d="M7 20L11.5 9L14 15.5L16.5 9L21 20"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              VintedTracker
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => dispatch(setView(item.view))}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                currentView === item.view ||
                (currentView === "bundle-detail" && item.view === "bundles") ||
                (currentView === "add-bundle" && item.view === "bundles")
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Add Bundle CTA */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => dispatch(setView("add-bundle"))}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white transition-all"
          >
            + Add Bundle
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-5 md:p-8">
        {/* Mobile top nav */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <span className="font-heading font-bold text-slate-900 dark:text-white">
            VintedTracker
          </span>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => dispatch(setView(item.view))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === item.view
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default memo(DashboardLayout);
