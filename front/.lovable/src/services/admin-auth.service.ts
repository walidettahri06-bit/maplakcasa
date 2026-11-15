import { adminRequest, apiRequest, clearAdminToken, payload, setAdminToken } from "@/services/admin-api";
export type AdminUser = { name: string; email: string };
export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const result = payload(await apiRequest<{data:{token:string;user:AdminUser}}>("/admin/login", { method: "POST", body: JSON.stringify({ email: email.trim().toLowerCase(), password }) }));
  setAdminToken(result.token); return result.user;
}
export async function getAdminMe(): Promise<AdminUser> { return payload(await adminRequest<{data:AdminUser}>("/admin/me")); }
export async function logoutAdmin() { try { await adminRequest("/admin/logout", { method: "POST" }); } finally { clearAdminToken(); } }
