import type { BundleSource, CostCategory } from "../types";

export const COST_CATEGORIES: { value: CostCategory; label: string; hint: string }[] = [
  { value: "postage", label: "Postage", hint: "Postage paid to receive or send an item" },
  { value: "admission", label: "Admission", hint: "Entry fee for a car boot / market" },
  { value: "travel", label: "Travel", hint: "Cost of getting to the source" },
  { value: "parking", label: "Parking", hint: "Parking at the venue" },
  { value: "cleaning", label: "Cleaning", hint: "Cost to clean or restore an item" },
  { value: "packaging", label: "Packaging", hint: "Bags, boxes, bubble wrap etc." },
  { value: "other_purchase", label: "Other", hint: "Any other upfront cost before selling" },
];

export const SOURCES: { value: BundleSource; label: string }[] = [
  { value: "vinted", label: "Vinted" },
  { value: "car_boot", label: "Car Boot" },
  { value: "charity_shop", label: "Charity Shop" },
  { value: "ebay", label: "eBay" },
  { value: "facebook_marketplace", label: "Facebook Marketplace" },
  { value: "depop", label: "Depop" },
  { value: "jumble_sale", label: "Jumble Sale" },
  { value: "gumtree", label: "Gumtree" },
  { value: "other", label: "Other" },
];
