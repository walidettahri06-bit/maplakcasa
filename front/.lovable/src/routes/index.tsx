import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Advantages } from "@/components/site/sections/Advantages";
import { CtaBand } from "@/components/site/sections/CtaBand";
import { FaqSection } from "@/components/site/sections/FaqSection";
import { Hero } from "@/components/site/sections/Hero";
import { HowItWorks } from "@/components/site/sections/HowItWorks";
import { PricingSection } from "@/components/site/sections/PricingSection";
import { ServicesSection } from "@/components/site/sections/ServicesSection";
import { servicesQuery } from "@/services/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "MaPlak Casa — Vos plaques MA, directement chez vous" },
      {
        name: "description",
        content:
          "Commandez vos plaques d'immatriculation homologuées en ligne. Livraison et pose à domicile en 24 h partout à Casablanca.",
      },
      { property: "og:title", content: "MaPlak Casa — Vos plaques MA, directement chez vous" },
      {
        property: "og:description",
        content: "Plaques d'immatriculation homologuées livrées et posées à domicile à Casablanca.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <ServicesSection />
      <HowItWorks />
      <Advantages />
      <PricingSection />
      <FaqSection limit={4} />
      <CtaBand />
    </SiteShell>
  );
}
