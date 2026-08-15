import { cn } from "@/lib/utils";
import type { Stamp as StampKind } from "@/lib/era/types";

const copy: Record<StampKind, string> = {
  draft: "Draft · not certified",
  issued: "Issued",
  certified: "Certified",
  superseded: "Superseded",
  internal: "ERA only",
};

export function Stamp({
  kind,
  className,
  invert,
}: {
  kind: StampKind;
  className?: string;
  invert?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border px-1.5 py-0.5 label-track",
        invert
          ? {
              certified: "border-paper text-paper",
              issued: "border-ice text-ice",
              draft: "border-signal-hold/70 text-signal-hold bg-draft-wash/10",
              superseded: "border-white/30 text-paper/50",
              internal: "border-ice bg-ice text-ink",
            }[kind]
          : {
              certified: "border-ink text-ink",
              issued: "border-petrol text-petrol",
              draft: "border-signal-hold/50 bg-draft-wash text-signal-hold",
              superseded: "border-rule text-muted",
              internal: "border-ink bg-ink text-ice",
            }[kind],
        className,
      )}
    >
      {copy[kind]}
    </span>
  );
}
