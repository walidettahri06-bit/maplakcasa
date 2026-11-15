/**
 * Transport layer. Today every call resolves against the in-memory mock DB.
 * To connect the Laravel REST API, replace `mockRequest` usages in the
 * *.service.ts files with an Axios instance, e.g.:
 *
 *   export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
 *   export const getOrders = () => api.get<Order[]>("/orders").then((r) => r.data);
 *
 * Function signatures and return types are designed to stay identical.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public validationErrors: Record<string, string[]> = {},
    public endpoint?: string,
  ) {
    super(message);
  }
}

export function mockRequest<T>(resolver: () => T, delayMs = 450): Promise<T> {
  const isServer = typeof window === "undefined";
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        try {
          // structuredClone mimics a network round-trip: callers never mutate the DB.
          resolve(structuredClone(resolver()));
        } catch (e) {
          reject(e instanceof ApiError ? e : new ApiError(String(e), 500));
        }
      },
      isServer ? 0 : delayMs,
    );
  });
}
