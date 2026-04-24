"use client";
import { FC, memo } from "react";
import { useAppSelector } from "../../store/hooks";
import DashboardLayout from "../4-layouts/DashboardLayout";
import DashboardPage from "./DashboardPage";
import BundlesPage from "./BundlesPage";
import BundleDetailPage from "./BundleDetailPage";
import AddBundleForm from "../3-organisms/AddBundleForm";
import ItemsPage from "./ItemsPage";
import SettingsPage from "./SettingsPage";
import AddItemForm from "../3-organisms/AddItemForm";

const HomePage: FC = () => {
  const view = useAppSelector((s) => s.tracker.view);

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <DashboardPage />;
      case "items":
        return <ItemsPage />;
      case "add-item":
        return <AddItemForm />;
      case "bundles":
        return <BundlesPage />;
      case "add-bundle":
        return <AddBundleForm />;
      case "bundle-detail":
        return <BundleDetailPage />;
      case "settings":
        return <SettingsPage />;
      // case "analytics":
      //   return (
      //     <div className="flex flex-col items-center justify-center py-20 text-center">
      //       <span className="text-5xl mb-4">📊</span>
      //       <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-2">
      //         Analytics coming next
      //       </h2>
      //       <p className="text-sm text-slate-500 dark:text-slate-400">
      //         Charts and trend data will appear here.
      //       </p>
      //     </div>
      //   );
      default:
        return <DashboardPage />;
    }
  };

  return <DashboardLayout>{renderView()}</DashboardLayout>;
};

export default memo(HomePage);
