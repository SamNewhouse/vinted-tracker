import type { CostCategoryOption, CostCategory } from "../types";

export const COST_CATEGORIES: CostCategoryOption[] = [
  { value: "postage", label: "Postage", hint: "Postage paid to receive/send" },
  { value: "car_boot_entry", label: "Car boot entry", hint: "Entry fee for the car boot / market" },
  { value: "packaging", label: "Packaging", hint: "Bags, boxes, bubble wrap etc." },
  { value: "other_purchase", label: "Platform fee", hint: "Buying platform fee" },
  { value: "parking", label: "Repair", hint: "Cost to repair or restore an item" },
  { value: "fuel", label: "Cleaning", hint: "Cleaning products or service" },
  { value: "other_purchase", label: "Other", hint: "Any other upfront cost before selling" },
];

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  postage: "Postage",
  packaging: "Packaging",
  car_boot_entry: "Car Boot Entry",
  other_purchase: "Other",
  parking: "Parking",
  fuel: "Fuel",
};
