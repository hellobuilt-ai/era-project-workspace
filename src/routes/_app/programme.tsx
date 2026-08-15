import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { project, weeks } from "@/lib/era/project";
import type { Week } from "@/lib/era/types";
import { FilmStill } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { stills } from "@/lib/era/stills";
import { cn } from "@/lib/utils";
import { useStageProgress } from "@/lib/era/progress";
import { weekStatus } from "@/lib/era/stages";
import { FloorPlate } from "@/components/record/FloorPlate";

export const Route = createFileRoute("/_app/programme")({ component: ProgrammePage });

const PHASE_ORDER = ["Strip-out", "First fix", "Second fix", "Commission", "Handover"] as const;

function visualPhase(phase: string) {
  if (phase === "Soft landing") return "Handover";
  return phase;
}

function groupWeeks(list: Week[]) {
  const groups: { phase: string; weeks: Week[] }[] = [];
  for (const week of list) {
    const phase = visualPhase(week.phase);
    const last = groups[groups.length - 1];
    if (last && last.phase === phase) last.weeks.push(week);
    else groups.push({ phase, weeks: [week] });
  }
  return groups.sort(
    (a, b) =>
      PHASE_ORDER.indexOf(a.phase as (typeof PHASE_ORDER)[number]) -
      PHASE_ORDER.indexOf(b.phase as (typeof PHASE_ORDER)[number]),
  );
}

function statusCopy(status: Week["status"], instrumentLive: boolean) {
  if (!instrumentLive) return "Proposed";
  if (status === "done") return "Done";
  if (status === "live") return "Live";
  if (status === "next") return "Next";
  return "Later";
}

