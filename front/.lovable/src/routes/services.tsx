import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { Advantages } from "@/components/site/sections/Advantages";
import { CtaBand } from "@/components/site/sections/CtaBand";
import { HowItWorks } from "@/components/site/sections/HowItWorks";
import { ServicesSection } from "@/components/site/sections/ServicesSection";
import { useI18n } from "@/i18n/I18nProvider";
import { servicesQuery } from "@/services/queries";

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "Services — Plaque avant, arrière ou paire | MaPlak Casa" },
      {
        name: "description",
        content: "Plaque avant, plaque arrière ou paire complète : fabrication, livraison et pose à domicile à Casablanca.",
      },
      { property: "og:title", content: "Services de plaques d'immatriculation | MaPlak Casa" },
      { property: "og:description", content: "Plaque avant, arrière ou paire, livrée et posée chez vous à Casablanca." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero title={t("site.pages.servicesTitle")} text={t("site.pages.servicesText")} />
      <ServicesSection />
      <HowItWorks />
      <Advantages />
      <CtaBand />
    </SiteShell>
  );
}
