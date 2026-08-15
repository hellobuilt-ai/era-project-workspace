import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEra } from "@/lib/era/store";
import { stageList } from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";
import { FilmStill } from "./FilmStill";

const DWELL = 2800;

export function SequenceFilm() {
  const open = useEra((s) => s.filmOpen);
  const setFilmOpen = useEra((s) => s.setFilmOpen);
  const { currentStage } = useStageProgress();
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!open) return;
    setI(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setFilmOpen(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setI((n) => Math.min(n + 1, stageList.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setI((n) => Math.max(n - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setFilmOpen]);

  useEffect(() => {
    if (!open || reduced) return;
    if (i >= stageList.length - 1) return;
    const t = window.setTimeout(() => setI((n) => n + 1), DWELL);
    return () => window.clearTimeout(t);
  }, [open, i, reduced]);

  if (!open) return null;

  const stage = stageList[i];
  const last = i === stageList.length - 1;

  function enterLive() {
    setFilmOpen(false);
    void navigate({ to: "/stage/$stageId", params: { stageId: currentStage } });
  }

  return (
    <div className="fixed inset-0 z-[95] bg-ink" role="dialog" aria-modal="true" aria-label="Sequence film">
      <FilmStill src={stage.still} alt="" className="absolute inset-0 min-h-full">
        <div className="flex min-h-dvh flex-col justify-end px-6 py-12 sm:px-12 lg:px-16">
          <p className="label-track text-ice">
            {stage.n} {stage.label}
          </p>
          <h2 className="mt-3 max-w-4xl font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
            {stage.title}
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-paper/75">{stage.dek}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {last || reduced ? (
              <button
                type="button"
                onClick={enterLive}
                className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink hover:bg-ice"
              >
                Enter the live stage →
              </button>
            ) : (
              <p className="font-mono text-micro text-paper/50">
                {String(i + 1).padStart(2, "0")} / {String(stageList.length).padStart(2, "0")}
              </p>
            )}
            <button
              type="button"
              onClick={() => setFilmOpen(false)}
              className="inline-flex min-h-11 items-center px-3 text-body text-paper/70 hover:text-paper"
            >
              Close
            </button>
          </div>
          <ol className="mt-8 flex gap-1" aria-hidden>
            {stageList.map((s, idx) => (
              <li
                key={s.id}
                className={idx === i ? "h-px flex-1 bg-ice" : idx < i ? "h-px flex-1 bg-paper/50" : "h-px flex-1 bg-paper/15"}
              />
            ))}
          </ol>
        </div>
      </FilmStill>
    </div>
  );
}
