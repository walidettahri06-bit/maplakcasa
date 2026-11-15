import { casablancaNeighborhoods, drivers, plateLetters } from "@/data/neighborhoods";
import { defaultServices } from "@/data/services";
import { calculateTotals } from "@/lib/pricing";
import type {
  CartItem,
  DeliveryStatus,
  DocumentStatus,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types";

/** Deterministic PRNG so SSR and client render the same sample data. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const firstNames = [
  "Yassine", "Salma", "Omar", "Imane", "Mehdi", "Kawtar", "Amine", "Sara", "Hicham", "Nadia",
  "Reda", "Ghita", "Anass", "Meryem", "Othmane", "Zineb", "Ayoub", "Hajar", "Soufiane", "Lina",
];
const lastNames = [
  "El Amrani", "Bennani", "Alaoui", "Tazi", "Berrada", "Chraibi", "El Idrissi", "Fassi",
  "Lahlou", "Benjelloun", "Ouazzani", "Sqalli", "Kettani", "Mansouri", "Naciri",
];
const streets = [
  "Bd Zerktouni", "Rue Ibnou Mounir", "Bd d'Anfa", "Rue Jean Jaurès", "Bd Ghandi",
  "Rue Abou Bakr Seddik", "Bd Massira Al Khadra", "Rue Normandie", "Bd Abdelmoumen", "Rue Ali Abderrazak",
];

export const SAMPLE_NOW = new Date("2026-11-15T12:00:00Z").getTime();

const statusPool: OrderStatus[] = [
  "pending", "documents_review", "documents_review", "confirmed", "in_production",
  "out_for_delivery", "delivered", "delivered", "delivered", "delivered", "cancelled",
];

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)] as T;
}

export function generateSampleOrders(count = 36): Order[] {
  const rand = mulberry32(2611);
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const first = pick(rand, firstNames);
    const last = pick(rand, lastNames);
    const status = i < 3 ? "pending" : pick(rand, statusPool);
    const createdAt = new Date(SAMPLE_NOW - Math.floor(rand() * 14 * 24) * 3600_000 - i * 1800_000);

    const r = rand();
    const items: CartItem[] =
      r < 0.55
        ? [{ serviceId: "pair", quantity: 1 }]
        : r < 0.75
          ? [{ serviceId: "front", quantity: 1 }]
          : r < 0.9
            ? [{ serviceId: "rear", quantity: 1 }]
            : [{ serviceId: "pair", quantity: 2 }];
    const totals = calculateTotals(items, defaultServices);

    const docStatus: DocumentStatus =
      status === "pending" || status === "documents_review"
        ? "pending"
        : status === "cancelled" && rand() < 0.5
          ? "rejected"
          : "approved";

    const method: PaymentMethod = rand() < 0.6 ? "cod" : "bank_transfer";
    const paymentStatus: PaymentStatus =
      status === "cancelled"
        ? method === "bank_transfer"
          ? "refunded"
          : "failed"
        : method === "bank_transfer"
          ? "paid"
          : status === "delivered"
            ? "paid"
            : "pending";

    const deliveryStatus: DeliveryStatus =
      status === "delivered"
        ? "delivered"
        : status === "out_for_delivery"
          ? "in_transit"
          : status === "in_production" || status === "confirmed"
            ? "scheduled"
            : status === "cancelled"
              ? "failed"
              : "unscheduled";

    const ref = `MPC-${String(2611 - Math.floor(i / 8)).padStart(4, "0")}-${String(240 - i).padStart(4, "0")}`;
    const scheduled = new Date(createdAt.getTime() + 26 * 3600_000).toISOString();
    const phoneDigits = Math.floor(10000000 + rand() * 89999999);

    orders.push({
      id: `ord_${String(240 - i)}`,
      reference: ref,
      createdAt: createdAt.toISOString(),
      status,
      customer: {
        fullName: `${first} ${last}`,
        phone: `0${rand() < 0.6 ? 6 : 7}${phoneDigits}`,
        email:
          rand() < 0.6
            ? `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, "")}@gmail.com`
            : undefined,
      },
      plate: {
        serial: String(Math.floor(1000 + rand() * 98999)),
        letter: pick(rand, plateLetters),
        region: String(pick(rand, [1, 6, 26, 33, 48, 52, 56])),
      },
      items: items.map((it) => ({
        ...it,
        unitPrice: defaultServices.find((s) => s.id === it.serviceId)?.price ?? 0,
      })),
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      delivery: {
        address: `${Math.floor(1 + rand() * 180)}, ${pick(rand, streets)}`,
        neighborhood: pick(rand, casablancaNeighborhoods),
        instructions: rand() < 0.35 ? "Appeler 10 min avant d'arriver" : undefined,
        location: {
          lat: 33.53 + rand() * 0.07,
          lng: -7.68 + rand() * 0.16,
        },
        status: deliveryStatus,
        scheduledFor: deliveryStatus === "unscheduled" ? undefined : scheduled,
        driver: deliveryStatus === "unscheduled" ? undefined : pick(rand, drivers),
      },
      documents: [
        { type: "cin_front", fileName: "cin_recto.jpg", sizeKb: 812, status: docStatus },
        { type: "cin_back", fileName: "cin_verso.jpg", sizeKb: 774, status: docStatus },
        {
          type: "carte_grise",
          fileName: "carte_grise.pdf",
          sizeKb: 1240,
          status: docStatus,
          rejectionReason: docStatus === "rejected" ? "Document illisible" : undefined,
        },
      ],
      payment: {
        method,
        status: paymentStatus,
        amount: totals.total,
        transactionId:
          method === "bank_transfer" ? `TXN-${Math.floor(100000 + rand() * 899999)}` : undefined,
        paidAt: paymentStatus === "paid" ? createdAt.toISOString() : undefined,
      },
    });
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
