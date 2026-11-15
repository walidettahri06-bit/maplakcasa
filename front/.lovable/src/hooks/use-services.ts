import { useSuspenseQuery } from "@tanstack/react-query";
import { servicesQuery } from "@/services/queries";

/** Service catalog (prices). Routes using it must ensureQueryData(servicesQuery) in their loader. */
export function useServices() {
  return useSuspenseQuery(servicesQuery).data;
}
