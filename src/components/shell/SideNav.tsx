import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Banknote,
  BookOpen,
  CalendarRange,
  ChevronDown,
  FolderOpen,
  Handshake,
  KeyRound,
  Package,
  PenTool,
  PencilLine,
  Pin,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { project } from "@/lib/era/project";
import { instrumentItem, lensMeta, practiceItems } from "@/lib/era/nav";
import { stageFromPath, stageList, toneLabel } from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";
import { useEra } from "@/lib/era/store";
import type { StageId } from "@/lib/era/types";

const STAGE_ICON: Record<StageId, typeof KeyRound> = {
  lease: KeyRound,
  strategic: ShieldCheck,
  brief: ScrollText,
  design: PenTool,
  procure: Package,
  construct: CalendarRange,
  handover: Handshake,
};

const PRACTICE_ICON: Record<string, typeof Banknote> = {
  "/fees": Banknote,
  "/people": Users,
  "/documents": FolderOpen,
  "/desk": PencilLine,
};

export function SideNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { lens, setCommandOpen, setFilmOpen, setFocusDecision, decisions } = useEra();
  const { currentStage, tone, live } = useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);
  const instrument = instrumentItem(viewing);
  const practice = practiceItems(lens);
  const waiting = decisions.filter((d) => d.status === "open" || d.status === "countered");
  const meta = lensMeta[lens];
  const instHere = instrument.to === "/" ? pathname === "/" : pathname.startsWith(instrument.to);

  return (
    <div className="side-nav-body">
      <div className="shrink-0 px-3 pt-4 pb-3">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-1.5" aria-label="ERA home">
          <img src="/brand/era-logo-white.png" alt="ERA" className="h-6 w-auto" />
        </Link>

        <div className="side-workspace mt-3">
          <span className="side-avatar">{project.code.slice(0, 2)}</span>
          <span className="min-w-0">
            <span className="block truncate text-body font-medium text-paper">{project.name}</span>
            <span className="block truncate font-mono text-micro text-paper/40">{project.code}</span>
          </span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-3" aria-label="Record contents">
        <Section id="pinned" label="Pinned">
          <Row
            to={"/stage/$stageId"}
            params={{ stageId: currentStage }}
            icon={Pin}
            label={`${live.n} ${live.label}`}
            hint="Live"
            active={viewing === currentStage}
            live
            onNavigate={onNavigate}
          />
          {waiting.map((d) => (
            <Row
              key={d.id}
              to="/"
              hash={d.id === "d3" ? "decision-d3" : undefined}
              icon={d.id === "d3" ? ShieldCheck : Pin}
              label={d.title}
              badge={1}
              onNavigate={() => {
                if (d.id === "d3") setFocusDecision("d3");
                onNavigate?.();
              }}
            />
          ))}
        </Section>

        <Section
          id="sequence"
          label="Sequence"
          action={
            lens !== "guest" ? (
              <button
                type="button"
                className="side-section-act"
                onClick={() => {
                  setFilmOpen(true);
                  onNavigate?.();
                }}
                aria-label="Play the sequence"
              >
                Play
              </button>
            ) : null
          }
        >
          {stageList.map((s) => {
            const Icon = STAGE_ICON[s.id];
            const t = tone(s.id);
            return (
              <Row
                key={s.id}
                to="/stage/$stageId"
                params={{ stageId: s.id }}
                icon={Icon}
                label={`${s.n}  ${s.label}`}
                active={s.id === viewing}
                live={t === "live"}
                muted={t === "ahead"}
                hint={t === "live" ? "Live" : t === "passed" ? "Closed" : toneLabel(t)}
                onNavigate={onNavigate}
              />
            );
          })}
        </Section>

        <Section id="stage" label="This stage">
          <Row
            to={instrument.to}
            icon={BookOpen}
            label={instrument.label}
            active={instHere}
            onNavigate={onNavigate}
          />
        </Section>

        {practice.length > 0 && (
          <Section id="practice" label="The practice">
            {practice.map((item) => {
              const Icon = PRACTICE_ICON[item.to] ?? FolderOpen;
              const active = pathname.startsWith(item.to);
              return (
                <Row
                  key={item.to}
                  to={item.to}
                  icon={Icon}
                  label={item.label}
                  active={active}
                  onNavigate={onNavigate}
                />
              );
            })}
          </Section>
        )}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="side-desk"
        >
          <span>Desk</span>
          <span className="font-mono text-micro text-paper/40">⌘K</span>
        </button>
        <div className="side-identity mt-2">
          <span className="side-avatar is-warm">{meta.initials}</span>
          <span className="min-w-0">
            <span className="block truncate text-body text-paper">{meta.name}</span>
            <span className="block truncate text-body-sm text-paper/45">
              {meta.expires ? `Expires ${meta.expires}` : meta.privilege}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  action,
  children,
}: {
  id?: string;
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mt-3">
      <div className="flex items-center pr-1">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="side-section"
        >
          <span>{label}</span>
          <ChevronDown className={cn("size-3.5 transition-transform duration-[var(--motion-quick)]", !open && "-rotate-90")} />
        </button>
        {action}
      </div>
      {open && <ul className="mt-0.5">{children}</ul>}
    </div>
  );
}

function Row({
  to,
  params,
  hash,
  icon: Icon,
  label,
  hint,
  active,
  live,
  muted,
  badge,
  onNavigate,
}: {
  to: string;
  params?: { stageId: string };
  hash?: string;
  icon: typeof BookOpen;
  label: string;
  hint?: string;
  active?: boolean;
  live?: boolean;
  muted?: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <Link
        to={to}
        params={params}
        hash={hash}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        title={hint}
        className={cn("side-item", active && "is-active", live && "is-live", muted && "is-muted")}
      >
        <Icon className="side-ico" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {badge ? <span className="side-badge">{badge}</span> : live ? <span className="side-dot" aria-label="Live" /> : null}
      </Link>
    </li>
  );
}
