import type { ImportedListing, Item, ListingChange } from "../../types";

/**
 * What importing a listing would do to the item already imported from it, if any.
 * A sold item is never changed back: re-importing only moves items forward
 * (unlisted → listed → sold) or updates a listed item's price.
 */
export const listingChange = (listing: ImportedListing, item: Item | undefined): ListingChange => {
  if (!item) return "new";
  if (item.status === "sold") return "unchanged";
  if (listing.status === "sold") return "update";
  return item.status === "listed" && item.listedPrice === listing.price ? "unchanged" : "update";
};
