import { useEffect, useState } from "react";
import { FileText, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { reviewDocument, getDocumentBlob } from "@/services/orders.service";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RejectDocumentDialog, useAdminMutation } from "./core";
import type { Order, OrderDocument } from "@/types";
function DocumentCard({ orderId, doc }: { orderId: string; doc: OrderDocument }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false); const [reject, setReject] = useState(false);
  const [url, setUrl] = useState<string>(); const [loadError, setLoadError] = useState(false);
  const [zoom, setZoom] = useState(1); const [rotation, setRotation] = useState(0);
  const mutation = useAdminMutation(() => reviewDocument(doc.id!, "approved"), orderId);
  useEffect(() => {
    if (!open || !doc.contentUrl) return;
    let active = true; let objectUrl: string | undefined;
    getDocumentBlob(doc.contentUrl).then(value => { objectUrl = value; if (active) setUrl(value); else URL.revokeObjectURL(value); }).catch(() => active && setLoadError(true));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); setUrl(undefined); setLoadError(false); };
  }, [open, doc.contentUrl]);
  const actions = <div className="flex flex-wrap gap-2"><Button size="sm" disabled={mutation.isPending || doc.status === "approved"} onClick={() => mutation.mutate()}>{t("admin.approve")}</Button><Button size="sm" variant="outline" onClick={() => setReject(true)}>{t("admin.reject")}</Button></div>;
  return <div className="min-w-0 space-y-3 rounded-xl border p-3">
    <button className="flex h-36 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-muted/30 text-muted-foreground hover:bg-muted" onClick={() => setOpen(true)} aria-label={t("admin.preview")}>
      <FileText className="size-9" /><span className="max-w-full truncate px-3 text-xs">{doc.fileName}</span>
    </button>
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium">{t(`common.documents.${doc.type}`)}</span><StatusBadge kind="document" status={doc.status} /></div>
    {doc.rejectionReason && <p className="text-sm text-destructive">{doc.rejectionReason}</p>}{actions}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>{t(`common.documents.${doc.type}`)} · {doc.fileName}</DialogTitle></DialogHeader>
      <div className="flex gap-2"><Button size="icon" variant="outline" aria-label={t("admin.zoomIn")} onClick={() => setZoom(z => Math.min(z + .25, 2))}><ZoomIn /></Button><Button size="icon" variant="outline" aria-label={t("admin.zoomOut")} onClick={() => setZoom(z => Math.max(z - .25, .5))}><ZoomOut /></Button><Button size="icon" variant="outline" aria-label={t("admin.rotate")} onClick={() => setRotation(r => r + 90)}><RotateCw /></Button></div>
      <div className="flex h-[65vh] items-center justify-center overflow-auto rounded-lg bg-muted/30 p-3">{loadError ? <p className="text-sm text-destructive">{t("admin.documentLoadError")}</p> : !url ? <p className="text-sm text-muted-foreground">{t("common.misc.loading")}</p> : doc.mimeType === "application/pdf" ? <iframe src={url} title={doc.fileName} className="h-full w-full rounded" /> : <img src={url} alt={doc.fileName} className="max-h-full max-w-full object-contain transition-transform" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} />}</div>{actions}
    </DialogContent></Dialog>
    <RejectDocumentDialog documentId={doc.id!} orderId={orderId} open={reject} onOpenChange={setReject} />
  </div>;
}
export function OrderDocuments({ order }: { order: Order }) {
  const { t } = useI18n();
  const m = useAdminMutation(async () => { for (const d of order.documents) if (d.status !== "approved") await reviewDocument(d.id!, "approved"); }, order.id);
  return <div className="space-y-4"><div className="flex justify-end"><Button variant="outline" size="sm" disabled={m.isPending || order.documents.every(d => d.status === "approved")} onClick={() => m.mutate()}>{t("admin.approveAll")}</Button></div><div className="grid gap-4 lg:grid-cols-3">{order.documents.map(doc => <DocumentCard key={doc.id ?? doc.type} orderId={order.id} doc={doc} />)}</div></div>;
}
