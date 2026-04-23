import type { CostCategoryOption } from "../types";

export const COST_CATEGORIES: CostCategoryOption[] = [
  { value: "car_boot_entry", label: "Car Boot Entry",  hint: "Entry fee for the car boot / market" },
  { value: "postage",        label: "Postage",          hint: "Postage paid to receive or send an item" },
  { value: "travel",         label: "Travel",           hint: "Cost of getting to the source" },
  { value: "parking",        label: "Parking",          hint: "Parking at the venue" },
  { value: "cleaning",       label: "Cleaning",         hint: "Cost to clean or restore an item" },
  { value: "packaging",      label: "Packaging",        hint: "Bags, boxes, bubble wrap etc." },
  { value: "other_purchase", label: "Other",            hint: "Any other upfront cost before selling" },
];
