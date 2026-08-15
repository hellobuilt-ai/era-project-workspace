import { Link } from "@tanstack/react-router";
import { useEra } from "@/lib/era/store";
import { useStageProgress } from "@/lib/era/progress";
import { stageBook } from "@/lib/era/stages";

export function ReturnSlip({
  sinceLeft,
  onDismiss,
}: {
  sinceLeft: boolean;
  onDismiss: () => void;
}) {
  const { currentStage, qualityCertified, setFocusDecision, live } = useStageProgress();
  const decisions = useEra((s) => s.decisions);
  const waiting = decisions.filter((d) => d.status === "open" || d.status === "countered");
  const closeGate = currentStage === "strategic" && !qualityCertified;

  return (
    <aside className="return-slip" role="status">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-track text-petrol">{sinceLeft ? "Since you left" : "On the desk"}</p>
          <p className="mt-1 font-serif text-[length:var(--text-folio)] leading-snug">
            {sinceLeft
              ? `${live.n} ${live.label} is as you left it.`
              : `${waiting.length} ${waiting.length === 1 ? "sentence" : "sentences"} wait on a named person.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="hit-44 shrink-0 px-2 font-mono text-micro text-muted hover:text-ink"
        >
          Dismiss
        </button>
      </div>
      {waiting.length > 0 && (
        <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
          {waiting.map((d) => (
            <li key={d.id} className="flex items-baseline justify-between gap-3 py-2">
              <span className="min-w-0 truncate text-body">{d.title}</span>
              <span className="shrink-0 font-mono text-micro text-muted">
                {d.aiDraft ? "Draft" : d.namedBy}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {closeGate ? (
          <Link
            to="/"
            hash="decision-d3"
            onClick={() => {
              setFocusDecision("d3");
              onDismiss();
            }}
            className="inline-flex min-h-11 items-center bg-ink px-4 text-body font-medium text-paper hover:bg-petrol"
          >
            Close 01 →
          </Link>
        ) : (
          <Link
            to="/stage/$stageId"
            params={{ stageId: currentStage }}
            onClick={onDismiss}
            className="inline-flex min-h-11 items-center bg-ink px-4 text-body font-medium text-paper hover:bg-petrol"
          >
            Enter {stageBook[currentStage].n} {stageBook[currentStage].label} →
          </Link>
        )}
        <p className="text-body-sm text-muted">A key never certifies.</p>
      </div>
    </aside>
  );
}
