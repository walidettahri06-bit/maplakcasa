import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { casablancaNeighborhoods } from "@/data/neighborhoods";
import { updateDelivery } from "@/services/orders.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pick, useAdminMutation } from "./core";
type Assignment = { id: number; driver?: string | null; scheduledAt?: string | null; scheduledFor?: string; address?: string; neighborhood?: string; instructions?: string | null };
export function AssignDriverDialog({ reference, delivery }: { reference: string; delivery: Assignment }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [driver, setDriver] = useState(delivery.driver ?? "");
  const [date, setDate] = useState((delivery.scheduledAt ?? delivery.scheduledFor)?.slice(0, 10) ?? "");
  const [slot, setSlot] = useState("09:00");
  const m = useAdminMutation(
    () =>
      updateDelivery(delivery.id, {
        driver,
        scheduledFor: `${date}T${slot}:00+01:00`,
        status: "scheduled",
      }),
    reference,
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("admin.assign")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.assign")}</DialogTitle>
          <DialogDescription>{t("admin.assignHelp")}</DialogDescription>
        </DialogHeader>
        <label className="space-y-2 text-sm">
          <span>{t("admin.driver")}</span>
          <Input value={driver} onChange={(e) => setDriver(e.target.value)} placeholder={t("admin.driver")} />
        </label>
        <label className="space-y-2 text-sm">
          <span>{t("admin.date")}</span>
          <Input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>{t("admin.slot")}</span>
          <Pick
            label={t("admin.slot")}
            value={slot}
            onChange={setSlot}
            options={["09:00", "11:00", "14:00", "16:00", "18:00"].map((value) => ({
              value,
              label: `${value} – ${String(Number(value.slice(0, 2)) + 2).padStart(2, "0")}:00`,
            }))}
          />
        </label>
        <Button
          disabled={!driver || !date || date < new Date().toISOString().slice(0, 10) || m.isPending}
          onClick={() => m.mutate(undefined, { onSuccess: () => setOpen(false) })}
        >
          {t("common.actions.save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function EditDeliveryDialog({ reference, delivery }: { reference: string; delivery: Assignment }) {
  const { t } = useI18n(); const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(delivery.address ?? "");
  const [neighborhood, setNeighborhood] = useState(delivery.neighborhood ?? "");
  const [instructions, setInstructions] = useState(delivery.instructions ?? "");
  const mutation = useAdminMutation(() => updateDelivery(delivery.id, { address: address.trim(), neighborhood, instructions: instructions.trim() }), reference);
  const valid = address.trim().length >= 8 && address.trim().length <= 200 && !!neighborhood;
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" variant="outline">{t("admin.editDelivery")}</Button></DialogTrigger><DialogContent>
    <DialogHeader><DialogTitle>{t("admin.editDelivery")}</DialogTitle><DialogDescription>{reference}</DialogDescription></DialogHeader>
    <label className="block space-y-2 text-sm"><span>{t("admin.address")}</span><Input maxLength={200} value={address} onChange={e => setAddress(e.target.value)} /></label>
    <label className="block space-y-2 text-sm"><span>{t("admin.neighborhood")}</span><Pick label={t("admin.neighborhood")} value={neighborhood} onChange={setNeighborhood} options={casablancaNeighborhoods.map(value => ({ value, label: value }))} /></label>
    <label className="block space-y-2 text-sm"><span>{t("admin.instructions")}</span><Textarea maxLength={300} rows={3} value={instructions} onChange={e => setInstructions(e.target.value)} /></label>
    <Button disabled={!valid || mutation.isPending} onClick={() => mutation.mutate(undefined, { onSuccess: () => setOpen(false) })}>{t("common.actions.save")}</Button>
  </DialogContent></Dialog>;
}
