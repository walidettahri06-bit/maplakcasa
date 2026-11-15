import { generateSampleOrders } from "@/data/orders";
import { defaultServices } from "@/data/services";
import type { Order, PlateService } from "@/types";

/**
 * In-memory stand-in for the MySQL database. Lives only in the browser tab
 * (reset on reload). Never stores real document files — only file names.
 */
export const mockDb: { orders: Order[]; services: PlateService[] } = {
  orders: generateSampleOrders(),
  services: structuredClone(defaultServices),
};
