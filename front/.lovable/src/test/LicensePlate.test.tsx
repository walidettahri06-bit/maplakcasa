import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LicensePlate } from "@/components/shared/LicensePlate";

describe("LicensePlate", () => {
  it("renders the new Moroccan plate format from the entered values", () => {
    const markup = renderToStaticMarkup(
      createElement(LicensePlate, { plate: { serial: "12345", letter: "ب", region: "00" } }),
    );

    expect(markup).toContain('aria-label="MA | 12345 | ب / B | 00"');
    expect(markup).toContain('dir="ltr"');
    expect(markup).toContain('<bdi dir="rtl"');
    expect(markup).toContain(">MA</span>");
    expect(markup).toContain(">12345</span>");
    expect(markup).toContain(">ب</bdi>");
    expect(markup).toContain(">B</span>");
    expect(markup).toContain(">00</span>");
  });
});
