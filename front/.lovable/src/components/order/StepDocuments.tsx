import { Lock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { businessConfig } from "@/config/business";
import { casablancaNeighborhoods } from "@/data/neighborhoods";
import { useI18n } from "@/i18n/I18nProvider";
import type { DocumentType } from "@/types";
import { Field, StepHeader } from "./Field";
import { FileUploadField } from "./FileUploadField";
import { LocationPicker } from "./LocationPicker";
import { documentTypes, type Errors, type UploadedDoc, type WizardState } from "./wizard-state";

export function StepDocuments({
  documents,
  delivery,
  errors,
  onDocument,
  onDelivery,
}: {
  documents: WizardState["documents"];
  delivery: WizardState["delivery"];
  errors: Errors;
  onDocument: (type: DocumentType, doc: UploadedDoc | null) => void;
  onDelivery: (patch: Partial<WizardState["delivery"]>) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <StepHeader title={t("order.documents.title")} text={t("order.documents.text")} />
      <div className="mb-6 flex gap-3 rounded-lg border border-info/30 bg-info/5 p-3.5 text-xs leading-relaxed text-foreground">
        <Lock className="mt-0.5 size-4 shrink-0 text-info" />
        {t("order.documents.demoNotice")}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {documentTypes.map((d) => (
          <FileUploadField
            key={d}
            id={`doc-${d}`}
            label={t(`common.documents.${d}`)}
            value={documents[d]}
            error={errors[`doc.${d}`]}
            onChange={(doc) => onDocument(d, doc)}
          />
        ))}
      </div>

      <div className="mt-12 border-t pt-10">
        <StepHeader title={t("order.documents.deliveryTitle")} text={t("order.documents.deliveryText")} />
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="city" label={t("order.documents.city")}>
              <div className="relative">
                <MapPin className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                <Input id="city" value={businessConfig.city} readOnly disabled className="h-12 ps-10 font-semibold" />
              </div>
            </Field>
            <Field id="neighborhood" label={t("order.documents.neighborhood")} error={errors["neighborhood"]}>
              <Select value={delivery.neighborhood} onValueChange={(v) => onDelivery({ neighborhood: v })}>
                <SelectTrigger id="neighborhood" className="!h-12 w-full" aria-invalid={!!errors["neighborhood"]}>
                  <SelectValue placeholder={t("order.documents.neighborhoodPh")} />
                </SelectTrigger>
                <SelectContent>
                  {casablancaNeighborhoods.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field id="address" label={t("order.documents.address")} error={errors["address"]}>
            <Input
              id="address"
              autoComplete="street-address"
              maxLength={200}
              value={delivery.address}
              onChange={(e) => onDelivery({ address: e.target.value })}
              placeholder={t("order.documents.addressPh")}
              aria-invalid={!!errors["address"]}
              className="h-12"
            />
          </Field>
          <Field id="instructions" label={t("order.documents.instructions")} optional error={errors["instructions"]}>
            <Textarea
              id="instructions"
              maxLength={300}
              rows={3}
              value={delivery.instructions}
              onChange={(e) => onDelivery({ instructions: e.target.value })}
              placeholder={t("order.documents.instructionsPh")}
            />
          </Field>
          <LocationPicker
            value={delivery.location}
            address={delivery.address}
            error={errors["location"]}
            onChange={(location) => onDelivery({ location })}
          />
        </div>
      </div>
    </div>
  );
}
