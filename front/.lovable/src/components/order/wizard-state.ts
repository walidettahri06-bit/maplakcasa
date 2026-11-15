import type { CartItem, DocumentType, GeoPoint, PaymentMethod, ServiceId } from "@/types";
import { customerSchema, deliverySchema, fieldErrors, plateSchema } from "@/lib/validation";

export interface UploadedDoc {
  name: string;
  sizeKb: number;
  kind: "image" | "pdf";
  file: File;
  previewUrl: string | null;
}

export interface WizardState {
  customer: { fullName: string; phone: string; email: string };
  plate: { serial: string; letter: string; region: string };
  quantities: Record<ServiceId, number>;
  documents: Record<DocumentType, UploadedDoc | null>;
  delivery: { address: string; neighborhood: string; instructions: string; location: GeoPoint | null };
  paymentMethod: PaymentMethod;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export type Errors = Record<string, string>;

export const documentTypes: DocumentType[] = ["cin_front", "cin_back", "carte_grise"];

export function initialWizardState(service?: ServiceId): WizardState {
  const quantities: Record<ServiceId, number> = { front: 0, rear: 0, pair: 0 };
  quantities[service ?? "pair"] = 1;
  return {
    customer: { fullName: "", phone: "", email: "" },
    plate: { serial: "", letter: "", region: "" },
    quantities,
    documents: { cin_front: null, cin_back: null, carte_grise: null },
    delivery: { address: "", neighborhood: "", instructions: "", location: null },
    paymentMethod: "cod",
    acceptTerms: false,
    acceptPrivacy: false,
  };
}

export function cartItems(state: WizardState): CartItem[] {
  return (Object.entries(state.quantities) as [ServiceId, number][])
    .filter(([, q]) => q > 0)
    .map(([serviceId, quantity]) => ({ serviceId, quantity }));
}

/** Returns error keys (i18n) for the given step; empty object = step valid. */
export function validateStep(step: number, s: WizardState): Errors {
  const errors: Errors = {};
  if (step === 0) {
    Object.assign(errors, fieldErrors(customerSchema.safeParse(s.customer)));
  }
  if (step === 1) {
    if (cartItems(s).length === 0) errors["services"] = "validation.servicesRequired";
    const plate = fieldErrors(plateSchema.safeParse(s.plate));
    for (const [k, v] of Object.entries(plate)) errors[`plate.${k}`] = v as string;
  }
  if (step === 2) {
    for (const d of documentTypes) if (!s.documents[d]) errors[`doc.${d}`] = "validation.fileRequired";
    Object.assign(errors, fieldErrors(deliverySchema.safeParse(s.delivery)));
  }
  if (step === 3) {
    if (!s.acceptTerms) errors["acceptTerms"] = "validation.terms";
    if (!s.acceptPrivacy) errors["acceptPrivacy"] = "validation.terms";
  }
  return errors;
}
