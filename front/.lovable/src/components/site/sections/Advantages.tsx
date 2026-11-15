import { BadgeCheck, Banknote, Clock3, Headset, Lock, Wrench } from "lucide-react";
import deliveryImg from "@/assets/delivery.jpg";
import installImg from "@/assets/installation.jpg";
import { useI18n } from "@/i18n/I18nProvider";
import { SectionHeading } from "../SectionHeading";

const icons = [BadgeCheck, Clock3, Wrench, Banknote, Lock, Headset];

export function Advantages() {
  const { t, tm } = useI18n();
  const items = tm<{ title: string; text: string }[]>("site.advantages.items");

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <img
            src={installImg}
            alt=""
            loading="lazy"
            width={1280}
            height={960}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card"
          />
          <img
            src={deliveryImg}
            alt=""
            loading="lazy"
            width={1280}
            height={960}
            className="absolute -bottom-8 end-[-0.5rem] hidden aspect-[4/3] w-1/2 rounded-xl border-4 border-background object-cover shadow-card sm:block"
          />
          <div className="absolute -top-4 start-4 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-red">
            <p className="font-display text-3xl font-extrabold leading-none">24h</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider">{t("site.hero.stat1Label")}</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading align="start" eyebrow={t("site.advantages.eyebrow")} title={t("site.advantages.title")} />
          <ul className="mt-10 grid gap-x-6 gap-y-7 sm:grid-cols-2">
            {items.map((item, i) => {
              const Icon = icons[i] ?? BadgeCheck;
              return (
                <li key={item.title} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
