import { Link } from "@tanstack/react-router";
import { List } from "lucide-react";
import { useEra } from "@/lib/era/store";
import { InvitationSeal } from "./InvitationSeal";
import { StudioMenu } from "./StudioMenu";

export function PracticeRail({
  folioOpen,
  inviteOpen,
  studioOpen,
  onFolio,
  onInvite,
  onStudio,
  onClosePop,
}: {
  folioOpen: boolean;
  inviteOpen: boolean;
  studioOpen: boolean;
  onFolio: () => void;
  onInvite: () => void;
  onStudio: () => void;
  onClosePop: () => void;
}) {
  const { lens, setCommandOpen } = useEra();

  return (
    <aside className="practice-rail" aria-label="Practice">
      <Link to="/" className="rail-logo" aria-label="ERA — Farringdon record">
        <img src="/brand/era-logo-white.png" alt="" className="h-7 w-auto" />
      </Link>

      <button
        type="button"
        aria-expanded={folioOpen}
        aria-label="Contents"
        onClick={onFolio}
        className={folioOpen ? "rail-btn is-on" : "rail-btn"}
      >
        <List className="size-4" />
      </button>

      <div className="mt-auto flex flex-col items-center gap-2 pb-3">
        <InvitationSeal lens={lens} open={inviteOpen} onToggle={onInvite} onClose={onClosePop} />
        {lens === "era" && <StudioMenu open={studioOpen} onToggle={onStudio} onClose={onClosePop} />}
        <button type="button" aria-label="Open the desk" className="rail-btn" onClick={() => setCommandOpen(true)}>
          ⌘K
        </button>
      </div>
    </aside>
  );
}
