import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/i18n/I18nProvider";
import { SectionHeading } from "../SectionHeading";

export function FaqSection({ limit }: { limit?: number }) {
  const { t, tm } = useI18n();
  const all = tm<{ q: string; a: string }[]>("site.faq.items");
  const items = limit ? all.slice(0, limit) : all;

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading align="start" eyebrow={t("site.faq.eyebrow")} title={t("site.faq.title")} />
        <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-start text-base font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
