import { createFileRoute } from "@tanstack/react-router";
import { project, weeks } from "@/lib/era/project";
import { FilmStill } from "@/components/record/FilmStill";

export const Route = createFileRoute("/_app/programme")({ component: ProgrammePage });

function ProgrammePage() {
  return (
    <div>
      <FilmStill src="/era/space-meet.jpg" alt="" className="min-h-[44vh]">
        <div className="flex min-h-[44vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <p className="label-track text-ice">Proposed · not yet on site</p>
          <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
            Fourteen weeks.
            <br />
            After the RFP.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-paper/75">
            On site {project.onSite}. Practical completion {project.handover}. Time is not drag-resized.
          </p>
        </div>
      </FilmStill>

      <div className="flex gap-3 overflow-x-auto bg-ink px-5 py-8 sm:px-10 lg:px-14">
        {weeks.map((w) => (
          <article
            key={w.id}
            className="w-[156px] shrink-0 border border-white/15 bg-ink-soft/60 p-3 text-paper"
          >
            <p className="font-mono text-[11px] tracking-wide text-ice">{w.label}</p>
            <p className="mt-2 label-track text-paper/50">{w.phase}</p>
            <h2 className="mt-2 font-serif text-[18px] leading-snug">{w.note}</h2>
            <p className="mt-6 text-[11px] text-paper/40">Proposed</p>
          </article>
        ))}
      </div>
    </div>
  );
}
