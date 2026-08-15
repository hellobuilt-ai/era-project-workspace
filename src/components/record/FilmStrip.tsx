import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { stageFromPath, stageList, toneLabel } from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";
import { useEra } from "@/lib/era/store";

export function FilmStrip({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { currentStage, tone } = useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);
  const compareWith = useEra((s) => s.compareWith);
  const setCompareWith = useEra((s) => s.setCompareWith);

  function onFrame(e: MouseEvent, id: typeof stageList[number]["id"]) {
    if (e.shiftKey) {
      e.preventDefault();
      setCompareWith(compareWith === id ? null : id);
      return;
    }
    onNavigate?.();
  }

  return (
    <ol className="film-strip" aria-label="Sequence filmstrip">
      {stageList.map((s) => {
        const t = tone(s.id);
        const isView = s.id === viewing;
        const isLive = t === "live";
        const held = s.id === compareWith;
        return (
          <li key={s.id}>
            <Link
              to="/stage/$stageId"
              params={{ stageId: s.id }}
              onClick={(e) => onFrame(e, s.id)}
              aria-current={isView ? "step" : undefined}
              aria-label={`${s.n} ${s.label}, ${toneLabel(t)}${held ? ", held for compare" : ""}`}
              title={`${s.n} ${s.label} · ${toneLabel(t)} · Shift to hold`}
              className={cn(
                "film-frame",
                isLive && "is-live",
                t === "passed" && "is-passed",
                t === "next" && "is-next",
                isView && "is-viewing",
                held && "is-held",
              )}
            >
              <img src={s.still} alt="" />
              <span className="film-frame-n">{s.n}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
