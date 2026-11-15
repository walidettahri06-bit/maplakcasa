import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { CtaBand } from "@/components/site/sections/CtaBand";
import { FaqSection } from "@/components/site/sections/FaqSection";
import { PricingSection } from "@/components/site/sections/PricingSection";
import { useI18n } from "@/i18n/I18nProvider";
import { servicesQuery } from "@/services/queries";

export const Route = createFileRoute("/tarifs")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "Tarifs des plaques d'immatriculation | MaPlak Casa" },
      {
        name: "description",
        content: "Prix clairs et tout compris pour vos plaques d'immatriculation à Casablanca : fabrication, livraison et pose.",
      },
      { property: "og:title", content: "Tarifs — MaPlak Casa" },
      { property: "og:description", content: "Plaques homologuées livrées et posées à domicile, sans frais cachés." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero title={t("site.pages.pricingTitle")} text={t("site.pages.pricingText")} />
      <PricingSection />
      <FaqSection limit={3} />
      <CtaBand />
    </SiteShell>
  );
}
