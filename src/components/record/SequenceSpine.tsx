import { Link } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { stageFromPath, stageList, toneLabel } from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";
import { useEra } from "@/lib/era/store";

export function SequenceSpine({
  pathname,
  onNavigate,
  compact,
}: {
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const { currentStage, tone } = useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);
  const compareWith = useEra((s) => s.compareWith);
  const setCompareWith = useEra((s) => s.setCompareWith);
  const setFilmOpen = useEra((s) => s.setFilmOpen);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("era-spine-hint") !== "1") setHint(true);
    } catch {
      setHint(true);
    }
  }, []);

  function dismissHint() {
    setHint(false);
    try {
      sessionStorage.setItem("era-spine-hint", "1");
    } catch {
      /* ignore */
    }
  }

  function onFrame(e: MouseEvent, id: (typeof stageList)[number]["id"]) {
    dismissHint();
    if (e.shiftKey) {
      e.preventDefault();
      setCompareWith(compareWith === id ? null : id);
      return;
    }
    onNavigate?.();
  }

  return (
    <div className={cn("sequence-spine", compact && "is-compact")}>
      <ol className="spine-strip" aria-label="Sequence">
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
                className={cn(
                  "spine-frame",
                  isLive && "is-live",
                  t === "passed" && "is-passed",
                  t === "next" && "is-next",
                  isView && "is-viewing",
                  held && "is-held",
                )}
              >
                <img src={s.still} alt="" />
                <span className="spine-frame-n">{s.n}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className="spine-play"
            onClick={() => {
              dismissHint();
              setFilmOpen(true);
              onNavigate?.();
            }}
          >
            Play
          </button>
        </li>
      </ol>
      {hint && !compact && (
        <p className="spine-hint">
          Click to enter · Shift to hold · Play to watch
          <button type="button" className="ml-3 font-mono text-micro text-paper/45 hover:text-paper" onClick={dismissHint}>
            Got it
          </button>
        </p>
      )}
    </div>
  );
}
