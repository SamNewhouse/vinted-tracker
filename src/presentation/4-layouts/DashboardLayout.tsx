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
  { label: "Add", view: "add", icon: "+" },
  { label: "Settings", view: "settings", icon: "⚙\uFE0E" },
  // { label: "Analytics", view: "analytics", icon: "◧" },
];

const DashboardLayout: FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector((s) => s.tracker.view);

  const isActive = (view: ViewMode) =>
    currentView === view || (currentView === "bundle-detail" && view === "bundles");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-x-hidden">
      {/* Sidebar - desktop only */}
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
                isActive(item.view)
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 w-full overflow-x-hidden p-5 pb-24 md:pb-8 md:p-8">
        {children}
      </main>

      {/* Bottom tab bar - mobile only */}
      <div className="fixed bottom-0 left-0 right-0 flex md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => dispatch(setView(item.view))}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all ${
              isActive(item.view)
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(DashboardLayout);
