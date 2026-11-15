import { queryOptions } from "@tanstack/react-query";
import { getServices } from "@/services/catalog.service";
import { getDashboardStats, getOrder, getOrderHistory, getOrders } from "@/services/orders.service";
import { getPayments, getDeliveries } from "@/services/orders.service";
import { getAdminServices } from "@/services/catalog.service";

export const queryKeys = {
  services: ["services"] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
  orderHistory: (id: string) => ["orders", id, "history"] as const,
  stats: ["dashboard-stats"] as const,
  payments: ["admin-payments"] as const,
  deliveries: ["admin-deliveries"] as const,
  adminServices: ["admin-services"] as const,
  adminMe: ["admin-me"] as const,
};

export const servicesQuery = queryOptions({
  queryKey: queryKeys.services,
  queryFn: getServices,
  staleTime: 60_000,
});

export const ordersQuery = queryOptions({ queryKey: queryKeys.orders, queryFn: getOrders });

export const orderQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.order(id), queryFn: () => getOrder(id) });
export const orderHistoryQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.orderHistory(id), queryFn: () => getOrderHistory(id) });

export const statsQuery = queryOptions({ queryKey: queryKeys.stats, queryFn: getDashboardStats });
export const paymentsQuery = queryOptions({ queryKey: queryKeys.payments, queryFn: getPayments });
export const deliveriesQuery = queryOptions({ queryKey: queryKeys.deliveries, queryFn: getDeliveries });
export const adminServicesQuery = queryOptions({ queryKey: queryKeys.adminServices, queryFn: getAdminServices });
