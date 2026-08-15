import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEra } from "@/lib/era/store";
import { project } from "@/lib/era/project";
import { chapterOf, lensMeta, navItems, type NavItem } from "@/lib/era/nav";
import type { Lens } from "@/lib/era/types";
import { CommandPalette } from "./CommandPalette";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { StagePassage } from "@/components/record/StagePassage";
import { FilmStrip } from "@/components/record/FilmStrip";
import { PulseBar } from "@/components/record/PulseBar";
import { useStageProgress } from "@/lib/era/progress";
import {
  STAGE_ORDER,
  adjacentStages,
  liveSubtitle,
  stageBook,
  stageFromPath,
} from "@/lib/era/stages";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lens, setLens, setCommandOpen, commandOpen, passage, markVisit, visit } = useEra();
  const { currentStage } = useStageProgress();
  const [open, setOpen] = useState(false);
  const [returned, setReturned] = useState<string | null>(null);
  const meta = lensMeta[lens];
  const items = navItems.filter((n) => n.lenses.includes(lens));
  const navigate = useNavigate();

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (commandOpen || passage) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const viewing = stageFromPath(pathname, currentStage);
      const { prev, next } = adjacentStages(viewing);
      if (e.key === "ArrowRight" || e.key === "]") {
        if (!next) return;
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: next.id } });
      } else if (e.key === "ArrowLeft" || e.key === "[") {
        if (!prev) return;
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: prev.id } });
      } else if (/^[0-6]$/.test(e.key)) {
        const id = STAGE_ORDER[Number(e.key)];
        if (!id) return;
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: id } });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, passage, pathname, currentStage, navigate]);

  useEffect(() => {
    if (visit && Date.now() - visit.at > 90_000) {
      const live = stageBook[currentStage];
      setReturned(
        visit.stage !== currentStage
          ? `The sequence moved. ${live.n} ${live.label} is live.`
          : `${live.n} ${live.label} is as you left it.`,
      );
    }
    markVisit(currentStage);
    // first mount only — visit is the prior persist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <button
          type="button"
          aria-label="Open the desk"
          className="hit-44 grid place-items-center font-mono text-micro text-ice"
          onClick={() => setCommandOpen(true)}
        >
          ⌘K
        </button>
      </header>

      <div className="lg:flex">
        <aside className="shell-sidebar sticky top-0 hidden h-dvh min-h-0 shrink-0 flex-col overflow-hidden bg-ink text-paper lg:flex">
          <TitleBlock />
          <NavList items={items} pathname={pathname} />
          <Invitation lens={lens} setLens={setLens} />
        </aside>

        <main id="record" className="min-w-0 flex-1">
          <div className="hidden lg:block">
            <PulseBar pathname={pathname} />
          </div>
          {returned && (
            <div className="flex items-center justify-between gap-3 border-b border-hairline bg-paper px-4 py-2.5 sm:px-8">
              <p className="min-w-0 truncate text-body-sm text-ink/80">
                <span className="label-track mr-2 text-petrol">Since you left</span>
                {returned}
              </p>
              <button
                type="button"
                className="shrink-0 font-mono text-micro text-muted hover:text-ink"
                onClick={() => setReturned(null)}
              >
                Dismiss
              </button>
            </div>
          )}
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
    <div className="relative shrink-0 border-b border-white/10 px-5 pb-4 pt-5">
      <Link to="/login" className="inline-block">
        <img src="/brand/era-logo-white.png" alt="ERA" className="h-8 w-auto" />
      </Link>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <p className="label-track text-ice">Controlled record</p>
        <p className="font-mono text-micro text-paper/40">{project.code}</p>
      </div>
      <h1 className="mt-1 font-serif text-2xl leading-snug">{project.name}</h1>
      <p className="mt-1 text-body-sm text-paper/70">{project.subtitle}</p>
    </div>
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
  const { currentStage } = useStageProgress();
  const chapter = stageFromPath(pathname, currentStage);
  const chapterPaths = chapterOf[chapter];
  const here = items.filter((n) => chapterPaths.includes(n.to));
  const elsewhere = items.filter((n) => !chapterPaths.includes(n.to));
  const viewed = stageBook[chapter];
  const [more, setMore] = useState(false);

  return (
    <nav
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3"
      aria-label="Record contents"
    >
      <StageStrip pathname={pathname} onNavigate={onNavigate} />
      <p className="label-track mt-4 px-2 text-paper/40">
        This chapter · {viewed.n} {viewed.label}
      </p>
      <ItemList items={here} pathname={pathname} onNavigate={onNavigate} start={1} />
      {elsewhere.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={more}
            onClick={() => setMore((v) => !v)}
            className="label-track flex min-h-11 w-full items-center justify-between px-2 text-paper/40 hover:text-paper/70"
          >
            <span>Elsewhere</span>
            <span className="font-mono text-micro">{more ? "–" : `+${elsewhere.length}`}</span>
          </button>
          {more && (
            <ItemList items={elsewhere} pathname={pathname} onNavigate={onNavigate} start={here.length + 1} muted />
          )}
        </div>
      )}
    </nav>
  );
}

function ItemList({
  items,
  pathname,
  onNavigate,
  start,
  muted,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  start: number;
  muted?: boolean;
}) {
  return (
    <ul className="mt-2">
      {items.map((item, i) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const n = String(start + i).padStart(2, "0");
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center gap-3 px-2.5 text-body transition-colors duration-[var(--motion-quick)]",
                active
                  ? "bg-white/10 text-paper"
                  : muted
                    ? "text-paper/45 hover:bg-white/5 hover:text-paper"
                    : "text-paper/65 hover:bg-white/5 hover:text-paper",
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
      <div className="mt-2 px-1">
        <FilmStrip pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="mt-3 px-2">
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
      <div className={cn("invite-card mt-2 px-3 py-2.5", rising && "is-rising")}>
        <div key={lens} className={cn(turned && "invite-face")}>
          <p className="font-serif text-lg leading-tight">{meta.name}</p>
          <p className="mt-0.5 text-body-sm leading-snug text-ink/80">{meta.privilege}</p>
          <p
            className={cn(
              "mt-0.5 font-mono text-micro tracking-wide",
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
