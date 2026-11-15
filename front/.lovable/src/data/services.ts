import type { PlateService } from "@/types";

/** Default catalog. Prices in MAD. Editable from the admin (mock) and later from the API. */
export const defaultServices: PlateService[] = [
  { id: "front", price: 150, active: true, leadTimeHours: 24 },
  { id: "rear", price: 150, active: true, leadTimeHours: 24 },
  { id: "pair", price: 199, active: true, leadTimeHours: 24 },
];
