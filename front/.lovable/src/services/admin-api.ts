import { ApiError } from "@/services/http";

const CONFIGURED_API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const API_URL = typeof window === "undefined" ? CONFIGURED_API_URL : import.meta.env.DEV ? "/api/v1" : CONFIGURED_API_URL;
const TOKEN_KEY = "maplak_admin_token";
export const getAdminToken = () => typeof window === "undefined" ? null : sessionStorage.getItem(TOKEN_KEY);
export const clearAdminToken = () => { if (typeof window !== "undefined") sessionStorage.removeItem(TOKEN_KEY); };
export const setAdminToken = (token: string) => { if (typeof window !== "undefined") sessionStorage.setItem(TOKEN_KEY, token); };
export async function apiRequest<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Accept-Language", typeof window !== "undefined" && window.localStorage.getItem("maplak.lang") === "ar" ? "ar" : "fr");
  const token = authenticated ? getAdminToken() : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let url: string;
  if (/^https?:\/\//.test(path)) {
    const parsed = new URL(path);
    url = import.meta.env.DEV && parsed.pathname.startsWith("/api/v1/") ? `${parsed.pathname}${parsed.search}` : path;
  } else {
    url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  }
  const response = await fetch(url, { ...init, headers, credentials: "omit" });
  if (response.status === 401 && authenticated) clearAdminToken();
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const validationErrors = Object.fromEntries(
      Object.entries(body?.errors ?? {}).map(([field, messages]) => [
        field,
        Array.isArray(messages) ? messages.map(String) : [String(messages)],
      ]),
    );
    const message = String(body?.message || `API ${response.status}`);
    const details = Object.entries(validationErrors)
      .map(([field, messages]) => `${field}: ${messages.join(" ")}`)
      .join("; ");
    const method = (init.method ?? "GET").toUpperCase();
    const endpoint = `${method} ${new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.origin).pathname}`;
    throw new ApiError(
      response.status === 422 && details ? `${endpoint} — ${details}` : message,
      response.status,
      validationErrors,
      endpoint,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> { return apiRequest<T>(path, init, true); }
export function payload<T>(result: { data: T }): T { return result.data; }
export async function allPages<T>(path: string): Promise<T[]> {
  const rows: T[] = [];
  let url: string | null = `${path}${path.includes("?") ? "&" : "?"}per_page=100`;
  while (url) {
    const result: any = await adminRequest<any>(url);
    rows.push(...(result.data ?? []));
    url = result.links?.next ?? null;
    if (url?.startsWith(API_URL)) url = url.slice(API_URL.length);
  }
  return rows;
}
