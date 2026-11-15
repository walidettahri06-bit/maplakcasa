import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Price } from "@/components/shared/Price";
import { Button } from "@/components/ui/button";
import { useServices } from "@/hooks/use-services";
import { useI18n } from "@/i18n/I18nProvider";
import { formatMAD } from "@/lib/format";
import { calculateTotals } from "@/lib/pricing";
import { normalizePhone } from "@/lib/validation";
import { createOrder } from "@/services/orders.service";
import { ApiError } from "@/services/http";
import { queryKeys } from "@/services/queries";
import type { Order, ServiceId } from "@/types";
import { OrderSuccess } from "./OrderSuccess";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { StepCustomer } from "./StepCustomer";
import { StepDocuments } from "./StepDocuments";
import { StepService } from "./StepService";
import { StepSummary } from "./StepSummary";
import { Stepper, stepKeys } from "./Stepper";
import { cartItems, documentTypes, initialWizardState, validateStep, type Errors, type WizardState } from "./wizard-state";

export function OrderWizard({ initialService }: { initialService?: ServiceId | undefined }) {
  const { t, lang } = useI18n();
  const services = useServices();
  const queryClient = useQueryClient();
  const [state, setState] = useState<WizardState>(() => initialWizardState(initialService));
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [placed, setPlaced] = useState<Order | null>(null);

  useEffect(() => {
    if (services.length === 0) return;
    setState((current) => {
      const quantities = Object.fromEntries(services.map((service) => [service.id, current.quantities[service.id] ?? 0])) as Record<ServiceId, number>;
      if (!Object.values(quantities).some((quantity) => quantity > 0)) {
        const initial = services.find((service) => service.id === initialService && service.active) ?? services.find((service) => service.active);
        if (initial) quantities[initial.id] = 1;
      }
      return { ...current, quantities };
    });
  }, [services, initialService]);

  const items = useMemo(() => cartItems(state), [state]);
  const totals = useMemo(() => calculateTotals(items, services), [items, services]);

  const update = <K extends keyof WizardState>(key: K, patch: Partial<WizardState[K]>) => {
    setState((s) => ({ ...s, [key]: { ...(s[key] as object), ...patch } }));
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goTo = (target: number) => {
    if (target > maxReached) return;
    setErrors({});
    setStep(target);
    scrollTop();
  };

  const submit = useMutation({
    mutationFn: () =>
      createOrder({
        customer: {
          fullName: state.customer.fullName.trim(),
          phone: normalizePhone(state.customer.phone),
          email: state.customer.email.trim() || undefined,
        },
        plate: state.plate,
        items,
        delivery: {
          address: state.delivery.address.trim(),
          neighborhood: state.delivery.neighborhood,
          instructions: state.delivery.instructions.trim() || undefined,
          location: state.delivery.location ?? undefined,
        },
        documents: documentTypes.flatMap((type) => {
          const d = state.documents[type];
          return d ? [{ type, fileName: d.name, sizeKb: d.sizeKb, file: d.file }] : [];
        }),
        paymentMethod: state.paymentMethod,
      }),
    onSuccess: (order) => {
      setPlaced(order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      scrollTop();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : t("order.errors.submit")),
  });

  const next = () => {
    const errs = validateStep(step, state);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(t("order.errors.fixFields"));
      return;
    }
    if (step === stepKeys.length - 1) {
      submit.mutate();
      return;
    }
    const n = step + 1;
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
    scrollTop();
  };

  const reset = () => {
    setState(initialWizardState());
    setStep(0);
    setMaxReached(0);
    setErrors({});
    setPlaced(null);
    scrollTop();
  };

  if (placed) {
    return (
      <div className="bg-muted/40 px-4 py-12 sm:px-6 sm:py-16">
        <OrderSuccess order={placed} onNew={reset} />
      </div>
    );
  }

  const isLast = step === stepKeys.length - 1;

  return (
    <div className="bg-muted/40 pb-28 lg:pb-16">
      <div className="bg-ink">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {t("order.stepOf", { current: step + 1, total: stepKeys.length })}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase text-ink-foreground sm:text-5xl">{t("order.title")}</h1>
          <p className="mt-2 text-ink-muted">{t("order.subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto -mt-16 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-8">
          <Stepper current={step} maxReached={maxReached} onSelect={goTo} />
          <div key={step} className="mt-8 animate-rise">
            {step === 0 && (
              <StepCustomer value={state.customer} errors={errors} onChange={(p) => update("customer", p)} />
            )}
            {step === 1 && (
              <StepService
                services={services}
                quantities={state.quantities}
                plate={state.plate}
                errors={errors}
                onQuantity={(id, q) => update("quantities", { [id]: q } as Partial<WizardState["quantities"]>)}
                onPlate={(p) => update("plate", p)}
              />
            )}
            {step === 2 && (
              <StepDocuments
                documents={state.documents}
                delivery={state.delivery}
                errors={errors}
                onDocument={(type, doc) => update("documents", { [type]: doc } as Partial<WizardState["documents"]>)}
                onDelivery={(p) => update("delivery", p)}
              />
            )}
            {step === 3 && (
              <StepSummary
                state={state}
                services={services}
                items={items}
                totals={totals}
                errors={errors}
                goTo={goTo}
                onChange={(p) => setState((s) => ({ ...s, ...p }))}
              />
            )}
          </div>

          <div className="mt-10 hidden items-center justify-between gap-3 border-t pt-6 lg:flex">
            <Button variant="ghost" size="lg" onClick={() => goTo(step - 1)} disabled={step === 0 || submit.isPending}>
              <ArrowLeft className="flip-rtl" /> {t("common.actions.back")}
            </Button>
            <Button variant="hero" size="xl" onClick={next} disabled={submit.isPending}>
              {submit.isPending ? (
                <>
                  <Loader2 className="animate-spin" /> {t("order.summary.processing")}
                </>
              ) : isLast ? (
                t("order.summary.confirm", { total: formatMAD(totals.total, lang) })
              ) : (
                <>
                  {t("common.actions.next")} <ArrowRight className="flip-rtl" />
                </>
              )}
            </Button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <OrderSummaryCard items={items} services={services} totals={totals} />
            <p className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-success" /> {t("order.documents.secureNotice")}
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar with live total */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-12 shrink-0"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || submit.isPending}
            aria-label={t("common.actions.back")}
          >
            <ArrowLeft className="flip-rtl" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">{t("order.summary.total")}</p>
            <Price amount={totals.total} className="font-display text-xl font-bold" />
          </div>
          <Button variant="hero" size="xl" onClick={next} disabled={submit.isPending} className="shrink-0">
            {submit.isPending ? <Loader2 className="animate-spin" /> : isLast ? t("common.actions.confirm") : t("common.actions.next")}
            {!submit.isPending && !isLast && <ArrowRight className="flip-rtl" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
