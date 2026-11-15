import { createFileRoute } from "@tanstack/react-router";
import { OrderWizard } from "@/components/order/OrderWizard";
import { SiteShell } from "@/components/site/SiteShell";
import { servicesQuery } from "@/services/queries";
import type { ServiceId } from "@/types";

export const Route = createFileRoute("/commander")({
  validateSearch: (search: Record<string, unknown>): { service?: ServiceId } => {
    const s = search["service"];
    return typeof s === "string" && s.length <= 80 ? { service: s } : {};
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "Commander vos plaques en ligne | MaPlak Casa" },
      {
        name: "description",
        content: "Commandez vos plaques d'immatriculation en 4 étapes, sans compte. Livraison et pose à domicile à Casablanca.",
      },
      { property: "og:title", content: "Commander vos plaques — MaPlak Casa" },
      { property: "og:description", content: "Sans inscription, en 4 étapes, livrées et posées chez vous à Casablanca." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { service } = Route.useSearch();
  return (
    <SiteShell raiseWhatsapp>
      <OrderWizard initialService={service} />
    </SiteShell>
  );
}
