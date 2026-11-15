import { describe, expect, it } from "vitest";
import { isMoroccanPhone, validateUpload } from "@/lib/validation";

describe("isMoroccanPhone", () => {
  it.each(["0612345678", "06 12 34 56 78", "+212612345678", "00212712345678", "0522-12-34-56"])(
    "accepts %s",
    (n) => expect(isMoroccanPhone(n)).toBe(true),
  );
  it.each(["0812345678", "061234567", "+33612345678", "06123456789", "abc"])("rejects %s", (n) =>
    expect(isMoroccanPhone(n)).toBe(false),
  );
});

describe("validateUpload", () => {
  it("rejects files over 5 MB", () => {
    expect(validateUpload({ type: "image/jpeg", size: 6 * 1024 * 1024 })).toBe("validation.fileSize");
  });
  it("rejects unsupported types", () => {
    expect(validateUpload({ type: "application/zip", size: 1000 })).toBe("validation.fileType");
  });
  it("accepts a PDF under 5 MB", () => {
    expect(validateUpload({ type: "application/pdf", size: 1000 })).toBeNull();
  });
});
