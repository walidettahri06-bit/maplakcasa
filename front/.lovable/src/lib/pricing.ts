import { businessConfig } from "@/config/business";
import type { CartItem, OrderTotals, PlateService } from "@/types";

export interface PricingRules {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

const defaultRules: PricingRules = {
  deliveryFee: businessConfig.deliveryFee,
  freeDeliveryThreshold: businessConfig.freeDeliveryThreshold,
};

/** Single source of truth for order totals (wizard, summary, admin). */
export function calculateTotals(
  items: CartItem[],
  catalog: PlateService[],
  rules: PricingRules = defaultRules,
): OrderTotals {
  let subtotal = 0;
  let itemCount = 0;
  for (const item of items) {
    const service = catalog.find((s) => s.id === item.serviceId);
    if (!service || item.quantity <= 0) continue;
    subtotal += service.price * item.quantity;
    itemCount += item.quantity;
  }
  const deliveryFee =
    itemCount === 0 || subtotal >= rules.freeDeliveryThreshold ? 0 : rules.deliveryFee;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee, itemCount };
}
