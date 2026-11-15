import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
        <span className="h-px w-6 bg-primary" />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl",
          tone === "light" ? "text-ink-foreground" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-base sm:text-lg", tone === "light" ? "text-ink-muted" : "text-muted-foreground")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
