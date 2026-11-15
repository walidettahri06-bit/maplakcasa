import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight } from "lucide-react";
import { statsQuery, ordersQuery } from "@/services/queries";
import { useI18n } from "@/i18n/I18nProvider";
import { Price } from "@/components/shared/Price";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import {
  AdminPageHeader,
  StatCard,
  AdminTableSkeleton,
  QueryError,
  OrderLink,
  panel,
  adminHead,
} from "@/components/admin/core";
export const Route = createFileRoute("/admin/")({
  component: Overview,
  head: () => adminHead("Vue d’ensemble"),
});
function Overview() {
  const { t, lang } = useI18n();
  const stats = useQuery(statsQuery);
  const orders = useQuery(ordersQuery);
  if (stats.isPending || orders.isPending) return <AdminTableSkeleton />;
  if (stats.isError || orders.isError)
    return (
      <QueryError
        retry={() => {
          void stats.refetch();
          void orders.refetch();
        }}
      />
    );
  const s = stats.data;
  return (
    <>
      <AdminPageHeader title={t("admin.overviewTitle")} subtitle={t("admin.overviewSubtitle")} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {(
          ["revenue", "orders", "pendingDocuments", "deliveriesToday", "averageBasket"] as const
        ).map((k) => (
          <StatCard
            key={k}
            label={t(`admin.kpi.${k}`)}
            value={k === "revenue" || k === "averageBasket" ? <Price amount={s[k]} /> : s[k]}
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${panel} xl:col-span-2`}>
          <div className="mb-6 flex justify-between gap-3">
            <h2 className="font-semibold">{t("admin.revenueChart")}</h2>
            <span className="text-xs text-muted-foreground">{t("admin.last14")}</span>
          </div>
          <div className="h-72" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.revenueByDay}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => String(d).slice(5)}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  width={45}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={(v) => formatDate(String(v), lang)}
                  contentStyle={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  name={t("admin.kpi.revenue")}
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className={panel}>
          <h2 className="mb-5 font-semibold">{t("admin.breakdown")}</h2>
          <div className="space-y-4">
            {s.statusBreakdown.map((b) => (
              <div key={b.status}>
                <div className="mb-2 flex items-center justify-between">
                  <StatusBadge kind="order" status={b.status} />
                  <span className="text-sm tabular-nums">{b.count}</span>
                </div>
                <div className="h-1 rounded-full bg-muted">
                  <div
                    className="h-1 rounded-full bg-primary"
                    style={{ width: `${(b.count / Math.max(s.orders, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className={`${panel} xl:col-span-2`}>
          <div className="mb-3 flex justify-between">
            <h2 className="font-semibold">{t("admin.recentOrders")}</h2>
            <Link to="/admin/commandes" className="text-sm text-primary">
              {t("admin.seeAll")}
            </Link>
          </div>
          {[...orders.data]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 5)
            .map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b py-4 last:border-0"
              >
                <div>
                  <OrderLink id={o.id}>{o.reference}</OrderLink>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {o.customer.fullName} · {formatDate(o.createdAt, lang)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge kind="order" status={o.status} />
                  <Price amount={o.total} />
                </div>
              </div>
            ))}
        </section>
        <section className={panel}>
          <h2 className="mb-5 font-semibold">{t("admin.quickActions")}</h2>
          {(
            [
              ["documents", "/admin/documents"],
              ["deliveries", "/admin/livraisons"],
              ["services", "/admin/services"],
            ] as const
          ).map(([key, to]) => (
            <Link
              key={key}
              to={to}
              className="mb-3 flex items-center justify-between rounded-lg border p-4 text-sm hover:border-primary"
            >
              {t(`admin.nav.${key}`)}
              <ArrowUpRight className="size-4 text-primary" />
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
