import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilmStill({
  src,
  alt,
  className,
  children,
  side,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
  side?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-ink", className)}>
      <img
        src={src}
        alt={alt}
        className="kenburns absolute inset-0 h-full w-full object-cover"
      />
      <div className={cn("absolute inset-0", side ? "film-scrim-side" : "film-scrim")} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function PunchStats({
  items,
  invert,
}: {
  items: { k: string; v: string }[];
  invert?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px sm:grid-cols-4",
        invert ? "bg-white/15" : "bg-rule",
      )}
    >
      {items.map((it) => (
        <div
          key={it.k}
          className={cn("px-4 py-4 sm:px-5 sm:py-5", invert ? "bg-ink/40" : "bg-paper")}
        >
          <dt className={cn("label-track", invert ? "text-ice" : "text-petrol")}>{it.k}</dt>
          <dd
            className={cn(
              "mt-1 font-serif text-[22px] leading-tight sm:text-[26px]",
              invert ? "text-paper" : "text-ink",
            )}
          >
            {it.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
