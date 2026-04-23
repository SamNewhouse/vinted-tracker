"use client";
import { FC, memo } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectFilteredBundles } from "../../store/selectors";
import { deleteBundle, setActiveBundleId, setView } from "../../store/trackerSlice";
import BundleCard from "../2-molecules/BundleCard";
import Button from "../1-atoms/Button";
import EmptyState from "../1-atoms/EmptyState";

const BundleList: FC = () => {
  const dispatch = useAppDispatch();
  const bundles = useAppSelector(selectFilteredBundles);

  const handleView = (id: string) => {
    dispatch(setActiveBundleId(id));
    dispatch(setView("bundle-detail"));
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this bundle and all its items? This cannot be undone.")) {
      dispatch(deleteBundle(id));
    }
  };

  if (bundles.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No bundles yet"
        description="Add your first purchase bundle to start tracking costs and calculating minimum sale prices."
        action={<Button onClick={() => dispatch(setView("add-bundle"))}>Add First Bundle</Button>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {bundles.map((bundle) => (
        <BundleCard key={bundle.id} bundle={bundle} onView={handleView} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default memo(BundleList);
