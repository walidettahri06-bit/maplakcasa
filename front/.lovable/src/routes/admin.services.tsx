import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminServicesQuery } from "@/services/queries";
import { updateService } from "@/services/catalog.service";
import { createService, deleteService } from "@/services/catalog.service";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Price } from "@/components/shared/Price";
import {
  AdminPageHeader,
  AdminTableSkeleton,
  QueryError,
  panel,
  useAdminMutation,
  adminHead,
} from "@/components/admin/core";
import type { PlateService } from "@/types";
import { ApiError } from "@/services/http";
import { queryKeys } from "@/services/queries";
export const Route = createFileRoute("/admin/services")({
  component: Services,
  head: () => adminHead("Services & tarifs"),
});
function ServiceCard({ service: s }: { service: PlateService }) {
  const { t, lang } = useI18n();
  const [price, setPrice] = useState(String(s.price));
  const [lead, setLead] = useState(String(s.leadTimeHours));
  const [active, setActive] = useState(s.active);
  const [nameFr, setNameFr] = useState(s.nameFr ?? s.name ?? "");
  const [nameAr, setNameAr] = useState(s.nameAr ?? s.name ?? "");
  const [descriptionFr, setDescriptionFr] = useState(s.descriptionFr ?? s.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(s.descriptionAr ?? s.description ?? "");
  const [image, setImage] = useState<File>();
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  useEffect(() => setImageUnavailable(false), [s.imageUrl]);
  const valid =
    price.trim() !== "" &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 1 &&
    Number(price) <= 10000 &&
    lead.trim() !== "" &&
    Number.isFinite(Number(lead)) &&
    Number(lead) > 0 &&
    Number(lead) <= 720;
  const validService = valid && !!nameFr.trim() && !!nameAr.trim();
  const m = useAdminMutation(
    () =>
      updateService(s.id, {
        price: Number(price),
        leadTimeHours: Number(lead),
        active,
        nameFr,
        nameAr,
        descriptionFr,
        descriptionAr,
        ...(image ? { image } : {}),
      }),
    undefined,
    true,
  );
  const deletion = useMutation({
    mutationFn: () => deleteService(s.id),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.adminServices }),
        queryClient.invalidateQueries({ queryKey: queryKeys.services }),
      ]);
      setDeleteDialogOpen(false);
      toast.success(result.deleted ? t("admin.serviceDeleted") : t("admin.serviceDeactivated"));
    },
    onError: (error) => {
      const message = error instanceof ApiError
        ? error.status === 401 ? t("admin.unauthorizedError")
          : error.status === 403 ? t("admin.forbiddenError")
            : error.status === 409 ? error.message
              : error.status >= 500 ? t("admin.serverError") : error.message
        : t("admin.error");
      toast.error(message);
    },
  });
  return (
    <section className={panel}>
      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="font-semibold">{s.name ?? t(`common.services.${s.id}.name`)}</h2><p className="text-xs text-muted-foreground">{s.id}</p></div>
        <Switch checked={active} onCheckedChange={setActive} aria-label={t("admin.active")} />
      </div>
      <div className="space-y-4">
        {s.imageUrl && (imageUnavailable ? <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/40 text-muted-foreground"><ImageOff className="size-6" /><span className="text-xs">{t("admin.imageUnavailable")}</span></div> : <img src={s.imageUrl} alt={nameFr} onError={() => setImageUnavailable(true)} className="h-32 w-full rounded-lg border object-cover" />)}
        <label className="block space-y-2 text-sm"><span>{t("admin.serviceImage")}</span><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setImage(e.currentTarget.files?.[0])} /></label>
        {[{ key: "nameFr", value: nameFr, set: setNameFr }, { key: "nameAr", value: nameAr, set: setNameAr }].map(field => <label key={field.key} className="block space-y-2 text-sm"><span>{t(`admin.${field.key}`)}</span><Input maxLength={160} value={field.value} onChange={e => field.set(e.target.value)} /></label>)}
        {[{ key: "descriptionFr", value: descriptionFr, set: setDescriptionFr }, { key: "descriptionAr", value: descriptionAr, set: setDescriptionAr }].map(field => <label key={field.key} className="block space-y-2 text-sm"><span>{t(`admin.${field.key}`)}</span><Textarea maxLength={5000} rows={3} value={field.value} onChange={e => field.set(e.target.value)} /></label>)}
        {[
          { key: "price", value: price, set: setPrice, min: 1, max: 10000 },
          { key: "leadTime", value: lead, set: setLead, min: 1, max: 720 },
        ].map((field) => (
          <label key={field.key} className="block space-y-2 text-sm">
            <span>{t(`admin.${field.key}`)}</span>
            <Input
              type="number"
              min={field.min}
              max={field.max}
              step="1"
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
            />
          </label>
        ))}
        {!valid && <p className="text-xs text-destructive">{t("admin.priceValidation")}</p>}
        <Button className="w-full" disabled={!validService || m.isPending} onClick={() => m.mutate()}>
          {m.isPending ? t("admin.saving") : t("common.actions.save")}
        </Button>
      </div>
      <div className="mt-6 rounded-xl border bg-background p-5">
        <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          {t("admin.livePreview")}
        </p>
        <p className="font-medium">{s.name ?? t(`common.services.${s.id}.name`)}</p>
        <p className="my-3 text-3xl font-bold">
          <Price amount={Number.isFinite(Number(price)) ? Number(price) : 0} />
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          {t("admin.hours", { value: lead })} · {t(active ? "admin.active" : "admin.inactive")}
        </p>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => !deletion.isPending && setDeleteDialogOpen(open)}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" className="mt-4 w-full" disabled={deletion.isPending}>
            <Trash2 className="me-2 size-4" aria-hidden="true" />
            {t("admin.deleteService")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.confirmServiceDeletion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.confirmServiceDeletionText", { name: (lang === "ar" ? s.nameAr : s.nameFr) ?? s.name ?? s.id })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletion.isPending}>{t("common.actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletion.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (!deletion.isPending) deletion.mutate();
              }}
            >
              <Trash2 className="me-2 size-4" aria-hidden="true" />
              {deletion.isPending ? t("admin.deletingService") : t("admin.confirmDeletion")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
function CreateServiceDialog() {
  const { t } = useI18n(); const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", nameFr: "", nameAr: "", descriptionFr: "", descriptionAr: "", price: "", leadTimeHours: "24" });
  const [image, setImage] = useState<File>();
  const [imageError, setImageError] = useState(false);
  const valid = /^[\da-z\-]{1,80}$/.test(form.code.trim()) && !!form.nameFr.trim() && !!form.nameAr.trim() && form.price.trim() !== "" && Number.isFinite(Number(form.price)) && Number(form.price) >= 0 && Number(form.price) <= 100000 && Number.isInteger(Number(form.leadTimeHours)) && Number(form.leadTimeHours) >= 1 && Number(form.leadTimeHours) <= 720;
  const mutation = useAdminMutation(() => createService({ code: form.code.trim(), nameFr: form.nameFr.trim(), nameAr: form.nameAr.trim(), descriptionFr: form.descriptionFr.trim(), descriptionAr: form.descriptionAr.trim(), price: Number(form.price), leadTimeHours: Number(form.leadTimeHours), ...(image ? { image } : {}) }), undefined, true);
  const field = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid || mutation.isPending || imageError) return;
    mutation.mutate(undefined, { onSuccess: () => { setOpen(false); setImage(undefined); setImageError(false); setForm({ code: "", nameFr: "", nameAr: "", descriptionFr: "", descriptionAr: "", price: "", leadTimeHours: "24" }); } });
  };
  const chooseImage = (file?: File) => {
    if (!file) { setImage(undefined); setImageError(false); return; }
    const supported = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const sizeAllowed = file.size <= 4 * 1024 * 1024;
    setImageError(!supported || !sizeAllowed);
    setImage(supported && sizeAllowed ? file : undefined);
  };
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button>{t("admin.newService")}</Button></DialogTrigger><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{t("admin.newService")}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={submit}>
    <label className="block space-y-2 text-sm"><span>{t("admin.serviceCode")}</span><Input required maxLength={80} pattern="[\da-z\-]+" value={form.code} onChange={e => field("code", e.target.value)} /></label>
    {(["nameFr", "nameAr"] as const).map(key => <label key={key} className="block space-y-2 text-sm"><span>{t(`admin.${key}`)}</span><Input required maxLength={160} value={form[key]} onChange={e => field(key, e.target.value)} /></label>)}
    {(["descriptionFr", "descriptionAr"] as const).map(key => <label key={key} className="block space-y-2 text-sm"><span>{t(`admin.${key}`)}</span><Textarea maxLength={5000} rows={3} value={form[key]} onChange={e => field(key, e.target.value)} /></label>)}
    <label className="block space-y-2 text-sm"><span>{t("admin.serviceImage")}</span><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => chooseImage(e.currentTarget.files?.[0])} />{imageError && <span role="alert" className="text-xs text-destructive">{t("admin.serviceImageValidation")}</span>}</label>
    <div className="grid grid-cols-2 gap-3"><label className="block space-y-2 text-sm"><span>{t("admin.price")}</span><Input required type="number" min="0" max="100000" step="0.01" value={form.price} onChange={e => field("price", e.target.value)} /></label><label className="block space-y-2 text-sm"><span>{t("admin.leadTime")}</span><Input required type="number" min="1" max="720" step="1" value={form.leadTimeHours} onChange={e => field("leadTimeHours", e.target.value)} /></label></div>
    <Button type="submit" className="w-full" disabled={mutation.isPending || imageError}>{mutation.isPending ? t("admin.saving") : t("common.actions.save")}</Button>
  </form></DialogContent></Dialog>;
}
function Services() {
  const { t } = useI18n();
  const q = useQuery(adminServicesQuery);
  return (
    <>
      <AdminPageHeader title={t("admin.nav.services")} subtitle={t("admin.servicesSubtitle")}><CreateServiceDialog /></AdminPageHeader>
      {q.isPending ? (
        <AdminTableSkeleton />
      ) : q.isError ? (
        <QueryError retry={() => q.refetch()} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {q.data.map((s) => (
            <ServiceCard
              key={`${s.id}-${s.price}-${s.leadTimeHours}-${s.active}`}
              service={s}
            />
          ))}
        </div>
      )}
    </>
  );
}
