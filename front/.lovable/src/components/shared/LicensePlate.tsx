import { cn } from "@/lib/utils";
import type { PlateNumber } from "@/types";

const sizes = {
  sm: "h-9 text-lg gap-2 px-3 border-2",
  md: "h-14 text-3xl gap-3 px-5 border-[3px]",
  lg: "h-20 text-5xl gap-4 px-7 border-4",
};

const latinLetterByArabic: Record<string, string> = {
  "أ": "A",
  "ب": "B",
  "د": "D",
  "هـ": "H",
  "و": "E",
  "ط": "T",
  "ج": "J",
  "ح": "H",
  "ي": "Y",
  "ك": "K",
  "ل": "L",
  "م": "M",
};

/** Bilingual Moroccan plate preview. The outer layout always stays left-to-right. */
export function LicensePlate({
  plate,
  size = "md",
  className,
}: {
  plate: Partial<PlateNumber>;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const serial = plate.serial || "00000";
  const letter = plate.letter || "ب";
  const latinLetter = latinLetterByArabic[letter] ?? "";
  const region = plate.region || "00";
  const Divider = () => <span aria-hidden="true" className="h-[58%] w-px shrink-0 bg-plate-ink/70 sm:w-[2px]" />;
  return (
    <div
      dir="ltr"
      role="img"
      aria-label={`MA | ${serial} | ${letter} / ${latinLetter} | ${region}`}
      className={cn(
        "inline-flex max-w-full select-none items-center justify-between rounded-md border-plate-ink bg-[linear-gradient(180deg,#fff_0%,#fafafa_45%,#ededed_50%,#fff_55%,#fafafa_100%)] font-plate font-bold tabular-nums tracking-wider text-plate-ink shadow-plate",
        sizes[size],
        className,
      )}
    >
      <span className="shrink-0 font-sans text-[0.58em] font-black tracking-wider">MA</span>
      <Divider />
      <span className="min-w-[4.2ch] shrink text-center">{serial}</span>
      <Divider />
      <span dir="ltr" className="flex shrink-0 items-center whitespace-nowrap">
        <bdi dir="rtl" className="font-arabic text-[0.82em] leading-none">{letter}</bdi>
        <span aria-hidden="true" className="mx-[0.12em] font-sans text-[0.58em]">/</span>
        <span className="font-sans text-[0.58em] font-extrabold">{latinLetter}</span>
      </span>
      <Divider />
      <span className="min-w-[1.5ch] shrink-0 text-center">{region}</span>
    </div>
  );
}
