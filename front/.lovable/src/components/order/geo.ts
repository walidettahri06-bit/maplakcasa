import { businessConfig } from "@/config/business";
import type { GeoPoint } from "@/types";

export function isInCasablanca(point: GeoPoint): boolean {
  const { north, south, west, east } = businessConfig.cityBounds;
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
    && point.lat <= north && point.lat >= south
    && point.lng >= west && point.lng <= east;
}
