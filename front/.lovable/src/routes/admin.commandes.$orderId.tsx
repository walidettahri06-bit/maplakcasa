import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, MessageCircle, MapPin } from "lucide-react";
import { orderHistoryQuery, orderQuery } from "@/services/queries";
import { updateOrderStatus, updateOrderNote, updatePaymentStatus } from "@/services/orders.service";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Price } from "@/components/shared/Price";
import { LicensePlate } from "@/components/shared/LicensePlate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";
import { OrderDocuments } from "@/components/admin/Documents";
import { AssignDriverDialog, EditDeliveryDialog } from "@/components/admin/AssignDriverDialog";
import {
  AdminPageHeader,
  AdminTableSkeleton,
  OrderStatusSelect,
  ConfirmAction,
  statuses,
  panel,
  useAdminMutation,
  adminHead,
} from "@/components/admin/core";
import type { Order, PaymentStatus } from "@/types";
export const Route = createFileRoute("/admin/commandes/$orderId")({
  component: OrderDetail,
  head: () => adminHead("Détail de la commande"),
});
function OrderDetail() {
  const { orderId } = Route.useParams();
  const q = useQuery(orderQuery(orderId));
  const { t } = useI18n();
  if (q.isPending) return <AdminTableSkeleton />;
  if (q.isError)
    return (
      <EmptyState
        title={t("admin.orderNotFound")}
        action={
          <Link to="/admin/commandes" className="text-primary">
            {t("admin.backOrders")}
          </Link>
        }
      />
    );
  return <Detail order={q.data} />;
}
function Detail({ order: o }: { order: Order }) {
  const { t, lang } = useI18n();
  const history = useQuery(orderHistoryQuery(o.id));
  const [note, setNote] = useState(o.notes ?? "");
  const cancel = useAdminMutation(() => updateOrderStatus(o.id, "cancelled"), o.id);
  const noteMutation = useAdminMutation((value: string) => updateOrderNote(o.id, value), o.id);
  const payment = useAdminMutation((v: PaymentStatus) => updatePaymentStatus(o.payment.id!, v), o.id);
  const phone = o.customer.phone.replace(/\D/g, "").replace(/^0/, "212");
  const sequence = statuses.filter((s) => s !== "cancelled");
  return (
    <>
      <Link
        to="/admin/commandes"
        className="mb-5 inline-block text-sm text-muted-foreground hover:text-primary"
      >
        {t("admin.backOrders")}
      </Link>
      <AdminPageHeader title={o.reference} subtitle={formatDate(o.createdAt, lang, true)}>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge kind="order" status={o.status} />
          <OrderStatusSelect id={o.id} status={o.status} />
        </div>
      </AdminPageHeader>
      <ol className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-6" aria-label={t("admin.timeline")}>
        {sequence.map((s, i) => (
          <li
            key={s}
            className={`rounded-lg border p-3 text-xs ${o.status !== "cancelled" && sequence.indexOf(o.status) >= i ? "border-primary/30 bg-primary/10 text-primary" : "bg-card text-muted-foreground"}`}
            aria-current={o.status === s ? "step" : undefined}
          >
            <span className="mb-2 block text-lg font-semibold">{i + 1}</span>
            {t(`common.orderStatus.${s}`)}
          </li>
        ))}
      </ol>
      <section className={`${panel} mb-6`}>
        <h2 className="mb-4 font-semibold">{t("admin.history")}</h2>
        {history.isPending ? <AdminTableSkeleton /> : history.isError ? <p className="text-sm text-destructive">{t("admin.error")}</p> : <ol className="space-y-4">{history.data.map((entry: any) => <li key={entry.id} className="border-s-2 border-primary/30 ps-4"><div className="flex flex-wrap items-center justify-between gap-2"><StatusBadge kind="order" status={entry.newStatus} /><time className="text-xs text-muted-foreground">{formatDate(entry.createdAt, lang, true)}</time></div><p className="mt-1 text-xs text-muted-foreground">{entry.actor ?? t("admin.systemActor")}</p>{entry.comment && <p className="mt-2 text-sm">{entry.comment}</p>}</li>)}</ol>}
      </section>
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className={panel}>
            <h2 className="mb-4 font-semibold">{t("admin.customer")}</h2>
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="font-medium">{o.customer.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                  {o.customer.phone}
                </p>
                {o.customer.email && (
                  <p className="text-sm text-muted-foreground">{o.customer.email}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`tel:${o.customer.phone}`}>
                    <Phone className="size-4" />
                    {t("admin.call")}
                  </a>
                </Button>
                <Button asChild variant="whatsapp" size="sm">
                  <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" />
                    {t("admin.whatsapp")}
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-muted/50 p-5">
              <LicensePlate plate={o.plate} />
            </div>
          </section>
          <section className={panel}>
            <h2 className="mb-4 font-semibold">{t("admin.items")}</h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    {["service", "quantity", "unitPrice", "total"].map((k) => (
                      <th key={k} className="py-3 text-start font-medium">
                        {t(`admin.${k}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((item) => (
                    <tr key={item.serviceId} className="border-b">
                      <td className="py-4">{item.serviceName ?? t(`common.services.${item.serviceId}.name`)}</td>
                      <td className="tabular-nums">{item.quantity}</td>
                      <td>
                        <Price amount={item.unitPrice} />
                      </td>
                      <td>
                        <Price amount={item.unitPrice * item.quantity} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ms-auto mt-4 max-w-xs space-y-3 text-sm">
              {(
                [
                  ["subtotal", o.subtotal],
                  ["deliveryFee", o.deliveryFee],
                  ["total", o.total],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className={`flex justify-between ${k === "total" ? "border-t pt-3 text-lg font-bold" : ""}`}
                >
                  <dt>{t(`admin.${k}`)}</dt>
                  <dd>
                    <Price amount={v} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section className={panel}>
            <h2 className="mb-4 font-semibold">{t("admin.nav.documents")}</h2>
            <OrderDocuments order={o} />
          </section>
          <section className={panel}>
            <label htmlFor="admin-note" className="mb-3 block font-semibold">
              {t("admin.internalNote")}
            </label>
            <Textarea
              id="admin-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{t("admin.noteSaved")}</p>
              <Button disabled={noteMutation.isPending} onClick={() => noteMutation.mutate(note)}>
                {noteMutation.isPending ? t("admin.saving") : t("common.actions.save")}
              </Button>
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <section className={panel}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{t("admin.delivery")}</h2>
              <StatusBadge kind="delivery" status={o.delivery.status} />
            </div>
            <p className="text-sm">{o.delivery.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">{o.delivery.neighborhood}</p>
            {o.delivery.instructions && (
              <p className="mt-3 rounded-lg bg-muted p-3 text-sm">{o.delivery.instructions}</p>
            )}
            {o.delivery.location && (
              <a
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary"
                href={`https://www.google.com/maps/search/?api=1&query=${o.delivery.location.lat},${o.delivery.location.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin className="size-4" />
                {t("admin.openMaps")}
                <span className="text-xs">
                  {o.delivery.location.lat.toFixed(3)}, {o.delivery.location.lng.toFixed(3)}
                </span>
              </a>
            )}
            <div className="mt-5 space-y-3">
              {o.delivery.scheduledFor && (
                <p className="text-sm text-muted-foreground">
                  {formatDate(o.delivery.scheduledFor, lang, true)}
                </p>
              )}
              <AssignDriverDialog reference={o.id} delivery={{ id: o.delivery.id!, driver: o.delivery.driver, scheduledFor: o.delivery.scheduledFor }} />
              <EditDeliveryDialog reference={o.id} delivery={{ id: o.delivery.id!, address: o.delivery.address, neighborhood: o.delivery.neighborhood, instructions: o.delivery.instructions }} />
            </div>
          </section>
          <section className={panel}>
            <h2 className="mb-4 font-semibold">{t("admin.payment")}</h2>
            <p className="mb-3 text-sm">{t(`common.paymentMethod.${o.payment.method}`)}</p>
            <StatusBadge kind="payment" status={o.payment.status} />
            <p className="my-4 text-2xl font-bold">
              <Price amount={o.payment.amount} />
            </p>
            <p className="break-all text-xs text-muted-foreground">
              {t("admin.transaction")}: {o.payment.transactionId ?? "—"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {o.payment.status === "pending" && (
                <Button
                  size="sm"
                  disabled={payment.isPending}
                  onClick={() => payment.mutate("paid")}
                >
                  {t("admin.markPaid")}
                </Button>
              )}
            </div>
          </section>
          {o.status !== "cancelled" && o.status !== "delivered" && (
            <section className={`${panel} border-destructive/20`}>
              <p className="mb-3 text-sm text-muted-foreground">{t("admin.cancelHelp")}</p>
              <ConfirmAction
                label={t("admin.cancelOrder")}
                disabled={cancel.isPending}
                onConfirm={() => cancel.mutate()}
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
