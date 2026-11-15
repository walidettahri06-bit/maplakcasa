import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** MaPlak Casa wordmark: a mini plate glyph + name. `tone` adapts to dark/light surfaces. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="MaPlak Casa">
      <span
        dir="ltr"
        className="relative flex h-8 items-center gap-1 rounded-[5px] border-2 border-plate-ink bg-plate px-1.5 font-plate text-sm font-bold leading-none text-plate-ink shadow-plate"
      >
        <span className="h-4 w-1 rounded-sm bg-primary" />
        MP
      </span>
      <span
        dir="ltr"
        className={cn(
          "font-display text-xl font-extrabold uppercase tracking-tight",
          tone === "light" ? "text-ink-foreground" : "text-foreground",
        )}
      >
        MaPlak<span className="text-primary">Casa</span>
      </span>
    </Link>
  );
}
