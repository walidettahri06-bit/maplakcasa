import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone } from "lucide-react";
import { deliveriesQuery } from "@/services/queries";
import { updateDelivery } from "@/services/orders.service";
import { useI18n } from "@/i18n/I18nProvider";
import { businessConfig } from "@/config/business";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";
import { AssignDriverDialog, EditDeliveryDialog } from "@/components/admin/AssignDriverDialog";
import {
  AdminPageHeader,
  AdminTableSkeleton,
  QueryError,
  Pick,
  OrderLink,
  panel,
  useAdminMutation,
  adminHead,
} from "@/components/admin/core";
import type { AdminDelivery, DeliveryStatus } from "@/types";
export const Route = createFileRoute("/admin/livraisons")({
  component: Deliveries,
  head: () => adminHead("Livraisons"),
});
function DeliveryCard({ delivery: d }: { delivery: AdminDelivery }) {
  const { t, lang } = useI18n();
  const m = useAdminMutation((status: DeliveryStatus) => updateDelivery(d.id, { status }), d.orderReference);
  return (
    <article className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
      <OrderLink id={d.orderReference}>{d.orderReference}</OrderLink>
      <p className="text-sm font-medium">{d.customerName}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {d.address} · {d.neighborhood}
      </p>
      <p className="text-xs text-muted-foreground">
        {d.driver ?? t("admin.unassigned")}
        {d.scheduledAt && ` · ${formatDate(d.scheduledAt, lang, true)}`}
      </p>
      <div className="flex flex-wrap gap-2">
        <AssignDriverDialog reference={d.orderReference} delivery={d} />
        <EditDeliveryDialog reference={d.orderReference} delivery={d} />
        <Button asChild size="sm" variant="ghost">
          <a href={`tel:${d.customerPhone}`}>
            <Phone className="size-3" />
            {t("admin.call")}
          </a>
        </Button>
        {d.status === "scheduled" && (
          <Button
            size="sm"
            disabled={m.isPending || !d.driver}
            onClick={() => m.mutate("in_transit")}
          >
            {t("admin.startDelivery")}
          </Button>
        )}
        {d.status === "in_transit" && (
          <Button size="sm" disabled={m.isPending} onClick={() => m.mutate("delivered")}>
            {t("admin.markDelivered")}
          </Button>
        )}
      </div>
    </article>
  );
}
function Deliveries() {
  const { t } = useI18n();
  const q = useQuery(deliveriesQuery);
  const [neighborhood, setNeighborhood] = useState("all");
  const [driver, setDriver] = useState("all");
  const allDeliveries = q.data ?? [];
  const neighborhoods = [...new Set(allDeliveries.map(d => d.neighborhood).filter(Boolean))].sort();
  const actualDrivers = [...new Set(allDeliveries.map(d => d.driver).filter((v): v is string => Boolean(v)))].sort();
  const deliveries = allDeliveries.filter(d => (neighborhood === "all" || d.neighborhood === neighborhood) && (driver === "all" || d.driver === driver));
  const bounds = businessConfig.cityBounds;
  const groups: DeliveryStatus[] = [
    "unscheduled",
    "scheduled",
    "in_transit",
    "delivered",
    "failed",
  ];
  return (
    <>
      <AdminPageHeader title={t("admin.nav.deliveries")} subtitle={t("admin.deliveriesSubtitle")} />
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Pick
          label={t("admin.neighborhood")}
          value={neighborhood}
          onChange={setNeighborhood}
          options={[
            { value: "all", label: t("admin.allNeighborhoods") },
            ...neighborhoods.map((value) => ({ value, label: value })),
          ]}
        />
        <Pick
          label={t("admin.driver")}
          value={driver}
          onChange={setDriver}
          options={[
            { value: "all", label: t("admin.allDrivers") },
            ...actualDrivers.map((value) => ({ value, label: value })),
          ]}
        />
      </div>
      {q.isPending ? (
        <AdminTableSkeleton />
      ) : q.isError ? (
        <QueryError retry={() => q.refetch()} />
      ) : (
        <>
          <section className={`${panel} mb-6`}>
            <div className="mb-3 flex justify-between gap-3">
              <h2 className="font-semibold">{t("admin.activeMap")}</h2>
              <span className="text-xs text-muted-foreground">{t("admin.mapHint")}</span>
            </div>
            <div
              className="relative h-60 overflow-hidden rounded-lg border bg-muted/40"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold tracking-widest text-muted-foreground/15">
                {businessConfig.city}
              </div>
              {deliveries
                .filter((d) => d.latitude != null && d.longitude != null && d.status !== "delivered")
                .map((d) => {
                  const p = { lat: Number(d.latitude), lng: Number(d.longitude) };
                  return (
                    <a
                      key={d.id}
                      href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      title={`${d.orderReference} · ${d.customerName}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-primary-foreground shadow-card"
                      style={{
                        insetInlineStart: `${Math.max(5, Math.min(95, ((p.lng - bounds.west) / (bounds.east - bounds.west)) * 100))}%`,
                        top: `${Math.max(8, Math.min(92, ((bounds.north - p.lat) / (bounds.north - bounds.south)) * 100))}%`,
                      }}
                    >
                      <MapPin className="size-4" />
                      <span className="sr-only">{d.orderReference}</span>
                    </a>
                  );
                })}
            </div>
          </section>
          {!deliveries.length ? (
            <EmptyState title={t("admin.noDeliveries")} />
          ) : (
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
              {groups
                .filter((s) => s !== "failed" || deliveries.some((d) => d.status === "failed"))
                .map((s) => (
                  <section key={s} className="rounded-xl bg-muted/60 p-3">
                    <div className="mb-4 flex items-center justify-between">
                      <StatusBadge kind="delivery" status={s} />
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {deliveries.filter((d) => d.status === s).length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {deliveries
                        .filter((d) => d.status === s)
                        .map((d) => (
                          <DeliveryCard key={d.id} delivery={d} />
                        ))}
                      {!deliveries.some((d) => d.status === s) && (
                        <p className="py-8 text-center text-xs text-muted-foreground">
                          {t("admin.noDeliveries")}
                        </p>
                      )}
                    </div>
                  </section>
                ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
