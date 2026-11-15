import { z } from "zod";
import { businessConfig } from "@/config/business";

/** Strip spaces, dots, dashes and parentheses from a phone input. */
export function normalizePhone(input: string): string {
  return input.replace(/[\s.\-()]/g, "");
}

/**
 * Moroccan mobile & landline numbers: 06/07/05 + 8 digits,
 * or the international forms +212 / 00212 without the leading 0.
 */
export function isMoroccanPhone(input: string): boolean {
  return /^(?:\+212|00212|0)[5-7]\d{8}$/.test(normalizePhone(input));
}

/** Formats a valid number as "06 12 34 56 78". */
export function formatMoroccanPhone(input: string): string {
  const n = normalizePhone(input).replace(/^(?:\+212|00212)/, "0");
  return n.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
}

/** Error messages are i18n keys resolved by the UI. */
export const customerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "validation.nameMin")
    .max(80, "validation.nameMax")
    .regex(/^[\p{L}\s'.-]+$/u, "validation.nameChars"),
  phone: z.string().trim().refine(isMoroccanPhone, "validation.phone"),
  email: z
    .string()
    .trim()
    .max(120, "validation.emailMax")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "validation.email"),
});

export const plateSchema = z.object({
  serial: z.string().regex(/^\d{1,5}$/, "validation.plateSerial"),
  letter: z.string().min(1, "validation.plateLetter"),
  region: z
    .string()
    .regex(/^\d{1,2}$/, "validation.plateRegion")
    .refine((v) => Number(v) >= 1 && Number(v) <= 89, "validation.plateRegion"),
});

export const deliverySchema = z.object({
  address: z.string().trim().min(8, "validation.addressMin").max(200, "validation.addressMax"),
  neighborhood: z.string().min(1, "validation.neighborhood"),
  instructions: z.string().trim().max(300, "validation.instructionsMax"),
});

export type UploadError = "validation.fileType" | "validation.fileSize";

export function validateUpload(file: { type: string; size: number }): UploadError | null {
  if (!(businessConfig.acceptedUploadTypes as readonly string[]).includes(file.type)) {
    return "validation.fileType";
  }
  if (file.size > businessConfig.maxUploadSizeMb * 1024 * 1024) return "validation.fileSize";
  return null;
}

/** Collects the first error key per field from a zod result. */
export function fieldErrors<T extends string>(
  result: z.SafeParseReturnType<unknown, unknown>,
): Partial<Record<T, string>> {
  if (result.success) return {};
  const out: Partial<Record<T, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as T | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
