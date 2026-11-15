import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, ArrowUpDown } from "lucide-react";
import { ordersQuery } from "@/services/queries";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LicensePlate } from "@/components/shared/LicensePlate";
import { Price } from "@/components/shared/Price";
import { formatDate, formatPlate } from "@/lib/format";
import {
  AdminPageHeader,
  AdminTableSkeleton,
  QueryError,
  Pick,
  OrderStatusSelect,
  OrderLink,
  statuses,
  panel,
  adminHead,
} from "@/components/admin/core";
export const Route = createFileRoute("/admin/commandes/")({
  component: Orders,
  head: () => adminHead("Commandes"),
});
function Orders() {
  const { t, lang } = useI18n();
  const query = useQuery(ordersQuery);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<"date" | "total">("date");
  const [ascending, setAscending] = useState(false);
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      (query.data ?? [])
        .filter(
          (o) =>
            `${o.reference} ${o.customer.fullName} ${o.customer.phone} ${formatPlate(o.plate)}`
              .toLocaleLowerCase()
              .includes(search.toLocaleLowerCase()) &&
            (status === "all" || o.status === status) &&
            (method === "all" || o.payment.method === method) &&
            (!dateFrom || o.createdAt.slice(0, 10) >= dateFrom) &&
            (!dateTo || o.createdAt.slice(0, 10) <= dateTo),
        )
        .sort(
          (a, b) =>
            (sort === "date" ? a.createdAt.localeCompare(b.createdAt) : a.total - b.total) *
            (ascending ? 1 : -1),
        ),
    [query.data, search, status, method, dateFrom, dateTo, sort, ascending],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * 10, current * 10);
  function exportCsv() {
    const cell = (v: unknown) =>
      `"${String(v)
        .replace(/^[=+@\-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const csv = [
      [
        t("admin.reference"),
        t("admin.customer"),
        t("admin.phone"),
        t("admin.plate"),
        t("admin.date"),
        t("admin.total"),
        t("admin.status"),
        t("admin.method"),
      ],
      ...filtered.map((o) => [
        o.reference,
        o.customer.fullName,
        o.customer.phone,
        formatPlate(o.plate),
        o.createdAt,
        o.total,
        t(`common.orderStatus.${o.status}`),
        t(`common.paymentMethod.${o.payment.method}`),
      ]),
    ]
      .map((r) => r.map(cell).join(";"))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "maplak-commandes.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const filterChange = (set: (s: string) => void) => (v: string) => {
    set(v);
    setPage(1);
  };
  const sorting = (key: "date" | "total") => {
    if (sort === key) setAscending((v) => !v);
    else {
      setSort(key);
      setAscending(false);
    }
  };
  return (
    <>
      <AdminPageHeader title={t("admin.nav.orders")} subtitle={t("admin.ordersSubtitle")}>
        <Button
          variant="outline"
          onClick={exportCsv}
          disabled={query.isPending || !filtered.length}
        >
          <Download className="size-4" />
          {t("admin.export")}
        </Button>
      </AdminPageHeader>
      <section className={`${panel} mb-5`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute start-3 top-3 size-4 text-muted-foreground" />
            <Input
              className="ps-9"
              value={search}
              onChange={(e) => filterChange(setSearch)(e.target.value)}
              placeholder={t("admin.search")}
              aria-label={t("admin.search")}
            />
          </div>
          <Pick
            label={t("admin.status")}
            value={status}
            onChange={filterChange(setStatus)}
            options={[
              { value: "all", label: t("admin.allStatuses") },
              ...statuses.map((value) => ({ value, label: t(`common.orderStatus.${value}`) })),
            ]}
          />
          <label className="space-y-1 text-xs text-muted-foreground"><span>{t("admin.dateFrom")}</span><Input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => { setDateFrom(e.target.value); setPage(1); }} /></label>
          <label className="space-y-1 text-xs text-muted-foreground"><span>{t("admin.dateTo")}</span><Input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => { setDateTo(e.target.value); setPage(1); }} /></label>
          <Pick
            label={t("admin.method")}
            value={method}
            onChange={filterChange(setMethod)}
            options={["all", "cod", "bank_transfer"].map((value) => ({
              value,
              label: value === "all" ? t("admin.allMethods") : t(`common.paymentMethod.${value}`),
            }))}
          />
        </div>
      </section>
      {query.isPending ? (
        <AdminTableSkeleton />
      ) : query.isError ? (
        <QueryError retry={() => query.refetch()} />
      ) : !filtered.length ? (
        <EmptyState title={t("admin.noOrders")} text={t("admin.noResultsHelp")} />
      ) : (
        <>
          <div className="mb-3 flex gap-2 md:hidden">
            <Button variant="outline" size="sm" onClick={() => sorting("date")}>
              {t("admin.date")}
              <ArrowUpDown className="size-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => sorting("total")}>
              {t("admin.total")}
              <ArrowUpDown className="size-3" />
            </Button>
          </div>
          <div className="hidden overflow-x-auto rounded-xl border bg-card shadow-card md:block">
            <table className="w-full text-start text-sm">
              <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  {["reference", "customer", "plate", "date", "total", "status", "actions"].map(
                    (k) => (
                      <th key={k} scope="col" className="px-4 py-4 text-start font-medium">
                        {k === "date" || k === "total" ? (
                          <button onClick={() => sorting(k)} className="flex items-center gap-2">
                            {t(`admin.${k}`)}
                            <ArrowUpDown className="size-3" />
                          </button>
                        ) : (
                          t(`admin.${k}`)
                        )}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
                    onClick={() =>
                      void navigate({ to: "/admin/commandes/$orderId", params: { orderId: o.id } })
                    }
                  >
                    <td className="px-4 py-5">
                      <OrderLink id={o.id}>{o.reference}</OrderLink>
                    </td>
                    <td className="px-4 py-5">
                      {o.customer.fullName}
                      <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                        {o.customer.phone}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <LicensePlate plate={o.plate} size="sm" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-muted-foreground">
                      {formatDate(o.createdAt, lang)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 font-semibold">
                      <Price amount={o.total} />
                    </td>
                    <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                      <OrderStatusSelect id={o.id} status={o.status} />
                    </td>
                    <td className="px-4 py-5">
                      <Button variant="ghost" size="sm">
                        {t("common.actions.view")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {rows.map((o) => (
              <article key={o.id} className={panel}>
                <div className="flex justify-between gap-3">
                  <OrderLink id={o.id}>{o.reference}</OrderLink>
                  <Price amount={o.total} />
                </div>
                <p className="my-3 text-sm text-muted-foreground">
                  {o.customer.fullName} · {formatDate(o.createdAt, lang)}
                </p>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <LicensePlate plate={o.plate} size="sm" />
                  <StatusBadge kind="payment" status={o.payment.status} />
                </div>
                <OrderStatusSelect id={o.id} status={o.status} />
              </article>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("admin.pagination", { page: current, pages, total: filtered.length })}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                {t("admin.previous")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                {t("admin.next")}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
