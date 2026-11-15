import { apiRequest } from "@/services/admin-api";
import type { GeoPoint } from "@/types";

export type AddressSuggestion = GeoPoint & {
  id: string;
  label: string;
};

export async function searchAddressSuggestions(query: string, signal: AbortSignal): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({ q: query });
  const response = await apiRequest<{ data: AddressSuggestion[] }>(
    `/geocoding/suggestions?${params.toString()}`,
    { signal },
  );

  return response.data;
}
