import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { stageFromPath, stageList, toneLabel } from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";

export function FilmStrip({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { currentStage, tone } = useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);

  return (
    <ol className="film-strip" aria-label="Sequence filmstrip">
      {stageList.map((s) => {
        const t = tone(s.id);
        const isView = s.id === viewing;
        const isLive = t === "live";
        return (
          <li key={s.id}>
            <Link
              to="/stage/$stageId"
              params={{ stageId: s.id }}
              onClick={onNavigate}
              aria-current={isView ? "step" : undefined}
              aria-label={`${s.n} ${s.label}, ${toneLabel(t)}`}
              title={`${s.n} ${s.label} · ${toneLabel(t)}`}
              className={cn(
                "film-frame",
                isLive && "is-live",
                t === "passed" && "is-passed",
                t === "next" && "is-next",
                isView && "is-viewing",
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
