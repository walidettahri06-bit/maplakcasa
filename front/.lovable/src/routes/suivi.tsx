import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { SearchCheck, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import { trackOrder } from "@/services/orders.service";

export const Route = createFileRoute("/suivi")({
  validateSearch: (search: Record<string, unknown>): { reference?: string } => ({
    ...(typeof search.reference === "string" ? { reference: search.reference } : {}),
  }),
  component: TrackingPage,
  head: () => ({ meta: [{ title: "Suivi de commande — MaPlak Casa" }, { name: "robots", content: "noindex, nofollow" }] }),
});

function TrackingPage() {
  const { t, lang, dir } = useI18n();
  const { reference: initialReference } = Route.useSearch();
  const [reference, setReference] = useState(initialReference ?? "");
  const [token, setToken] = useState("");
  const [startedFromConfirmation, setStartedFromConfirmation] = useState(false);
  const mutation = useMutation({ mutationFn: ({ ref, secret }: { ref: string; secret: string }) => trackOrder(ref.trim(), secret.trim()) });

  useEffect(() => {
    setReference(initialReference ?? "");
    if (!initialReference) return;
    const savedToken = window.sessionStorage.getItem(`maplak_tracking_${initialReference}`);
    if (savedToken) {
      setToken(savedToken);
      setStartedFromConfirmation(true);
    }
  }, [initialReference]);

  useEffect(() => {
    if (!startedFromConfirmation || !token || !reference) return;
    setStartedFromConfirmation(false);
    mutation.mutate({ ref: reference, secret: token });
  }, [startedFromConfirmation, token, reference, mutation.mutate]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ ref: reference, secret: token });
  };

  return <SiteShell><main dir={dir} className="bg-muted/40 px-4 py-12 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-xl">
      <header className="mb-7 text-center"><div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SearchCheck /></div><h1 className="font-display text-3xl font-extrabold">{t("order.tracking.title")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("order.tracking.subtitle")}</p></header>
      <section className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-2"><Label htmlFor="track-reference">{t("order.tracking.reference")}</Label><Input id="track-reference" autoComplete="off" required maxLength={40} value={reference} onChange={e => setReference(e.target.value)} placeholder="MAP-2026-0001" dir="ltr" /></div>
          <div className="space-y-2"><Label htmlFor="track-token">{t("order.tracking.token")}</Label><Input id="track-token" type="password" autoComplete="off" required minLength={64} maxLength={64} value={token} onChange={e => setToken(e.target.value)} dir="ltr" /><p className="text-xs text-muted-foreground">{t("order.tracking.tokenHelp")}</p></div>
          {mutation.isError && <p role="alert" className="text-sm text-destructive">{t("order.tracking.error")}</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending || !reference.trim() || token.length !== 64}>{mutation.isPending ? t("order.tracking.loading") : t("order.tracking.action")}</Button>
        </form>
        {mutation.data && <div className="mt-7 rounded-xl border bg-background p-5" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">{t("order.tracking.reference")}</p><p className="font-plate text-xl font-bold" dir="ltr">{mutation.data.reference}</p></div><StatusBadge kind="order" status={mutation.data.status} /></div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4"><span className="text-sm text-muted-foreground">{t("order.tracking.delivery")}</span><StatusBadge kind="delivery" status={mutation.data.deliveryStatus} /></div>
          <p className="mt-4 text-xs text-muted-foreground">{t("order.tracking.updated", { date: formatDate(mutation.data.updatedAt ?? mutation.data.createdAt, lang, true) })}</p>
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-success" />{t("order.tracking.privacy")}</p>
        </div>}
      </section>
      <p className="mt-6 text-center text-sm"><Link to="/" className="text-primary hover:underline">{t("common.actions.backHome")}</Link></p>
    </div>
  </main></SiteShell>;
}
