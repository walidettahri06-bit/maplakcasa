import { FileCheck2, Truck, UserRound, Wrench } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { SectionHeading } from "../SectionHeading";

const icons = [UserRound, Wrench, FileCheck2, Truck];

export function HowItWorks() {
  const { t, tm } = useI18n();
  const steps = tm<{ title: string; text: string }[]>("site.how.steps");

  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
      <div className="absolute inset-0 bg-grid-ink opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow={t("site.how.eyebrow")} title={t("site.how.title")} tone="light" />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ink-border bg-ink-border sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = icons[i] ?? UserRound;
            return (
              <li key={s.title} className="group relative bg-ink p-7 transition-colors hover:bg-ink-soft">
                <span className="font-display text-6xl font-extrabold text-ink-foreground/10 transition-colors group-hover:text-primary/40">
                  0{i + 1}
                </span>
                <div className="mt-4 flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold uppercase text-ink-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
