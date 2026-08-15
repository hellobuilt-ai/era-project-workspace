import { createFileRoute, Navigate } from "@tanstack/react-router";
import { briefClauses, project } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { FilmStill } from "@/components/record/FilmStill";

export const Route = createFileRoute("/_app/brief")({ component: BriefPage });

const stills = [
  "/era/hero-wide.jpg",
  "/era/space-floor.jpg",
  "/era/space-meet.jpg",
  "/era/hero-portrait.jpg",
];

function BriefPage() {
  const { lens } = useEra();
  if (lens === "guest") return <Navigate to="/" />;

  return (
    <div>
      <FilmStill src="/era/space-floor.jpg" alt="" className="min-h-[46vh]">
        <div className="flex min-h-[46vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <div className="stagger-in max-w-3xl">
            <p className="label-track text-ice">Space · Budget · Programme · Quality</p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              Four tensions.
              <br />
              One brief.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-paper/75">
              Not a PDF that outranks the record. RFP close cannot complete until all four are agreed.
            </p>
          </div>
        </div>
      </FilmStill>

      <div className="grid md:grid-cols-2">
        {briefClauses.map((c, i) => (
          <article key={c.id} className="relative min-h-[340px] overflow-hidden bg-ink">
            <img src={stills[i]} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_31_51_/_0.15),rgb(11_31_51_/_0.78))]" />
            <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-end p-6 sm:p-8">
              <p className="label-track text-ice">
                0{i + 1} · {c.pillar}
              </p>
              <h2 className="mt-2 font-serif text-[28px] leading-tight text-paper sm:text-[34px]">{c.title}</h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-paper/75">{c.copy}</p>
              <p className="mt-5 font-mono text-[11px] text-paper/45">
                HV-FAR-BRI-0{i + 1} · {i === 3 ? "Open — Amelia Croft" : "Agreed"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <aside className="border-t border-rule bg-paper px-5 py-8 sm:px-10 lg:px-14">
        <p className="label-track text-petrol">Stage gate</p>
        <p className="mt-2 max-w-2xl text-[17px] leading-relaxed">
          {project.stageLabel}. Quality remains open. The cost ceiling holds only if the partners’ floor stays
          inside the band Henry certified.
        </p>
      </aside>
    </div>
  );
}
