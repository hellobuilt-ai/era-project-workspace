import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FilmStill, PunchStats } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { Stamp } from "@/components/record/Stamp";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import {
  adjacentStages,
  isStageId,
  stageBook,
  stageList,
  toneLabel,
  type StageTone,
} from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";
import type { StageId } from "@/lib/era/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/stage/$stageId")({
  component: StagePage,
});

function StagePage() {
  const { stageId } = Route.useParams();
  const navigate = useNavigate();
  const {
    currentStage,
    live,
    qualityCertified,
    mayCertify,
    mayIssue,
    issueStage,
    setFocusDecision,
    holder,
    tone,
    constructWeek,
    issued,
    thriveIssued,
  } = useStageProgress();
  const [issuing, setIssuing] = useState(false);
  const valid = isStageId(stageId);
  const viewedId = valid ? stageId : currentStage;
  const stage = stageBook[viewedId];
  const t = tone(viewedId);
  const { prev, next } = adjacentStages(viewedId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: next.id } });
      } else if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: prev.id } });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, next, prev]);

  if (!valid) {
    return <Navigate to="/stage/$stageId" params={{ stageId: currentStage }} />;
  }

  const beats =
    stageId === "brief"
      ? stage.beats.map((b) => (b.k === "Quality" ? { ...b, v: qualityCertified ? "Certified" : "Open" } : b))
      : stageId === "strategic"
        ? stage.beats.map((b) =>
            b.k === "Holding the gate" ? { ...b, v: qualityCertified ? "Closed" : "Quality band" } : b,
          )
        : stage.beats;

  const cta = stageCta({
    stageId,
    t,
    next,
    qualityCertified,
    currentStage,
    liveN: live.n,
    liveLabel: live.label,
    mayIssue: mayIssue(stageId),
    constructWeek,
    issuedHandover: Boolean(issued.handover),
  });

  return (
    <div>
      <FilmStill src={stage.still} alt="" className="min-h-[58vh] lg:min-h-[64vh]">
        <div className="flex min-h-[58vh] flex-col justify-end px-5 py-10 sm:px-10 lg:min-h-[64vh] lg:px-14 lg:py-14">
          <div className="stagger-in max-w-4xl">
            <p className="label-track text-ice">
              {stage.n} {stage.label} · {toneLabel(t)}
            </p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              {stage.title}
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-paper/75">{stage.dek}</p>
            {cta && (
              <div className="mt-8 flex flex-col items-start gap-3">
                {cta.kind === "issue" ? (
                  <button
                    type="button"
                    onClick={() => setIssuing(true)}
                    className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
                  >
                    {cta.label} →
                  </button>
                ) : cta.hash ? (
                  <Link
                    to={cta.to}
                    hash={cta.hash}
                    onClick={() => {
                      if (cta.hash === "decision-d3") setFocusDecision("d3");
                    }}
                    className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
                  >
                    {cta.label} →
                  </Link>
                ) : cta.params ? (
                  <Link
                    to="/stage/$stageId"
                    params={cta.params}
                    className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
                  >
                    {cta.label} →
                  </Link>
                ) : (
                  <Link
                    to={cta.to}
                    className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
                  >
                    {cta.label} →
                  </Link>
                )}
                {cta.note && <p className="max-w-md text-body-sm text-paper/55">{cta.note}</p>}
                {cta.alt &&
                  (cta.alt.params ? (
                    <Link
                      to="/stage/$stageId"
                      params={cta.alt.params}
                      className="label-track text-ice hover:text-paper"
                    >
                      {cta.alt.label}
                    </Link>
                  ) : (
                    <Link to={cta.alt.to} className="label-track text-ice hover:text-paper">
                      {cta.alt.label}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink px-5 py-5 sm:px-10 lg:px-14">
        <StageRail pathname={`/stage/${stageId}`} invert viewing={stageId} />
        <div className="mt-3">
          <StageNextCue pathname={`/stage/${stageId}`} invert viewing={stageId} />
        </div>
      </div>

      <PunchStats invert items={beats.slice(0, 4).map((b) => ({ k: b.k, v: b.v }))} />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-12 lg:py-14">
        <div>
          <p className="label-track text-petrol">The door</p>
          <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">
            {doorHeading(t, stageId, qualityCertified)}
          </h2>
          <p className="standfirst mt-4 text-ink/80">{doorCopy(stage, t, qualityCertified)}</p>
          <p className="mt-4 max-w-prose text-body text-muted">{stage.outcome}</p>

          <ol className="mt-8 -space-y-px">
            {doorSteps(stageId, t, qualityCertified, currentStage, {
              constructWeek,
              issuedHandover: Boolean(issued.handover),
              thriveIssued,
            }).map((step) => (
              <li key={step.label} className="sheet">
                {step.to ? (
                  <Link
                    to={step.to}
                    hash={step.hash}
                    params={step.params}
                    onClick={() => {
                      if (step.hash === "decision-d3") setFocusDecision("d3");
                    }}
                    className="flex items-baseline justify-between gap-4 px-4 py-5 sm:px-5"
                  >
                    <span>
                      <span className="block font-mono text-micro text-muted">{step.n}</span>
                      <span className="mt-1 block font-serif text-[22px] leading-snug">{step.label}</span>
                      <span className="mt-1 block text-body-sm text-muted">{step.hint}</span>
                    </span>
                    <span className="label-track shrink-0 text-petrol">{step.state}</span>
                  </Link>
                ) : step.issue && mayIssue(stageId) ? (
                  <button
                    type="button"
                    onClick={() => setIssuing(true)}
                    className="flex w-full items-baseline justify-between gap-4 px-4 py-5 text-left sm:px-5"
                  >
                    <span>
                      <span className="block font-mono text-micro text-muted">{step.n}</span>
                      <span className="mt-1 block font-serif text-[22px] leading-snug">{step.label}</span>
                      <span className="mt-1 block text-body-sm text-muted">{step.hint}</span>
                    </span>
                    <span className="label-track shrink-0 text-petrol">{step.state}</span>
                  </button>
                ) : (
                  <div className="flex items-baseline justify-between gap-4 px-4 py-5 sm:px-5">
                    <span>
                      <span className="block font-mono text-micro text-muted">{step.n}</span>
                      <span className="mt-1 block font-serif text-[22px] leading-snug">{step.label}</span>
                      <span className="mt-1 block text-body-sm text-muted">{step.hint}</span>
                    </span>
                    <span className="label-track shrink-0 text-muted">{step.state}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>

          <ul className="mt-8 -space-y-px">
            {stage.work.map((item) => (
              <li key={item.to + item.label} className="sheet">
                <Link to={item.to} className="flex items-baseline justify-between gap-4 px-4 py-5 sm:px-5">
                  <span>
                    <span className="block font-serif text-[22px] leading-snug">{item.label}</span>
                    <span className="mt-1 block text-body-sm text-muted">{item.hint}</span>
                  </span>
                  <span className="label-track shrink-0 text-petrol">Open</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-8">
          <section>
            <p className="label-track text-petrol">Sequence</p>
            <ol className="mt-3 divide-y divide-rule border-y border-rule">
              {stageList.map((s) => {
                const st = tone(s.id);
                const here = s.id === stageId;
                return (
                  <li key={s.id}>
                    <Link
                      to="/stage/$stageId"
                      params={{ stageId: s.id }}
                      className={cn(
                        "flex min-h-11 items-baseline justify-between gap-3 py-3",
                        here ? "text-ink" : "text-ink/70 hover:text-ink",
                      )}
                    >
                      <span>
                        <span className="font-mono text-micro text-muted">{s.n}</span>
                        <span className="ml-2">{s.label}</span>
                      </span>
                      <Stamp
                        kind={
                          st === "passed"
                            ? "certified"
                            : st === "live"
                              ? "issued"
                              : st === "next"
                                ? "draft"
                                : "superseded"
                        }
                      />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <p className="label-track text-petrol">You are on the record</p>
            <p className="mt-2 text-body text-muted">
              Live stage is {live.n} {live.label}. Arrow keys walk the sequence. Ahead stages may be
              read, not issued.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {prev && (
                <Link
                  to="/stage/$stageId"
                  params={{ stageId: prev.id }}
                  className="label-track text-petrol hover:text-ink"
                >
                  ← {prev.n} {prev.label}
                </Link>
              )}
              {next && (
                <Link
                  to="/stage/$stageId"
                  params={{ stageId: next.id }}
                  className="label-track text-petrol hover:text-ink"
                >
                  {next.n} {next.label} →
                </Link>
              )}
            </div>
          </section>
        </aside>
      </div>

      {issuing && (
        <CertifyRitual
          title={stage.issueLabel}
          holder={holder}
          blocked={!mayIssue(stageId) && !mayCertify("d3")}
          onCancel={() => setIssuing(false)}
          onConfirm={() => {
            issueStage(stageId);
            setIssuing(false);
          }}
        />
      )}
    </div>
  );
}

type Cta = {
  kind: "link" | "issue";
  to: string;
  params?: { stageId: StageId };
  hash?: string;
  label: string;
  note?: string;
  alt?: { to: string; params?: { stageId: StageId }; label: string };
};

function stageCta({
  stageId,
  t,
  next,
  qualityCertified,
  currentStage,
  liveN,
  liveLabel,
  mayIssue,
  constructWeek,
}: {
  stageId: StageId;
  t: StageTone;
  next: ReturnType<typeof adjacentStages>["next"];
  qualityCertified: boolean;
  currentStage: StageId;
  liveN: string;
  liveLabel: string;
  mayIssue: boolean;
  constructWeek: number | null;
  issuedHandover: boolean;
}): Cta | null {
  if (t === "live") {
    if (stageId === "strategic" && !qualityCertified) {
      return {
        kind: "link",
        to: "/",
        hash: "decision-d3",
        label: "Close 01 — certify the quality band",
        note: "That sentence is the door. 02 is already being drawn; it becomes live when 01 closes.",
        alt: { to: "/brief", label: "Read 02 while it is being drawn →" },
      };
    }
    if (stageId === "brief") {
      if (!qualityCertified) {
        return {
          kind: "link",
          to: "/",
          hash: "decision-d3",
          label: "Quality still holds this brief",
          note: "02 is live. It cannot be issued until the band is signed.",
        };
      }
      return {
        kind: mayIssue ? "issue" : "link",
        to: "/brief",
        label: stageBook.brief.issueLabel,
        note: "Issuing the brief is what opens 03 Design.",
        alt: { to: "/brief", label: "Read the four tensions →" },
      };
    }
    if (stageId === "construct") {
      if (constructWeek !== 14) {
        return {
          kind: "link",
          to: "/programme",
          label: "Walk the weeks — week 14 is PC",
          note: "Practical completion waits on week 14.",
        };
      }
      return {
        kind: mayIssue ? "issue" : "link",
        to: "/programme",
        label: stageBook.construct.issueLabel,
        note: "This closes 05 and makes 06 Handover live.",
        alt: { to: "/programme", label: "Walk the fourteen weeks →" },
      };
    }
    if (stageId === "handover") {
      return {
        kind: mayIssue ? "issue" : "link",
        to: "/handover",
        label: "The record stays issued",
        alt: { to: "/handover", label: "Enter the soft landing →" },
      };
    }
    if (next && mayIssue) {
      return {
        kind: "issue",
        to: stageBook[stageId].workPath,
        label: stageBook[stageId].issueLabel,
        note: `This closes ${stageBook[stageId].n} and makes ${next.n} ${next.label} live.`,
        alt: { to: stageBook[stageId].workPath, label: `Work ${stageBook[stageId].n} first →` },
      };
    }
    if (next) {
      return {
        kind: "link",
        to: "/stage/$stageId",
        params: { stageId: next.id },
        label: `Continue to ${next.n} ${next.label}`,
      };
    }
    return {
      kind: "link",
      to: stageBook[stageId].workPath,
      label: "The record stays issued",
    };
  }

  if (t === "next") {
    return {
      kind: "link",
      to: stageBook[stageId].workPath,
      label: `Enter ${stageBook[stageId].n} ${stageBook[stageId].label}`,
      note:
        stageId === "brief"
          ? "Already in play. You may read it now. It becomes live when 01 closes."
          : "The next instrument. Enter the work.",
    };
  }

  if (t === "passed" && next) {
    return {
      kind: "link",
      to: "/stage/$stageId",
      params: { stageId: next.id },
      label: `Onward to ${next.n} ${next.label}`,
      note: "This gate has closed.",
    };
  }

  return {
    kind: "link",
    to: "/stage/$stageId",
    params: { stageId: currentStage },
    label: `Return to ${liveN} ${liveLabel}`,
    note: "Not opened yet. You may read ahead. You cannot issue it.",
  };
}

function doorHeading(t: StageTone, id: StageId, qualityCertified: boolean) {
  if (t === "ahead") return "Not opened yet.";
  if (t === "next") return "Already in play.";
  if (t === "passed") return "This gate closed.";
  if (id === "strategic" && !qualityCertified) return "What holds 01.";
  if (id === "brief" && qualityCertified) return "Ready to issue.";
  return "What holds this stage.";
}

function doorCopy(stage: (typeof stageBook)[StageId], t: StageTone, qualityCertified: boolean) {
  if (stage.id === "strategic" && qualityCertified) {
    return "Quality is certified. 01 is closed. 02 Brief is the live stage.";
  }
  if (stage.id === "brief" && t === "next") {
    return "You do not wait for 01 to read the four tensions. You do wait to issue them.";
  }
  return stage.gate;
}

type DoorStep = {
  n: string;
  label: string;
  hint: string;
  state: string;
  to?: string;
  params?: { stageId: StageId };
  hash?: string;
  issue?: boolean;
};

function doorSteps(
  stageId: StageId,
  t: StageTone,
  qualityCertified: boolean,
  currentStage: StageId,
  extra: {
    constructWeek: number | null;
    issuedHandover: boolean;
    thriveIssued: boolean;
  },
): DoorStep[] {
  if (stageId === "strategic" || (stageId === "brief" && (t === "next" || t === "live"))) {
    return [
      {
        n: "01",
        label: "Cat B quality band",
        hint: qualityCertified
          ? "Certified. 01 is closed."
          : "Amelia Croft’s sentence. This is the only door from 01 to 02.",
        state: qualityCertified ? "Closed" : "Open",
        to: qualityCertified ? undefined : "/",
        hash: qualityCertified ? undefined : "decision-d3",
      },
      {
        n: "02",
        label: "Brief becomes live",
        hint: qualityCertified
          ? "Live. Enter the four tensions, then issue."
          : "Already being drawn. Becomes live when the band is signed.",
        state: currentStage === "brief" || t === "passed" ? "Live" : "Waiting",
        to: "/brief",
      },
      {
        n: "03",
        label: "Issue the brief",
        hint: "Opens Design. Locked until quality is certified and 02 is live.",
        state: qualityCertified && currentStage === "brief" ? "Ready" : "Locked",
        issue: qualityCertified && currentStage === "brief",
        to: qualityCertified && currentStage === "brief" ? undefined : "/brief",
      },
    ];
  }

  if (stageId === "lease") {
    return [
      {
        n: "00",
        label: "Confirm execution",
        hint: "The instrument is executed. Occupation from 1 October.",
        state: t === "passed" ? "Closed" : t === "live" ? "Ready" : "Locked",
        issue: t === "live",
        to: t === "live" ? undefined : "/lease",
      },
      {
        n: "00",
        label: "Named occupiers",
        hint: "Amelia Croft and James Lang hold the floor.",
        state: "Named",
        to: "/people",
      },
      {
        n: "01",
        label: "Strategic opens",
        hint: "After the lease is confirmed.",
        state: t === "passed" ? "Open" : "Waiting",
        to: "/stage/$stageId",
        params: { stageId: "strategic" },
      },
    ];
  }

  if (stageId === "design") {
    return [
      {
        n: "03",
        label: "Drawings register",
        hint: "Five sheets. Authorship, not a package.",
        state: t === "live" ? "Open" : t === "passed" ? "Issued" : "Locked",
        to: "/design",
      },
      {
        n: "03",
        label: "Issue first drawings",
        hint: "Opens Procure. Locked until Design is live.",
        state: t === "live" ? "Ready" : t === "passed" ? "Closed" : "Locked",
        issue: t === "live",
      },
      {
        n: "04",
        label: "Procure opens",
        hint: "After first drawings are issued.",
        state: t === "passed" ? "Open" : "Waiting",
        to: "/stage/$stageId",
        params: { stageId: "procure" },
      },
    ];
  }

  if (stageId === "procure") {
    return [
      {
        n: "04",
        label: "Named packages",
        hint: "Nine packages against the ceiling.",
        state: t === "live" ? "Open" : t === "passed" ? "Awarded" : "Locked",
        to: "/packages",
      },
      {
        n: "04",
        label: "Award the packages",
        hint: "Opens Construct. Week 1 becomes live.",
        state: t === "live" ? "Ready" : t === "passed" ? "Closed" : "Locked",
        issue: t === "live",
      },
      {
        n: "05",
        label: "Construct opens",
        hint: "After the packages are awarded.",
        state: t === "passed" ? "Open" : "Waiting",
        to: "/stage/$stageId",
        params: { stageId: "construct" },
      },
    ];
  }

  if (stageId === "construct") {
    const week14 = extra.constructWeek === 14;
    return [
      {
        n: "05",
        label: "Walk the fourteen weeks",
        hint: week14 ? "Week 14 is live. PC can be certified." : "Time is not drag-resized. Week 14 is PC.",
        state: t === "live" ? (week14 ? "Ready" : "Live") : t === "passed" ? "Closed" : "Locked",
        to: "/programme",
      },
      {
        n: "05",
        label: "Certify practical completion",
        hint: "Opens Handover. Locked until week 14.",
        state: t === "live" && week14 ? "Ready" : t === "passed" ? "Closed" : "Locked",
        issue: t === "live" && week14,
      },
      {
        n: "06",
        label: "Handover opens",
        hint: "After PC is certified.",
        state: t === "passed" ? "Open" : "Waiting",
        to: "/stage/$stageId",
        params: { stageId: "handover" },
      },
    ];
  }

  if (stageId === "handover") {
    return [
      {
        n: "06",
        label: "Soft landing",
        hint: "Staff return from week 13. The floor is occupied.",
        state: t === "live" ? "Open" : "Locked",
        to: "/handover",
      },
      {
        n: "06",
        label: "Thrive retainer",
        hint: "Optional. Named fee. Not a silent extension.",
        state: extra.thriveIssued ? "Issued" : "Draft",
        to: "/fees",
      },
      {
        n: "06",
        label: "The record stays issued",
        hint: "Handover has no next stage. The record does not close.",
        state: extra.issuedHandover ? "Issued" : t === "live" ? "Ready" : "Locked",
        issue: t === "live" && !extra.issuedHandover,
      },
    ];
  }

  const self = stageBook[stageId];
  const nxt = adjacentStages(stageId).next;
  return [
    {
      n: self.n,
      label: self.closeLabel,
      hint: self.gate,
      state: t === "live" ? "Ready" : t === "passed" ? "Closed" : "Locked",
      issue: t === "live",
    },
    ...(nxt
      ? [
          {
            n: nxt.n,
            label: `${nxt.label} opens`,
            hint: `After ${self.n} is issued.`,
            state: t === "passed" ? "Open" : "Waiting",
            to: "/stage/$stageId",
            params: { stageId: nxt.id },
          } satisfies DoorStep,
        ]
      : []),
  ];
}