function ProgrammePage() {
  const {
    currentStage,
    live,
    issued,
    constructWeek,
    mayCompleteWeek,
    mayIssue,
    completeWeek,
    issueStage,
    holder,
  } = useStageProgress();
  const constructLive = currentStage === "construct";
  const constructPassed = Boolean(issued.construct) || currentStage === "handover";
  const instrumentLive = constructLive || constructPassed;
  const weekN = constructWeek ?? 1;
  const [focusWeek, setFocusWeek] = useState(constructLive ? weekN : 1);
  const [issuing, setIssuing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const skipScroll = useRef(true);
  const groups = useMemo(() => groupWeeks(weeks), []);

  useEffect(() => {
    if (constructLive) setFocusWeek(weekN);
  }, [constructLive, weekN]);

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    const node = stripRef.current?.querySelector<HTMLElement>(`[data-week="${focusWeek}"]`);
    node?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [focusWeek]);

  useEffect(() => {
    if (!playing) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setFocusWeek(14);
      setPlaying(false);
      return;
    }
    const id = window.setInterval(() => {
      setFocusWeek((w) => {
        if (w >= 14) {
          window.clearInterval(id);
          setPlaying(false);
          return 14;
        }
        return w + 1;
      });
    }, 700);
    return () => window.clearInterval(id);
  }, [playing]);

  function move(id: number, focus = true) {
    const next = weeks.find((w) => w.id === id);
    if (!next) return;
    setFocusWeek(id);
    if (!focus) return;
    requestAnimationFrame(() => {
      stripRef.current?.querySelector<HTMLButtonElement>(`[data-week="${id}"]`)?.focus();
    });
  }

  function onWeekKey(e: KeyboardEvent<HTMLButtonElement>, id: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(Math.min(id + 1, weeks[weeks.length - 1].id));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(Math.max(id - 1, weeks[0].id));
    } else if (e.key === "Home") {
      e.preventDefault();
      move(weeks[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      move(weeks[weeks.length - 1].id);
    }
  }

  const eyebrow = constructLive
    ? `05 Construct · Live · week ${weekN} of 14`
    : constructPassed
      ? "05 Construct · Closed · PC certified"
      : "05 Construct · Proposed · not yet on site";

  return (
    <div>
      <FilmStill src={stills.cdn.meet} alt="" className="min-h-[44vh]">
        <div className="flex min-h-[44vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <p className="label-track text-ice">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
            Fourteen weeks.
            <br />
            After the RFP.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-paper/75">
            On site {project.onSite}. Practical completion {project.handover}.{" "}
            {constructLive
              ? "This stage is live. Time is not drag-resized."
              : constructPassed
                ? "Practical completion is certified. Time is not drag-resized."
                : `This stage is ahead — live stage is ${live.n} ${live.label}. Time is not drag-resized.`}
          </p>
          <div className="mt-8 flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={() => {
                setFocusWeek(1);
                setPlaying(true);
              }}
              className="inline-flex min-h-11 items-center label-track text-ice hover:text-paper"
            >
              {playing ? "Playing the fourteen weeks" : "Play the fourteen weeks"}
            </button>
            {constructLive && mayCompleteWeek(focusWeek) && (
              <button
                type="button"
                onClick={() => completeWeek(focusWeek)}
                className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Mark week {String(focusWeek).padStart(2, "0")} complete →
              </button>
            )}
            {constructLive && mayIssue("construct") && (
              <button
                type="button"
                onClick={() => setIssuing(true)}
                className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Certify practical completion — open 06 →
              </button>
            )}
            {constructPassed ? (
              <Link
                to="/stage/$stageId"
                params={{ stageId: "handover" }}
                className="inline-flex min-h-11 items-center text-ice hover:text-paper"
              >
                Onward to 06 Handover →
              </Link>
            ) : !constructLive ? (
              <Link
                to="/stage/$stageId"
                params={{ stageId: currentStage }}
                className="inline-flex min-h-11 items-center text-ice hover:text-paper"
              >
                ← Return to {live.n} {live.label}
              </Link>
            ) : null}
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink px-5 py-5 sm:px-10 lg:px-14">
        <StageRail pathname="/programme" invert viewing="construct" />
        <div className="mt-3">
          <StageNextCue pathname="/programme" invert />
        </div>
      </div>

      <div
        ref={stripRef}
        role="listbox"
        aria-label="Programme weeks"
        aria-activedescendant={`week-${focusWeek}`}
        className="flex gap-5 overflow-x-auto bg-ink px-5 py-8 sm:px-10 lg:px-14"
      >
        {groups.map((group) => (
          <section key={group.phase} className="min-w-0 shrink-0">
            <p className="label-track mb-3 text-ice">{group.phase}</p>
            <div className="flex items-stretch gap-px border-l border-ice/40 pl-px">
              {group.weeks.map((week) => {
                const selected = week.id === focusWeek;
                const status = weekStatus(week.id, currentStage, constructWeek, Boolean(issued.construct));
                return (
                  <button
                    key={week.id}
                    id={`week-${week.id}`}
                    data-week={week.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => move(week.id, false)}
                    onFocus={() => setFocusWeek(week.id)}
                    onKeyDown={(e) => onWeekKey(e, week.id)}
                    className={cn(
                      "min-h-[220px] shrink-0 overflow-hidden border text-left text-paper transition-[width,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-ice",
                      selected
                        ? "w-[min(72vw,240px)] border-ice bg-ink-soft/80 p-4"
                        : "flex w-14 flex-col border-white/15 bg-ink-soft/40 px-2 py-3 hover:border-ice/50 hover:bg-ink-soft/60",
                    )}
                  >
                    <p className="font-mono text-[11px] tracking-wide text-ice">{week.label}</p>
                    {selected ? (
                      <>
                        <p className="mt-2 label-track text-paper/50">{week.phase}</p>
                        <h2 className="mt-3 font-serif text-[22px] leading-snug">{week.note}</h2>
                        <p className="mt-8 text-[11px] text-paper/40">{statusCopy(status, instrumentLive)}</p>
                      </>
                    ) : (
                      <span className="mt-auto block h-8 w-px bg-white/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="border-t border-white/10 bg-warm px-5 py-10 sm:px-10 lg:px-14">
        <p className="label-track text-petrol">Time on the plan</p>
        <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">Where the week sits</h2>
        <p className="standfirst mt-3 text-muted">Rooms light as their weeks arrive. Time is not drag-resized.</p>
        <FloorPlate initialLayer="time" />
      </section>

      {issuing && (
        <CertifyRitual
          title="Certify practical completion"
          holder={holder}
          verb="Certify"
          onCancel={() => setIssuing(false)}
          onConfirm={() => {
            issueStage("construct");
            setIssuing(false);
          }}
        />
      )}
    </div>
  );
}
