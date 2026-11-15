import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { paymentsQuery } from "@/services/queries";
import { updatePaymentStatus } from "@/services/orders.service";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { AdminPageHeader, StatCard, AdminTableSkeleton, QueryError, Pick, OrderLink, useAdminMutation, adminHead } from "@/components/admin/core";
import type { PaymentStatus } from "@/types";
export const Route = createFileRoute("/admin/paiements")({ component: Payments, head: () => adminHead("Paiements") });
function PaymentActions({ payment }: { payment: any }) {
  const { t } = useI18n();
  const mutation = useAdminMutation((status: PaymentStatus) => updatePaymentStatus(payment.id, status), payment.orderReference);
  return payment.status === "pending" ? <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate("paid")}>{t("admin.markPaid")}</Button> : null;
}
function Payments() {
  const { t, lang } = useI18n(); const q = useQuery(paymentsQuery);
  const [status, setStatus] = useState("all"); const [method, setMethod] = useState("all");
  const payments = q.data ?? [];
  const sum = (s: PaymentStatus) => payments.filter((p: any) => p.status === s).reduce((n: number, p: any) => n + Number(p.amount), 0);
  const transfers = payments.filter((p: any) => p.method === "bank_transfer").length;
  const rows = payments.filter((p: any) => (status === "all" || p.status === status) && (method === "all" || p.method === method));
  return <>
    <AdminPageHeader title={t("admin.nav.payments")} subtitle={t("admin.paymentsSubtitle")} />
    {q.isPending ? <AdminTableSkeleton /> : q.isError ? <QueryError retry={() => q.refetch()} /> : <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(["paid", "pending", "refunded"] as PaymentStatus[]).map(s => <StatCard key={s} label={t(`admin.paymentSummary.${s}`)} value={<Price amount={sum(s)} />} />)}<StatCard label={t("admin.onlineShare")} value={`${Math.round(transfers / Math.max(payments.length, 1) * 100)}%`} detail={t("admin.codShare", { value: Math.round((payments.length - transfers) / Math.max(payments.length, 1) * 100) })} /></div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2"><Pick label={t("admin.status")} value={status} onChange={setStatus} options={["all", "pending", "paid", "failed", "refunded", "cancelled"].map(value => ({ value, label: value === "all" ? t("admin.allStatuses") : t(`common.paymentStatus.${value}`) }))} /><Pick label={t("admin.method")} value={method} onChange={setMethod} options={["all", "cod", "bank_transfer"].map(value => ({ value, label: value === "all" ? t("admin.allMethods") : t(`common.paymentMethod.${value}`) }))} /></div>
      {!rows.length ? <EmptyState title={t("admin.noPayments")} /> : <div className="overflow-x-auto rounded-xl border bg-card shadow-card"><table className="w-full text-sm"><thead className="border-b bg-muted/50 text-xs text-muted-foreground"><tr>{["date", "reference", "customer", "method", "amount", "status", "transaction", "paymentHistory", "actions"].map(k => <th key={k} className="whitespace-nowrap px-4 py-4 text-start font-medium">{t(`admin.${k}`)}</th>)}</tr></thead><tbody>{rows.map((p: any) => <tr key={p.id} className="border-b last:border-0"><td className="whitespace-nowrap px-4 py-5 text-muted-foreground">{formatDate(p.paidAt ?? p.createdAt, lang)}</td><td className="px-4 py-5"><OrderLink id={p.orderReference}>{p.orderReference}</OrderLink></td><td className="whitespace-nowrap px-4 py-5">{p.customerName}</td><td className="px-4 py-5">{t(`common.paymentMethod.${p.method}`)}</td><td className="whitespace-nowrap px-4 py-5 font-semibold"><Price amount={Number(p.amount)} /></td><td className="px-4 py-5"><StatusBadge kind="payment" status={p.status} /></td><td className="px-4 py-5 text-xs text-muted-foreground">{p.transactionId ?? "—"}</td><td className="min-w-48 px-4 py-5 text-xs text-muted-foreground">{p.history?.length ? <ul className="space-y-2">{p.history.map((entry: any) => <li key={entry.id}><span className="font-medium text-foreground">{t(`common.paymentStatus.${entry.newStatus}`)}</span><span> · {formatDate(entry.createdAt, lang, true)}</span><span className="block">{entry.actor ?? t("admin.systemActor")}</span></li>)}</ul> : "—"}</td><td className="px-4 py-5"><PaymentActions payment={p} /></td></tr>)}</tbody></table></div>}
    </>}
  </>;
}
