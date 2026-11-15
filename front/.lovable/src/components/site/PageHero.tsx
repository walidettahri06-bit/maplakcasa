/** Compact dark header for inner public pages. */
export function PageHero({ title, text }: { title: string; text: string }) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-grid-ink opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <span className="mb-5 block h-1 w-12 bg-primary" />
        <h1 className="animate-rise font-display text-4xl font-extrabold uppercase text-ink-foreground sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl animate-rise text-lg text-ink-muted [animation-delay:120ms]">{text}</p>
      </div>
    </section>
  );
}
