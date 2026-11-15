import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createService, deleteService } from "@/services/catalog.service";

const serviceResponse = {
  data: {
    id: "service-test",
    code: "service-test",
    name: "Test service",
    description: "Description",
    nameFr: "Service de test",
    nameAr: "خدمة تجريبية",
    descriptionFr: "Description",
    descriptionAr: "وصف",
    price: 199,
    currency: "MAD",
    active: true,
    leadTimeHours: 24,
    imageUrl: null,
  },
};

describe("createService API request", () => {
  beforeEach(() => {
    sessionStorage.setItem("maplak_admin_token", "test-admin-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => serviceResponse,
    }));
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("posts JSON fields when no image is selected", async () => {
    await createService({
      code: "service-test",
      nameFr: "Service de test",
      nameAr: "خدمة تجريبية",
      descriptionFr: "Description",
      descriptionAr: "وصف",
      price: 199,
      leadTimeHours: 24,
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/v1/admin/services");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-admin-token");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      code: "service-test",
      name_fr: "Service de test",
      name_ar: "خدمة تجريبية",
      price: 199,
      lead_time_hours: 24,
      currency: "MAD",
      is_active: true,
    });
  });

  it("posts multipart fields and an image with Laravel-compatible boolean values", async () => {
    const image = new File(["synthetic image bytes"], "service.png", { type: "image/png" });
    await createService({
      code: "service-test",
      nameFr: "Service de test",
      nameAr: "خدمة تجريبية",
      descriptionFr: "Description",
      descriptionAr: "وصف",
      price: 199,
      leadTimeHours: 24,
      image,
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = init?.body as FormData;
    expect(url).toBe("/api/v1/admin/services");
    expect(init?.method).toBe("POST");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("name_fr")).toBe("Service de test");
    expect(body.get("name_ar")).toBe("خدمة تجريبية");
    expect(body.get("price")).toBe("199");
    expect(body.get("lead_time_hours")).toBe("24");
    expect(body.get("is_active")).toBe("1");
    expect(body.get("image")).toBe(image);
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
  });
});

describe("deleteService API request", () => {
  beforeEach(() => {
    sessionStorage.setItem("maplak_admin_token", "test-admin-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: "Service permanently deleted.", deleted: true, deactivated: false }),
    }));
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("sends an authenticated DELETE request and returns the backend result", async () => {
    await expect(deleteService("service-test")).resolves.toMatchObject({ deleted: true, deactivated: false });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/v1/admin/services/service-test");
    expect(init?.method).toBe("DELETE");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer test-admin-token");
  });
});
