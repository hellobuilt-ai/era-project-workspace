import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useEra } from "@/lib/era/store";
import { useStageProgress } from "@/lib/era/progress";
import { adjacentStages } from "@/lib/era/stages";
import { SideNav } from "./SideNav";

export function MobileTop() {
  const { live, currentStage, qualityCertified, setFocusDecision, decisions } = useStageProgress();
  const waiting = decisions.filter((d) => d.status === "open" || d.status === "countered");
  const setCommandOpen = useEra((s) => s.setCommandOpen);
  const closeGate = currentStage === "strategic" && !qualityCertified;

  return (
    <header className="mobile-top">
      <Link to="/" className="grid size-11 place-items-center" aria-label="ERA home">
        <img src="/brand/era-logo-white.png" alt="" className="h-5 w-auto" />
      </Link>
      <Link
        to={closeGate ? "/" : "/stage/$stageId"}
        hash={closeGate ? "decision-d3" : undefined}
        params={closeGate ? undefined : { stageId: currentStage }}
        onClick={() => {
          if (closeGate) setFocusDecision("d3");
        }}
        className="min-w-0 text-center"
      >
        <p className="label-track text-ice">
          {live.n} {live.label}
        </p>
      </Link>
      <button type="button" className="hit-44 px-2 font-mono text-micro text-ice" onClick={() => setCommandOpen(true)}>
        {waiting.length > 0 ? waiting.length : "·"}
      </button>
    </header>
  );
}

export function MobileDock({ onContents }: { onContents: () => void }) {
  const { currentStage, live, qualityCertified, setFocusDecision, lens } = useStageProgress();
  const setCommandOpen = useEra((s) => s.setCommandOpen);
  const closeGate = currentStage === "strategic" && !qualityCertified;
  const next = adjacentStages(currentStage).next;
  const guest = lens === "guest";

  return (
    <div className="mobile-dock">
      {!guest && closeGate ? (
        <Link to="/" hash="decision-d3" onClick={() => setFocusDecision("d3")} className="dock-act">
          Close 01
        </Link>
      ) : !guest && next ? (
        <Link to="/stage/$stageId" params={{ stageId: next.id }} className="dock-act">
          Next {next.n}
        </Link>
      ) : (
        <span className="dock-act is-quiet">{live.n} live</span>
      )}
      <button type="button" onClick={onContents} className="dock-btn">
        Menu
      </button>
      <button type="button" onClick={() => setCommandOpen(true)} className="dock-btn">
        Desk
      </button>
    </div>
  );
}

export function MobileDrawer({
  open,
  pathname,
  onClose,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = panel.current;
    const first = root?.querySelector<HTMLElement>("button, a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !root) return;
      const nodes = [...root.querySelectorAll<HTMLElement>("button, a, [href]")].filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (!nodes.length) return;
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button type="button" className="drawer-scrim scrim absolute inset-0" aria-label="Close menu" onClick={onClose} />
      <div ref={panel} className="drawer-panel mobile-drawer">
        <div className="flex justify-end px-2 pt-2">
          <button type="button" onClick={onClose} className="hit-44 px-3 font-mono text-micro text-paper/50 hover:text-paper">
            Close
          </button>
        </div>
        <SideNav pathname={pathname} onNavigate={onClose} />
      </div>
    </div>
  );
}
