import { lensMeta } from "@/lib/era/nav";
import type { Lens } from "@/lib/era/types";
import { cn } from "@/lib/utils";

export function InvitationSeal({
  lens,
  open,
  onToggle,
  onClose,
  placement = "rail",
}: {
  lens: Lens;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  placement?: "rail" | "line";
}) {
  const meta = lensMeta[lens];

  if (placement === "line") {
    return (
      <div>
        <button type="button" onClick={onToggle} aria-expanded={open} className="invite-line">
          <span className="font-mono text-micro">{meta.initials}</span>
          <span className="truncate">{meta.name}</span>
          {meta.expires ? <span className="text-ice">Exp {meta.expires}</span> : null}
        </button>
        {open && <InvitationCard lens={lens} onClose={onClose} />}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Invitation, ${meta.name}`}
        className={cn("invite-seal", open && "is-open")}
      >
        {meta.initials}
      </button>
      {open && (
        <div className="invite-pop">
          <InvitationCard lens={lens} onClose={onClose} />
        </div>
      )}
    </div>
  );
}

function InvitationCard({ lens, onClose }: { lens: Lens; onClose: () => void }) {
  const meta = lensMeta[lens];
  return (
    <div className="invite-card px-4 py-4" role="dialog" aria-label="Invitation">
      <p className="label-track text-ink/40">Invitation</p>
      <p className="mt-2 font-serif text-xl leading-tight">{meta.name}</p>
      <p className="mt-1 text-body-sm text-ink/75">{meta.privilege}</p>
      <p className="mt-3 text-body">{meta.whisper}</p>
      <p className={cn("mt-2 font-mono text-micro", meta.expires ? "text-petrol" : "text-ink/50")}>
        {meta.expires ? `Expires ${meta.expires}` : meta.org}
      </p>
      <button type="button" onClick={onClose} className="mt-3 font-mono text-micro text-ink/45 hover:text-ink">
        Close
      </button>
    </div>
  );
}
