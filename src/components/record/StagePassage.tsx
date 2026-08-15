import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEra } from "@/lib/era/store";
import { stageBook } from "@/lib/era/stages";
import { FilmStill } from "./FilmStill";

export function StagePassage() {
  const passage = useEra((s) => s.passage);
  const clearPassage = useEra((s) => s.clearPassage);
  const navigate = useNavigate();

  useEffect(() => {
    if (!passage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearPassage();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // enter is stable enough for this overlay lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passage, clearPassage]);

  if (!passage) return null;

  const from = stageBook[passage.from];
  const to = stageBook[passage.to];

  function enter() {
    if (!passage) return;
    const dest = stageBook[passage.to];
    clearPassage();
    void navigate({ to: "/stage/$stageId", params: { stageId: dest.id } });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink">
      <FilmStill src={to.still} alt="" className="absolute inset-0 min-h-full">
        <div className="flex min-h-dvh flex-col justify-end px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="stagger-in max-w-3xl">
            <p className="label-track text-ice">
              {from.n} {from.label} · Closed
            </p>
            <h2 className="mt-4 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              {to.n} {to.label}
              <span className="block">is now live.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-paper/75">{to.dek}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={enter}
                className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Enter {to.n} {to.label} →
              </button>
              <button
                type="button"
                onClick={clearPassage}
                className="inline-flex min-h-11 items-center px-3 py-2.5 text-body text-paper/70 hover:text-paper"
              >
                Stay on this page
              </button>
            </div>
          </div>
        </div>
      </FilmStill>
    </div>
  );
}
