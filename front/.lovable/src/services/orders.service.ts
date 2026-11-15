import { adminRequest, apiRequest, allPages, payload } from "@/services/admin-api";
import { ApiError } from "@/services/http";
import type { AdminDelivery, CreateOrderPayload, DashboardStats, DeliveryStatus, DocumentStatus, DocumentType, Order, OrderStatus, PaymentStatus } from "@/types";

type ApiOrder = any;
const statusFromApi: Record<string, OrderStatus> = {
  pending: "pending", documents_review: "documents_review", documents_correction: "documents_review",
  documents_validated: "confirmed", in_preparation: "in_production", ready_for_delivery: "in_production",
  out_for_delivery: "out_for_delivery", completed: "delivered", cancelled: "cancelled",
};
const statusToApi: Record<OrderStatus, string> = {
  pending: "pending", documents_review: "documents_review", confirmed: "documents_validated",
  in_production: "in_preparation", out_for_delivery: "out_for_delivery", delivered: "completed", cancelled: "cancelled",
};
const deliveryFromApi: Record<string, DeliveryStatus> = { unscheduled: "unscheduled", scheduled: "scheduled", in_transit: "in_transit", delivered: "delivered", failed: "failed" };
const paymentMethodFromApi = (method: string) => method === "cash_on_delivery" ? "cod" : "bank_transfer";
export function mapOrder(o: ApiOrder): Order {
  return {
    id: o.reference, reference: o.reference, createdAt: o.createdAt, status: statusFromApi[o.status] ?? "pending",
    customer: o.customer ?? { fullName: "", phone: "" }, plate: o.plate ?? { serial: "", letter: "", region: "" },
    items: (o.items ?? []).map((i: any) => ({ serviceId: i.serviceId, serviceName: i.serviceName, quantity: i.quantity, unitPrice: i.unitPrice })),
    subtotal: Number(o.subtotal), deliveryFee: Number(o.deliveryFee), total: Number(o.total),
    delivery: { id: o.delivery?.id, address: o.delivery?.address ?? "", neighborhood: o.delivery?.neighborhood ?? "", instructions: o.delivery?.instructions ?? undefined,
      location: o.delivery?.latitude != null ? { lat: Number(o.delivery.latitude), lng: Number(o.delivery.longitude) } : o.delivery?.location,
      status: deliveryFromApi[o.delivery?.status] ?? "unscheduled", scheduledFor: o.delivery?.scheduledAt ?? undefined, driver: o.delivery?.driver ?? undefined },
    documents: (o.documents ?? []).map((d: any) => ({ id: d.id, type: d.type, fileName: d.originalName ?? d.type, mimeType: d.mimeType, sizeBytes: d.sizeBytes,
      sizeKb: Math.ceil((d.sizeBytes ?? 0) / 1024), status: d.status, rejectionReason: d.reviewNote, contentUrl: d.contentUrl })),
    payment: { id: o.payment?.id, method: paymentMethodFromApi(o.payment?.method ?? "cash_on_delivery"), status: o.payment?.status ?? "pending",
      amount: Number(o.payment?.amount ?? o.total), transactionId: o.payment?.providerReference, paidAt: o.payment?.paidAt ?? undefined },
    notes: o.internalNote ?? undefined,
  };
}
export async function getOrders(): Promise<Order[]> { return (await allPages<ApiOrder>("/admin/orders")).map(mapOrder); }
export async function getOrder(id: string): Promise<Order> { return mapOrder(payload(await adminRequest<{data: ApiOrder}>(`/admin/orders/${encodeURIComponent(id)}`))); }
export async function getOrderHistory(id: string) {
  const response = await adminRequest<{data: any[]}>(`/admin/orders/${encodeURIComponent(id)}/history`);
  return response.data.map(item => ({ ...item, oldStatus: item.oldStatus ? statusFromApi[item.oldStatus] ?? "pending" : null, newStatus: statusFromApi[item.newStatus] ?? "pending" }));
}
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return mapOrder(payload(await adminRequest<{data: ApiOrder}>(`/admin/orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status: statusToApi[status] }) })));
}
export async function updateOrderNote(id: string, note: string): Promise<Order> {
  return mapOrder(payload(await adminRequest<{data: ApiOrder}>(`/admin/orders/${encodeURIComponent(id)}/note`, { method: "PATCH", body: JSON.stringify({ note }) })));
}
export async function getOrderDocuments(id: string) {
  const result = await adminRequest<{data: any[]}>(`/admin/orders/${encodeURIComponent(id)}/documents`);
  return result.data;
}
export async function trackOrder(reference: string, token: string) {
  const response = await apiRequest<{data: any}>("/orders/track", {
    method: "POST",
    body: JSON.stringify({ reference, token }),
  });
  const status = statusFromApi[response.data.status] ?? "pending";
  return { reference: response.data.reference as string, status, deliveryStatus: deliveryFromApi[response.data.deliveryStatus] ?? "unscheduled", createdAt: response.data.createdAt as string, updatedAt: response.data.updatedAt as string };
}
export async function getDocumentBlob(url: string): Promise<string> {
  const token = (await import("@/services/admin-api")).getAdminToken();
  const parsedUrl = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");
  const requestUrl = import.meta.env.DEV && parsedUrl.pathname.startsWith("/api/v1/") ? `${parsedUrl.pathname}${parsedUrl.search}` : url;
  const response = await fetch(requestUrl, { headers: { Authorization: `Bearer ${token}`, Accept: "application/octet-stream" }, cache: "no-store" });
  if (!response.ok) throw new ApiError("Impossible de consulter ce document", response.status);
  return URL.createObjectURL(await response.blob());
}
export async function reviewDocument(documentId: number, status: DocumentStatus, reviewNote?: string) {
  return adminRequest(`/admin/documents/${documentId}`, { method: "PATCH", body: JSON.stringify({ status, review_note: reviewNote }) });
}
export async function updateDelivery(deliveryId: number, patch: { status?: DeliveryStatus; driver?: string; scheduledFor?: string; address?: string; neighborhood?: string; instructions?: string }) {
  const body = { ...(patch.status ? { status: patch.status } : {}), ...(patch.driver !== undefined ? { driver_name: patch.driver } : {}), ...(patch.scheduledFor ? { scheduled_at: patch.scheduledFor } : {}), ...(patch.address !== undefined ? { address: patch.address } : {}), ...(patch.neighborhood !== undefined ? { neighborhood: patch.neighborhood } : {}), ...(patch.instructions !== undefined ? { instructions: patch.instructions } : {}) };
  return adminRequest(`/admin/deliveries/${deliveryId}`, { method: "PATCH", body: JSON.stringify(body) });
}
export async function updatePaymentStatus(paymentId: number, status: PaymentStatus) {
  return adminRequest(`/admin/payments/${paymentId}`, { method: "PATCH", body: JSON.stringify({ status }) });
}
export async function getDashboardStats(): Promise<DashboardStats> {
  const raw = payload(await adminRequest<{data: any}>("/admin/dashboard"));
  const statusCounts = new Map<OrderStatus, number>();
  for (const item of raw.statusBreakdown ?? []) {
    const status = statusFromApi[item.status] ?? "pending";
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + Number(item.count));
  }
  return { revenue: raw.revenue, orders: raw.orders, pendingDocuments: raw.pendingDocuments ?? 0, deliveriesToday: raw.deliveriesToday,
    averageBasket: raw.averageBasket, revenueByDay: raw.revenueByDay, statusBreakdown: [...statusCounts].map(([status, count]) => ({ status, count })) };
}
export async function getPayments() { return (await allPages<any>("/admin/payments")).map(p => ({ ...p, method: paymentMethodFromApi(p.method), orderReference: p.orderReference ?? "", customerName: p.customerName ?? "", transactionId: p.providerReference ?? undefined })); }
export async function getDeliveries(): Promise<AdminDelivery[]> {
  const rows = await allPages<any>("/admin/deliveries");
  return rows.map(d => ({ ...d, status: deliveryFromApi[d.status] ?? "unscheduled" }));
}

export async function createOrder(order: CreateOrderPayload): Promise<Order> {
  const form = new FormData();
  form.append("customer[full_name]", order.customer.fullName);
  form.append("customer[phone]", order.customer.phone);
  if (order.customer.email) form.append("customer[email]", order.customer.email);
  form.append("plate[serial]", order.plate.serial);
  form.append("plate[letter]", order.plate.letter);
  form.append("plate[region]", order.plate.region);
  order.items.forEach((item, index) => {
    form.append(`items[${index}][service_code]`, item.serviceId);
    form.append(`items[${index}][quantity]`, String(item.quantity));
  });
  form.append("delivery[neighborhood]", order.delivery.neighborhood);
  form.append("delivery[address]", order.delivery.address);
  if (order.delivery.instructions) form.append("delivery[instructions]", order.delivery.instructions);
  if (order.delivery.location) {
    form.append("delivery[location][lat]", String(order.delivery.location.lat));
    form.append("delivery[location][lng]", String(order.delivery.location.lng));
  }
  const paymentMethod = order.paymentMethod === "cod" ? "cash_on_delivery" : "bank_transfer";
  form.append("payment_method", paymentMethod);
  form.append("locale", typeof window !== "undefined" && window.localStorage.getItem("maplak.lang") === "ar" ? "ar" : "fr");
  for (const document of order.documents) form.append(`documents[${document.type}]`, document.file, document.fileName);

  const response = await apiRequest<{data: any; meta?: {tracking_token?: string}}>("/orders", { method: "POST", body: form });
  const apiOrder = response.data;
  const created = mapOrder({
    ...apiOrder,
    customer: order.customer,
    plate: order.plate,
    delivery: { ...apiOrder.delivery, ...order.delivery },
    payment: { ...apiOrder.payment, method: paymentMethod },
  });
  if (response.meta?.tracking_token && typeof window !== "undefined") {
    window.sessionStorage.setItem(`maplak_tracking_${created.reference}`, response.meta.tracking_token);
  }
  return created;
}
