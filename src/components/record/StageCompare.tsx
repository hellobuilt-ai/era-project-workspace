import { Link } from "@tanstack/react-router";
import { useEra } from "@/lib/era/store";
import { stageBook, stageFromPath } from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";
import { useRouterState } from "@tanstack/react-router";

export function StageCompare() {
  const compareWith = useEra((s) => s.compareWith);
  const setCompareWith = useEra((s) => s.setCompareWith);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { currentStage, tone } = useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);

  if (!compareWith || compareWith === viewing) return null;

  const a = stageBook[compareWith];
  const b = stageBook[viewing];
  const ta = tone(a.id);
  const tb = tone(b.id);

  return (
    <div className="compare-plate" role="region" aria-label="Compare stages">
      <div className="grid gap-px bg-white/10 sm:grid-cols-2">
        <ComparePane stage={a} tone={ta} label="Held" />
        <ComparePane stage={b} tone={tb} label="Viewing" />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <p className="text-body-sm text-paper/55">Shift-click a frame to hold another stage.</p>
        <button
          type="button"
          onClick={() => setCompareWith(null)}
          className="hit-44 px-2 font-mono text-micro text-ice hover:text-paper"
        >
          Release
        </button>
      </div>
    </div>
  );
}

function ComparePane({
  stage,
  tone,
  label,
}: {
  stage: (typeof stageBook)[keyof typeof stageBook];
  tone: string;
  label: string;
}) {
  return (
    <Link
      to="/stage/$stageId"
      params={{ stageId: stage.id }}
      className="relative min-h-36 overflow-hidden bg-ink text-paper"
    >
      <img src={stage.still} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="film-scrim absolute inset-0" />
      <div className="relative px-4 py-4">
        <p className="label-track text-ice">
          {label} · {tone}
        </p>
        <p className="mt-2 font-serif text-xl leading-tight">
          {stage.n} {stage.label}
        </p>
        <p className="mt-1 max-w-sm text-body-sm text-paper/70">{stage.title}</p>
      </div>
    </Link>
  );
}
