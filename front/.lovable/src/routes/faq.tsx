import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SiteShell } from "@/components/site/SiteShell";
import { CtaBand } from "@/components/site/sections/CtaBand";
import { FaqSection } from "@/components/site/sections/FaqSection";
import { useI18n } from "@/i18n/I18nProvider";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Questions fréquentes | MaPlak Casa" },
      {
        name: "description",
        content: "Documents requis, délais, paiement à la livraison, zone desservie : toutes les réponses sur MaPlak Casa.",
      },
      { property: "og:title", content: "Questions fréquentes — MaPlak Casa" },
      { property: "og:description", content: "Tout savoir avant de commander vos plaques d'immatriculation à Casablanca." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHero title={t("site.pages.faqTitle")} text={t("site.pages.faqText")} />
      <FaqSection />
      <CtaBand />
    </SiteShell>
  );
}
