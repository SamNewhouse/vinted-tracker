import type { CostCategoryOption, ExtraCostCategory } from "../types";

export const COST_CATEGORIES: CostCategoryOption[] = [
  { value: "postage",        label: "Postage",     hint: "Postage paid to receive/send" },
  { value: "car_boot_entry", label: "Car boot entry", hint: "Entry fee for the car boot / market" },
  { value: "packaging",      label: "Packaging",      hint: "Bags, boxes, bubble wrap etc." },
  { value: "platform_fee",   label: "Platform fee",   hint: "Buying platform fee" },
  { value: "repair",         label: "Repair",         hint: "Cost to repair or restore an item" },
  { value: "cleaning",       label: "Cleaning",       hint: "Cleaning products or service" },
  { value: "other",          label: "Other",          hint: "Any other upfront cost before selling" },
];

export const COST_CATEGORY_LABELS: Record<ExtraCostCategory, string> = {
  postage: "Postage",
  packaging: "Packaging",
  car_boot_entry: "Car Boot Entry",
  platform_fee: "Platform Fee",
  repair: "Repair / Alteration",
  cleaning: "Cleaning",
  other: "Other",
};
