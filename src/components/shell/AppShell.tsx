import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn, gbp } from "@/lib/utils";
import { useEra } from "@/lib/era/store";
import { project } from "@/lib/era/project";
import { lensMeta, navItems, type NavItem } from "@/lib/era/nav";
import type { Lens } from "@/lib/era/types";
import { CommandPalette } from "./CommandPalette";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { stills } from "@/lib/era/stills";
import { StageRail } from "@/components/record/StageRail";
import { StagePassage } from "@/components/record/StagePassage";
import { useStageProgress } from "@/lib/era/progress";
import { adjacentStages, liveSubtitle, stageBook, stageFromPath } from "@/lib/era/stages";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lens, setLens, setCommandOpen } = useEra();
  const [open, setOpen] = useState(false);
  const meta = lensMeta[lens];
  const items = navItems.filter((n) => n.lenses.includes(lens));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-warm text-ink">
      <a
        href="#record"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to record
      </a>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-ink px-3 text-paper lg:hidden">
        <button
          type="button"
          aria-label="Open contents"
          className="hit-44 grid place-items-center"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </button>
        <MobileStageMark />
        <Link to="/login" className="hit-44 grid place-items-center">
          <img src="/brand/era-mark.png" alt="ERA" className="size-7" />
        </Link>
      </header>

      <div className="lg:flex">
        <aside className="shell-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden bg-ink text-paper lg:flex">
          <TitleBlock />
          <NavList items={items} pathname={pathname} />
          <Invitation lens={lens} setLens={setLens} />
        </aside>

        <main id="record" className="min-w-0 flex-1">
          {lens === "guest" && (
            <div className="bg-ink px-4 py-2 text-center text-body-sm text-ice sm:px-8">
              Issued to {meta.name} · Licence pack · expires {meta.expires} · not a public link
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="drawer-scrim scrim absolute inset-0"
            aria-label="Close contents"
            onClick={() => setOpen(false)}
          />
          <div className="drawer-panel shell-drawer absolute inset-y-0 left-0 flex h-full flex-col overflow-hidden bg-ink text-paper">
            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="Close contents"
                className="absolute right-1 top-1 z-10 hit-44 grid place-items-center text-paper"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
              <TitleBlock />
            </div>
            <NavList items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
            <Invitation lens={lens} setLens={setLens} />
          </div>
        </div>
      )}

      <CommandPalette />
      <StagePassage />
    </div>
  );
}

function MobileStageMark() {
  const { live, currentStage, qualityCertified, setFocusDecision } = useStageProgress();
  const closeGate = currentStage === "strategic" && !qualityCertified;
  return (
    <Link
      to={closeGate ? "/" : "/stage/$stageId"}
      hash={closeGate ? "decision-d3" : undefined}
      params={closeGate ? undefined : { stageId: currentStage }}
      onClick={() => {
        if (closeGate) setFocusDecision("d3");
      }}
      className="min-w-0 text-center"
    >
      <p className="truncate font-serif text-[length:var(--text-body)]">{project.name}</p>
      <p className="label-track text-ice">
        {live.n} {live.label}
        {closeGate ? " · close to open 02" : " · live"}
      </p>
    </Link>
  );
}

function TitleBlock() {
  return (
    <div className="relative shrink-0 overflow-hidden border-b border-white/10 px-5 pb-4 pt-5">
      <img
        src={stills.cdn.night}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
      />
      <div className="title-still-scrim absolute inset-0" />
      <div className="relative">
        <Link to="/login" className="inline-block">
          <img src="/brand/era-logo-white.png" alt="ERA" className="h-8 w-auto" />
        </Link>
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <p className="label-track text-ice">Controlled record</p>
          <p className="font-mono text-micro text-paper/40">{project.code}</p>
        </div>
        <h1 className="mt-1 font-serif text-2xl leading-snug">{project.name}</h1>
        <p className="mt-1 text-body-sm text-paper/70">{project.subtitle}</p>
        <CertaintyInstrument />
        <WhatNeedsYou />
      </div>
    </div>
  );
}

function CertaintyInstrument() {
  const band = Math.round(project.certaintyBand * 100);
  return (
    <div className="instrument-plate mt-3 px-2.5 py-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="label-track text-ice">Cost certainty</p>
        <p className="font-mono text-micro text-paper/50">±{band}%</p>
      </div>
      <p className="money mt-0.5 text-lg tracking-tight text-paper">{gbp(project.certainty)}</p>
      <div className="instrument-scale mt-1.5" aria-hidden>
        <span className="instrument-band" />
        <span className="instrument-needle" />
      </div>
    </div>
  );
}

