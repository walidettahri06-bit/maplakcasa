import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nProvider";
import { ApiError } from "@/services/http";
import { queryKeys } from "@/services/queries";
import { updateOrderStatus, reviewDocument } from "@/services/orders.service";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { OrderStatus } from "@/types";
export const statuses: OrderStatus[] = [
  "pending",
  "documents_review",
  "confirmed",
  "in_production",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
export const panel = "rounded-xl border bg-card p-5 shadow-card";
export function adminHead(title: string) {
  return {
    meta: [
      { title: `${title} — Admin MaPlak Casa` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}
export function useAdminMutation<T = void>(
  fn: (value: T) => Promise<unknown>,
  id?: string,
  services = false,
) {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all(
        (services
          ? [queryKeys.services, queryKeys.adminServices]
          : [queryKeys.orders, queryKeys.stats, queryKeys.payments, queryKeys.deliveries, ...(id ? [queryKeys.order(id), queryKeys.orderHistory(id)] : [])]
        ).map((queryKey) => qc.invalidateQueries({ queryKey })),
      );
      toast.success(t("admin.saved"));
    },
      onError: (error) => {
        const message = error instanceof ApiError
          ? error.status === 401 ? t("admin.unauthorizedError")
            : error.status === 403 ? t("admin.forbiddenError")
              : error.status === 422 ? error.message
                : error.status >= 500 ? t("admin.serverError") : t("admin.error")
          : t("admin.error");
        toast.error(message);
      },
  });
}
export function AdminPageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <section className={panel}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</p>
      {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
    </section>
  );
}
export function AdminTableSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}
export function QueryError({ retry }: { retry: () => unknown }) {
  const { t } = useI18n();
  return (
    <EmptyState
      title={t("admin.error")}
      action={<Button onClick={() => void retry()}>{t("common.actions.retry")}</Button>}
    />
  );
}
export function OrderLink({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Link
      to="/admin/commandes/$orderId"
      params={{ orderId: id }}
      className="font-semibold hover:text-primary hover:underline"
    >
      {children}
    </Link>
  );
}
export function Pick({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const { dir } = useI18n();
  return (
    <Select dir={dir} value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full min-w-36" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function OrderStatusSelect({ id, status }: { id: string; status: OrderStatus }) {
  const { t } = useI18n();
  const m = useAdminMutation((v: OrderStatus) => updateOrderStatus(id, v), id);
  return (
    <Pick
      label={t("admin.status")}
      value={status}
      disabled={m.isPending}
      options={statuses.map((value) => ({ value, label: t(`common.orderStatus.${value}`) }))}
      onChange={(v) => m.mutate(v as OrderStatus)}
    />
  );
}
export function ConfirmAction({
  label,
  onConfirm,
  disabled = false,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}</AlertDialogTitle>
          <AlertDialogDescription>{t("admin.confirmText")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t("common.actions.confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
export function RejectDocumentDialog({
  documentId,
  orderId,
  open,
  onOpenChange,
}: {
  documentId: number;
  orderId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const m = useAdminMutation((r: string) => reviewDocument(documentId, "rejected", r), orderId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.reject")}</DialogTitle>
          <DialogDescription>{t("admin.reasonHelp")}</DialogDescription>
        </DialogHeader>
        <Textarea
          aria-label={t("admin.reason")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          disabled={!reason.trim() || m.isPending}
          onClick={() =>
            m.mutate(reason.trim(), {
              onSuccess: () => {
                setReason("");
                onOpenChange(false);
              },
            })
          }
        >
          {t("admin.reject")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
