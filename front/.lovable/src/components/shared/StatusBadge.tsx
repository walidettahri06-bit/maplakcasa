import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { DeliveryStatus, DocumentStatus, OrderStatus, PaymentStatus } from "@/types";

type Tone = "neutral" | "warning" | "info" | "success" | "danger" | "primary" | "ink";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  info: "bg-info/10 text-info border-info/30",
  success: "bg-success/12 text-success border-success/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  primary: "bg-primary/10 text-primary border-primary/30",
  ink: "bg-ink text-ink-foreground border-ink",
};

const orderTone: Record<OrderStatus, Tone> = {
  pending: "warning",
  documents_review: "info",
  confirmed: "primary",
  in_production: "ink",
  out_for_delivery: "info",
  delivered: "success",
  cancelled: "danger",
};
const paymentTone: Record<PaymentStatus, Tone> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
  cancelled: "neutral",
};
const documentTone: Record<DocumentStatus, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};
const deliveryTone: Record<DeliveryStatus, Tone> = {
  unscheduled: "warning",
  scheduled: "primary",
  in_transit: "info",
  delivered: "success",
  failed: "danger",
};

type Props =
  | { kind: "order"; status: OrderStatus }
  | { kind: "payment"; status: PaymentStatus }
  | { kind: "document"; status: DocumentStatus }
  | { kind: "delivery"; status: DeliveryStatus };

const ns = { order: "orderStatus", payment: "paymentStatus", document: "documentStatus", delivery: "deliveryStatus" };

/** One badge for every status family; labels come from common.json. */
export function StatusBadge(props: Props & { className?: string }) {
  const { t } = useI18n();
  const tone: Tone =
    props.kind === "order"
      ? orderTone[props.status]
      : props.kind === "payment"
        ? paymentTone[props.status]
        : props.kind === "document"
          ? documentTone[props.status]
          : deliveryTone[props.status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        toneClass[tone],
        props.className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t(`common.${ns[props.kind]}.${props.status}`)}
    </span>
  );
}