function WhatNeedsYou() {
  const { decisions, setCommandOpen } = useEra();
  const waiting = decisions.filter((d) => d.status === "open" || d.status === "countered");
  const count = waiting.length;

  return (
    <button
      type="button"
      onClick={() => setCommandOpen(true)}
      className="needs-slip mt-3 w-full px-3 py-2 text-left"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="label-track text-ice">What needs you</span>
        <span className="font-mono text-micro text-paper/50" aria-live="polite">
          {count > 0 ? count : "Quiet"} · ⌘K
        </span>
      </span>
      {count > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {waiting.map((d) => (
            <li key={d.id} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-body-sm text-paper" title={d.title}>
                {d.title}
              </span>
              <span className="shrink-0 font-mono text-micro uppercase tracking-wide text-paper/45">
                {d.status === "open" ? "Open" : d.aiDraft ? "Draft" : "Hold"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-body-sm text-paper/60">Nothing waiting. The record is quiet.</p>
      )}
    </button>
  );
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3"
      aria-label="Record contents"
    >
      <StageStrip pathname={pathname} onNavigate={onNavigate} />
      <p className="label-track mt-4 px-2 text-paper/40">Contents</p>
      <ul className="mt-2">
        {items.map((item, i) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 px-2.5 text-body transition-colors duration-[var(--motion-quick)]",
                  active ? "bg-white/10 text-paper" : "text-paper/65 hover:bg-white/5 hover:text-paper",
                )}
              >
                {active && <span className="folio-ice-rule" aria-hidden />}
                <span className="w-5 shrink-0 font-mono text-micro text-paper/40">{n}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function StageStrip({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { currentStage, live, qualityCertified, setFocusDecision, tone, constructWeek, issued } =
    useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);
  const viewed = stageBook[viewing];
  const nextLive = adjacentStages(currentStage).next;
  const closeGate = currentStage === "strategic" && !qualityCertified;
  const t = tone(viewing);

  let action: { hash?: string; stageId?: string; label: string } | null = null;
  if (closeGate) {
    action = { hash: "decision-d3", label: "Close 01 to open 02" };
  } else if (viewing !== currentStage) {
    action = { stageId: currentStage, label: `Enter ${live.n} ${live.label}` };
  } else if (nextLive) {
    action = { stageId: nextLive.id, label: `Next ${nextLive.n} ${nextLive.label}` };
  }

  return (
    <div>
      <p className="label-track px-2 text-paper/40">Sequence</p>
      <div className="mt-1 px-1">
        <StageRail pathname={pathname} invert viewing={viewing} />
      </div>
      <div className="mt-2 px-2">
        <p className="font-serif text-xl leading-tight text-paper">
          {live.n} {live.label}
          <span className="ml-2 font-sans text-body-sm font-normal tracking-normal text-paper/50">live</span>
        </p>
        <p className="mt-0.5 text-body-sm text-paper/60">
          {closeGate
            ? "Quality band holds the gate to 02"
            : viewing === currentStage
              ? liveSubtitle(viewing, {
                  qualityCertified,
                  constructWeek,
                  issuedHandover: Boolean(issued.handover),
                })
              : `${viewed.n} ${viewed.label} · ${t === "passed" ? "closed" : t}`}
        </p>
        {action &&
          (action.hash ? (
            <Link
              to="/"
              hash={action.hash}
              onClick={() => {
                setFocusDecision("d3");
                onNavigate?.();
              }}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-between bg-paper px-3 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
            >
              <span>{action.label}</span>
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <Link
              to="/stage/$stageId"
              params={{ stageId: action.stageId ?? currentStage }}
              onClick={onNavigate}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-between bg-paper px-3 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
            >
              <span>{action.label}</span>
              <span aria-hidden>→</span>
            </Link>
          ))}
      </div>
    </div>
  );
}

function Invitation({
  lens,
  setLens,
}: {
  lens: Lens;
  setLens: (l: Lens) => void;
}) {
  const meta = lensMeta[lens];
  const [rising, setRising] = useState(false);
  const [turned, setTurned] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const turnTo = (next: Lens) => {
    if (next === lens) return;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setRising(true);
    const swap = window.setTimeout(() => {
      setLens(next);
      setTurned(true);
      const settle = window.setTimeout(() => setRising(false), 50);
      timers.current.push(settle);
    }, 130);
    timers.current.push(swap);
  };

  return (
    <div className="shrink-0 border-t border-white/10 p-3">
      <p className="label-track text-paper/40">Invitation</p>
      <div className={cn("invite-card mt-2 px-3 py-3", rising && "is-rising")}>
        <div key={lens} className={cn(turned && "invite-face")}>
          <p className="font-serif text-xl leading-tight">{meta.name}</p>
          <p className="mt-1 text-body leading-snug text-ink">{meta.privilege}</p>
          <p
            className={cn(
              "mt-1 font-mono text-body-sm tracking-wide",
              meta.expires ? "tabular-nums text-petrol" : "text-ink/55",
            )}
          >
            {meta.expires ? `Expires ${meta.expires}` : meta.org}
          </p>
        </div>
        <p className="label-track mt-3 text-ink/35">Preview lens</p>
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          {(["era", "client", "guest"] as Lens[]).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lens === l}
              onClick={() => turnTo(l)}
              className={cn(
                "label-track hit-44 px-1 transition-colors duration-[var(--motion-quick)]",
                lens === l
                  ? "border border-ink/20 text-ink"
                  : "border border-transparent text-ink/35 hover:text-ink/65",
              )}
            >
              {l === "era" ? "ERA" : l === "client" ? "Client" : "Guest"}
            </button>
          ))}
        </div>
      </div>
      <SignedIn>
        <div className="mt-3 text-body-sm text-paper/70">
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
