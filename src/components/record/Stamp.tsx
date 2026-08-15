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
  press,
}: {
  kind: StampKind;
  className?: string;
  invert?: boolean;
  press?: boolean;
}) {
  const seat = press ?? kind === "certified";

  return (
    <span
      className={cn(
        "stamp",
        `stamp-${kind}`,
        invert && "is-invert",
        seat && "stamp-press",
        className,
      )}
    >
      {copy[kind]}
    </span>
  );
}
