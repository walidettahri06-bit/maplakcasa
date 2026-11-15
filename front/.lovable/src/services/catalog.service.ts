import { adminRequest, apiRequest, payload } from "@/services/admin-api";
import type { PlateService, ServiceId } from "@/types";

async function mapServices(result: {data: any[]}) {
  return result.data.map(s => ({ id: s.code as ServiceId, price: Number(s.price), active: Boolean(s.active), leadTimeHours: Number(s.leadTimeHours), name: s.name, description: s.description, nameFr: s.nameFr, nameAr: s.nameAr, descriptionFr: s.descriptionFr, descriptionAr: s.descriptionAr, imageUrl: s.imageUrl }));
}
export async function getServices(): Promise<PlateService[]> { return mapServices(await apiRequest<{data: any[]}>("/services")); }
export async function getAdminServices(): Promise<PlateService[]> { return mapServices(await adminRequest<{data: any[]}>("/admin/services")); }
export async function deleteService(id: ServiceId): Promise<{ message: string; deleted: boolean; deactivated: boolean }> {
  return adminRequest(`/admin/services/${encodeURIComponent(id)}`, { method: "DELETE" });
}
export async function updateService(id: ServiceId, patch: Partial<Omit<PlateService, "id">> & { image?: File }): Promise<PlateService> {
  const body = serviceBody(patch);
  if (body instanceof FormData) body.append("_method", "PATCH");
  const raw = payload(await adminRequest<{data: any}>(`/admin/services/${id}`, { method: body instanceof FormData ? "POST" : "PATCH", body }));
  return mapService(raw);
}
function serviceBody(service: Record<string, any>): BodyInit {
  const fields: Record<string, string | number | boolean | undefined> = { code: service.code, name_fr: service.nameFr, name_ar: service.nameAr, description_fr: service.descriptionFr, description_ar: service.descriptionAr, price: service.price, lead_time_hours: service.leadTimeHours, currency: "MAD", is_active: service.active };
  if (service.image instanceof File) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) form.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
    }
    form.append("image", service.image);
    return form;
  }
  return JSON.stringify(Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)));
}
function mapService(raw: any): PlateService {
  return { id: raw.code as ServiceId, price: Number(raw.price), active: Boolean(raw.active), leadTimeHours: Number(raw.leadTimeHours), name: raw.name, description: raw.description, nameFr: raw.nameFr, nameAr: raw.nameAr, descriptionFr: raw.descriptionFr, descriptionAr: raw.descriptionAr, imageUrl: raw.imageUrl };
}
export async function createService(service: {code: string; nameFr: string; nameAr: string; descriptionFr: string; descriptionAr: string; price: number; leadTimeHours: number; image?: File}) {
  const body = serviceBody({ ...service, active: true });
  const raw = payload(await adminRequest<{data: any}>("/admin/services", { method: "POST", body }));
  return mapService(raw);
}
