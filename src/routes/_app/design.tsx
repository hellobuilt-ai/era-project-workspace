import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { drawings, project } from "@/lib/era/project";
import { FilmStill, PunchStats } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { Stamp } from "@/components/record/Stamp";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { stills } from "@/lib/era/stills";
import { useStageProgress } from "@/lib/era/progress";
import { FloorPlate } from "@/components/record/FloorPlate";

export const Route = createFileRoute("/_app/design")({ component: DesignPage });

function DesignPage() {
  const { lens, currentStage, issued, mayIssue, issueStage, holder } = useStageProgress();
  const [issuing, setIssuing] = useState(false);

  if (lens === "guest") return <Navigate to="/" />;

  const liveHere = currentStage === "design";
  const drawingsIssued = Boolean(issued.design);

  return (
    <div>
      <FilmStill src={stills.cdn.portrait} alt="" className="min-h-[46vh]">
        <div className="flex min-h-[46vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <div className="stagger-in max-w-3xl">
            <p className="label-track text-ice">
              03 Design · {liveHere ? "Live" : drawingsIssued ? "Closed" : "Ahead"}
            </p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              Authorship, not a package.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-paper/75">
              {liveHere
                ? "Five sheets. Studio North holds the floor. Issue them and 04 Procure opens."
                : drawingsIssued
                  ? "First drawings are on the record. Procure can be priced."
                  : "Design opens only when the brief has been issued."}
            </p>
            {liveHere && mayIssue("design") ? (
              <button
                type="button"
                onClick={() => setIssuing(true)}
                className="mt-8 inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Issue first drawings — open 04 →
              </button>
            ) : drawingsIssued ? (
              <Link
                to="/stage/$stageId"
                params={{ stageId: "procure" }}
                className="mt-8 inline-flex min-h-11 items-center text-ice hover:text-paper"
              >
                Onward to 04 Procure →
              </Link>
            ) : (
              <Link
                to="/stage/$stageId"
                params={{ stageId: currentStage }}
                className="mt-8 inline-flex min-h-11 items-center text-ice hover:text-paper"
              >
                Return to the live stage →
              </Link>
            )}
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink px-5 py-5 sm:px-10 lg:px-14">
        <StageRail pathname="/design" invert viewing="design" />
        <div className="mt-3">
          <StageNextCue pathname="/design" invert viewing="design" />
        </div>
      </div>

      <PunchStats
        items={[
          { k: "Author", v: "Marcus Teale" },
          { k: "Studio", v: "Studio North" },
          { k: "Route", v: project.contract },
          { k: "Sheets", v: "5" },
        ]}
      />

      <ol className="mx-auto max-w-6xl -space-y-px px-4 py-10 sm:px-8 lg:px-12">
        {drawings.map((d) => (
          <li key={d.id} className="sheet relative p-5 sm:p-6">
            {!drawingsIssued && (
              <span aria-hidden className="hatch pointer-events-none absolute inset-0 bg-draft-wash" />
            )}
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] tracking-wide text-muted">{d.code}</span>
                <Stamp kind={drawingsIssued ? "issued" : "draft"} />
              </div>
              <p className="mt-2 label-track text-petrol">{d.kind}</p>
              <h2 className="mt-2 font-serif text-[26px] leading-snug">{d.title}</h2>
              <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink/75">{d.note}</p>
              <p className="mt-4 font-mono text-[11px] text-muted">
                Rev {d.rev} · {d.author} · {d.studio}
                {d.floor ? ` · Floor ${d.floor}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8 lg:px-12">
        <p className="label-track text-petrol">The drawing on the room</p>
        <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">Authorship, seated</h2>
        <p className="standfirst mt-3 text-muted">
          Hover the west light. HV-FAR-DRW-004 is the quality band, drawn.
        </p>
        <FloorPlate initialLayer="drawings" />
      </section>

      {issuing && (
        <CertifyRitual
          title="Issue first drawings"
          holder={holder}
          verb="Issue"
          onCancel={() => setIssuing(false)}
          onConfirm={() => {
            issueStage("design");
            setIssuing(false);
          }}
        />
      )}
    </div>
  );
}
