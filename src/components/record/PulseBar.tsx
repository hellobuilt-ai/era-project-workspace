import { Link } from "@tanstack/react-router";
import { project } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { useStageProgress } from "@/lib/era/progress";
import { adjacentStages, liveSubtitle, stageFromPath } from "@/lib/era/stages";
import { gbp } from "@/lib/utils";

export function PulseBar({ pathname }: { pathname: string }) {
  const setCommandOpen = useEra((s) => s.setCommandOpen);
  const decisions = useEra((s) => s.decisions);
  const { currentStage, live, qualityCertified, setFocusDecision, constructWeek, issued, lens } =
    useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);
  const waiting = decisions.filter((d) => d.status === "open" || d.status === "countered");
  const closeGate = currentStage === "strategic" && !qualityCertified;
  const nextLive = adjacentStages(currentStage).next;
  const guest = lens === "guest";

  const sentence = liveSubtitle(currentStage, {
    qualityCertified,
    constructWeek,
    issuedHandover: Boolean(issued.handover),
  });

  return (
    <div className="pulse-bar" role="region" aria-label="Project pulse">
      <Link
        to={closeGate ? "/" : "/stage/$stageId"}
        hash={closeGate ? "decision-d3" : undefined}
        params={closeGate ? undefined : { stageId: currentStage }}
        onClick={() => {
          if (closeGate) setFocusDecision("d3");
        }}
        className="pulse-live min-w-0"
      >
        <span className="label-track text-ice">
          {live.n} {live.label}
          {viewing !== currentStage ? " · live" : ""}
        </span>
        <span className="truncate text-body-sm text-paper/70">{sentence}</span>
      </Link>

      <p className="pulse-money hidden md:block">
        <span className="money text-paper">{gbp(project.certainty)}</span>
        <span className="ml-2 font-mono text-micro text-paper/45">±{Math.round(project.certaintyBand * 100)}%</span>
      </p>

      {!guest &&
        (closeGate ? (
          <Link to="/" hash="decision-d3" onClick={() => setFocusDecision("d3")} className="pulse-action">
            Close 01
          </Link>
        ) : nextLive && viewing === currentStage ? (
          <Link to="/stage/$stageId" params={{ stageId: nextLive.id }} className="pulse-action">
            Next {nextLive.n}
          </Link>
        ) : viewing !== currentStage ? (
          <Link to="/stage/$stageId" params={{ stageId: currentStage }} className="pulse-action">
            Enter {live.n}
          </Link>
        ) : (
          <span className="pulse-action is-quiet">Issued</span>
        ))}

      <button type="button" className="pulse-wait" onClick={() => setCommandOpen(true)}>
        {waiting.length > 0 ? `${waiting.length} waiting` : "Quiet"}
      </button>
    </div>
  );
}
