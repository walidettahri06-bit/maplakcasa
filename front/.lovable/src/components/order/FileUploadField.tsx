import { FileText, ImageUp, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { businessConfig } from "@/config/business";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { validateUpload } from "@/lib/validation";
import type { UploadedDoc } from "./wizard-state";

/** Validates and keeps the selected file for the secure Laravel upload at checkout. */
export function FileUploadField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: UploadedDoc | null;
  error?: string | undefined;
  onChange: (doc: UploadedDoc | null) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (value?.previewUrl) URL.revokeObjectURL(value.previewUrl);
    };
  }, [value?.previewUrl]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const err = validateUpload(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    setBusy(true);
    window.setTimeout(() => {
      const isPdf = file.type === "application/pdf";
      onChange({
        name: file.name,
        sizeKb: Math.max(1, Math.round(file.size / 1024)),
        kind: isPdf ? "pdf" : "image",
        file,
        previewUrl: isPdf ? null : URL.createObjectURL(file),
      });
      setBusy(false);
    }, 700);
  };

  const shownError = localError ?? error;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={businessConfig.acceptedUploadTypes.join(",")}
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value && !busy ? (
        <div className="group relative overflow-hidden rounded-xl border bg-card">
          <div className="flex aspect-[16/10] items-center justify-center bg-muted">
            {value.kind === "image" && value.previewUrl ? (
              <img src={value.previewUrl} alt={label} className="size-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="size-10 text-primary" />
                <span className="text-xs font-semibold">{t("order.documents.pdf")}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t p-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold" dir="ltr">
                {value.name}
              </p>
              <p className="text-[11px] text-muted-foreground">{value.sizeKb} Ko</p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label={t("common.actions.replace")}
              className="flex size-8 items-center justify-center rounded-md hover:bg-muted"
            >
              <RefreshCw className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={t("common.actions.remove")}
              className="flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex aspect-[16/10] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card p-4 text-center transition-colors",
            dragging ? "border-primary bg-accent" : "hover:border-primary/50 hover:bg-muted/50",
            shownError && "border-destructive/60",
          )}
        >
          {busy ? (
            <>
              <Loader2 className="size-7 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{t("order.documents.uploading")}</span>
            </>
          ) : (
            <>
              <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                <ImageUp className="size-5" />
              </span>
              <span className="text-xs font-semibold">{t("order.documents.drop")}</span>
              <span className="text-[11px] text-muted-foreground">JPG · PNG · PDF</span>
            </>
          )}
        </label>
      )}
      {shownError && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {t(`common.${shownError}`)}
        </p>
      )}
    </div>
  );
}
