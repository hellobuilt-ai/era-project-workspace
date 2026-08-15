import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { StageId } from "@/lib/era/types";
import {
  adjacentStages,
  liveSubtitle,
  stageBook,
  stageFromPath,
  stageIndex,
  stageList,
  toneLabel,
  type StageTone,
} from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";

export function StageRail({
  pathname,
  invert,
  viewing,
}: {
  pathname: string;
  invert?: boolean;
  viewing?: StageId;
}) {
  const { currentStage, tone } = useStageProgress();
  const active = viewing ?? stageFromPath(pathname, currentStage);
  const fill = stageList.length > 1 ? (stageIndex(currentStage) / (stageList.length - 1)) * 100 : 0;

  return (
    <div className={cn("stage-rail", invert ? "text-paper" : "text-ink")}>
      <div className="stage-rail-track" aria-hidden>
        <div className="stage-rail-fill" style={{ width: `${fill}%` }} />
      </div>
      <ol className="relative flex items-end">
        {stageList.map((s) => {
          const t = tone(s.id);
          const isView = s.id === active;
          return (
            <li key={s.id} className="min-w-0 flex-1">
              <Link
                to="/stage/$stageId"
                params={{ stageId: s.id }}
                aria-current={isView ? "step" : undefined}
                aria-label={`${s.n} ${s.label}, ${toneLabel(t)}`}
                title={`${s.n} ${s.label} · ${toneLabel(t)}`}
                className={cn(
                  "stage-tick flex min-h-11 w-full flex-col items-center justify-end gap-1 lg:min-h-8",
                  t === "live" && "is-current",
                  t === "passed" && "is-passed",
                  t === "next" && "is-next",
                  isView && "is-viewing",
                )}
              >
                <span className="stage-tick-mark" aria-hidden />
                <span
                  className={cn(
                    "font-mono text-micro tracking-wide",
                    isView || t === "live"
                      ? invert
                        ? "text-ice"
                        : "text-petrol"
                      : invert
                        ? "text-paper/40"
                        : "text-muted",
                  )}
                >
                  {s.n}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function StageNextCue({
  pathname,
  invert,
  viewing,
}: {
  pathname: string;
  invert?: boolean;
  viewing?: StageId;
}) {
  const { currentStage, live, next, qualityCertified, setFocusDecision, tone, constructWeek, issued } =
    useStageProgress();
  const here = viewing ?? stageFromPath(pathname, currentStage);
  const viewed = stageBook[here];
  const t = tone(here);
  const nextOfView = adjacentStages(here).next;

  let sub = viewed.period;
  if (here === currentStage) {
    sub = liveSubtitle(here, {
      qualityCertified,
      constructWeek,
      issuedHandover: Boolean(issued.handover),
    });
  } else if (t === "next") {
    sub = qualityCertified
      ? "Next · enter the work"
      : "Already being drawn — it becomes live when 01 closes.";
  } else if (t === "passed") {
    sub = "Closed on the record";
  } else if (t === "ahead") {
    sub = `Ahead · return to ${live.n} ${live.label}`;
  }

  const action = cueAction({
    here,
    t,
    currentStage,
    qualityCertified,
    next,
    nextOfView,
    liveN: live.n,
    liveLabel: live.label,
  });

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className={cn("label-track", invert ? "text-ice" : "text-petrol")}>
          {viewed.n} {viewed.label} · {toneLabel(t)}
        </p>
        <p className={cn("mt-1 max-w-sm text-body-sm", invert ? "text-paper/70" : "text-muted")}>{sub}</p>
      </div>
      {action &&
        (action.hash ? (
          <Link
            to={action.to}
            hash={action.hash}
            onClick={() => {
              if (action.hash === "decision-d3") setFocusDecision("d3");
            }}
            className={cn(
              "label-track min-h-11 px-0 py-2",
              invert ? "text-ice hover:text-paper" : "text-petrol hover:text-ink",
            )}
          >
            {action.label}
          </Link>
        ) : action.params ? (
          <Link
            to="/stage/$stageId"
            params={action.params}
            className={cn(
              "label-track min-h-11 px-0 py-2",
              invert ? "text-ice hover:text-paper" : "text-petrol hover:text-ink",
            )}
          >
            {action.label}
          </Link>
        ) : (
          <Link
            to={action.to}
            className={cn(
              "label-track min-h-11 px-0 py-2",
              invert ? "text-ice hover:text-paper" : "text-petrol hover:text-ink",
            )}
          >
            {action.label}
          </Link>
        ))}
    </div>
  );
}

type CueAction = {
  to: string;
  params?: { stageId: StageId };
  hash?: string;
  label: string;
};

function cueAction({
  here,
  t,
  currentStage,
  qualityCertified,
  next,
  nextOfView,
  liveN,
  liveLabel,
}: {
  here: StageId;
  t: StageTone;
  currentStage: StageId;
  qualityCertified: boolean;
  next: ReturnType<typeof adjacentStages>["next"];
  nextOfView: ReturnType<typeof adjacentStages>["next"];
  liveN: string;
  liveLabel: string;
}): CueAction | null {
  if (here === currentStage) {
    if (here === "strategic" && !qualityCertified) {
      return { to: "/", hash: "decision-d3", label: "Close 01 to open 02 →" };
    }
    if (next) {
      return {
        to: "/stage/$stageId",
        params: { stageId: next.id },
        label: `Next ${next.n} ${next.label} →`,
      };
    }
    return null;
  }
  if (t === "next") {
    const dest = stageBook[here];
    return { to: dest.workPath, label: `Enter ${dest.n} ${dest.label} →` };
  }
  if (t === "passed" && nextOfView) {
    return {
      to: "/stage/$stageId",
      params: { stageId: nextOfView.id },
      label: `${nextOfView.n} ${nextOfView.label} →`,
    };
  }
  if (t === "ahead") {
    return {
      to: "/stage/$stageId",
      params: { stageId: currentStage },
      label: `Return to ${liveN} ${liveLabel} →`,
    };
  }
  return null;
}
