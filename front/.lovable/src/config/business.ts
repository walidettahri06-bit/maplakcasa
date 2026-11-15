/**
 * Business configuration. Every price-related constant lives here or in
 * src/data/services.ts — components must never hardcode amounts.
 * Later these values can come from GET /api/settings on the Laravel API.
 */
export const businessConfig = {
  brand: "MaPlak Casa",
  currency: "MAD",
  city: "Casablanca",
  /** Flat home delivery + installation fee in MAD */
  deliveryFee: 0,
  /** Orders with a subtotal at or above this amount get free delivery */
  freeDeliveryThreshold: 0,
  maxQuantityPerService: 4,
  whatsappNumber: "212674486969",
  phoneDisplay: "06 74 48 69 69",
  email: "contact@maplak.ma",
  openingHours: "Lun – Sam · 9h – 20h",
  /** Casablanca bounding box used by the GPS picker */
  cityBounds: { north: 33.64, south: 33.5, west: -7.72, east: -7.48 },
  cityCenter: { lat: 33.5731, lng: -7.5898 },
  maxUploadSizeMb: 5,
  acceptedUploadTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;

export type BusinessConfig = typeof businessConfig;
