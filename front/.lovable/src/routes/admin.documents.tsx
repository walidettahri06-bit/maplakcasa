import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ordersQuery } from "@/services/queries";
import { useI18n } from "@/i18n/I18nProvider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderDocuments } from "@/components/admin/Documents";
import {
  AdminPageHeader,
  AdminTableSkeleton,
  QueryError,
  OrderLink,
  panel,
  adminHead,
} from "@/components/admin/core";
import type { DocumentStatus } from "@/types";
export const Route = createFileRoute("/admin/documents")({
  component: Documents,
  head: () => adminHead("Documents"),
});
function Documents() {
  const { t } = useI18n();
  const q = useQuery(ordersQuery);
  const [tab, setTab] = useState("pending");
  return (
    <>
      <AdminPageHeader title={t("admin.nav.documents")} subtitle={t("admin.documentsSubtitle")} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          {(["pending", "approved", "rejected"] as DocumentStatus[]).map((s) => (
            <TabsTrigger key={s} value={s}>
              {t(`common.documentStatus.${s}`)}{" "}
              <span className="ms-2 text-xs">
                {q.data?.filter((o) => o.documents.some((d) => d.status === s)).length ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {(["pending", "approved", "rejected"] as DocumentStatus[]).map((s) => (
          <TabsContent key={s} value={s}>
            {q.isPending ? (
              <AdminTableSkeleton />
            ) : q.isError ? (
              <QueryError retry={() => q.refetch()} />
            ) : !q.data.some((o) => o.documents.some((d) => d.status === s)) ? (
              <EmptyState title={t("admin.noDocuments")} />
            ) : (
              <div className="space-y-5">
                {q.data
                  .filter((o) => o.documents.some((d) => d.status === s))
                  .map((o) => (
                    <section key={o.id} className={panel}>
                      <div className="mb-4 flex flex-wrap justify-between gap-3">
                        <OrderLink id={o.id}>{o.reference}</OrderLink>
                        <span className="text-sm text-muted-foreground">{o.customer.fullName}</span>
                      </div>
                      <OrderDocuments order={o} />
                    </section>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
