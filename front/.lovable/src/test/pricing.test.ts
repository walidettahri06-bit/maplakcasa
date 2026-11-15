import { describe, expect, it } from "vitest";
import { defaultServices } from "@/data/services";
import { calculateTotals } from "@/lib/pricing";

const rules = { deliveryFee: 30, freeDeliveryThreshold: 300 };

describe("calculateTotals", () => {
  it("adds the delivery fee below the free-delivery threshold", () => {
    const t = calculateTotals([{ serviceId: "front", quantity: 1 }], defaultServices, rules);
    expect(t).toEqual({ subtotal: 150, deliveryFee: 30, total: 180, itemCount: 1 });
  });

  it("makes delivery free once the subtotal reaches the threshold", () => {
    const t = calculateTotals(
      [
        { serviceId: "front", quantity: 1 },
        { serviceId: "rear", quantity: 1 },
      ],
      defaultServices,
      rules,
    );
    expect(t.subtotal).toBe(300);
    expect(t.deliveryFee).toBe(0);
    expect(t.total).toBe(300);
  });

  it("multiplies unit price by quantity", () => {
    const t = calculateTotals([{ serviceId: "pair", quantity: 2 }], defaultServices, rules);
    expect(t.subtotal).toBe(398);
  });

  it("charges nothing for an empty cart", () => {
    expect(calculateTotals([], defaultServices, rules).total).toBe(0);
  });

  it("uses the catalog price, so price edits update totals", () => {
    const catalog = defaultServices.map((s) => (s.id === "front" ? { ...s, price: 200 } : s));
    expect(calculateTotals([{ serviceId: "front", quantity: 1 }], catalog, rules).subtotal).toBe(200);
  });
});
