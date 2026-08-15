import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { PACKAGE_SUM, packages, project } from "@/lib/era/project";
import { FilmStill, PunchStats } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { Stamp } from "@/components/record/Stamp";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { stills } from "@/lib/era/stills";
import { useStageProgress } from "@/lib/era/progress";
import { FloorPlate } from "@/components/record/FloorPlate";
import { cn, gbp } from "@/lib/utils";

export const Route = createFileRoute("/_app/packages")({ component: PackagesPage });

function PackagesPage() {
  const { lens, currentStage, issued, mayIssue, issueStage, holder } = useStageProgress();
  const [issuing, setIssuing] = useState(false);

  if (lens === "guest") return <Navigate to="/" />;

  const liveHere = currentStage === "procure";
  const awarded = Boolean(issued.procure);
  const remainder = project.certainty - PACKAGE_SUM - project.contingency;

  return (
    <div>
      <FilmStill src={stills.cdn.meet} alt="" className="min-h-[46vh]">
        <div className="flex min-h-[46vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <div className="stagger-in max-w-3xl">
            <p className="label-track text-ice">
              04 Procure · {liveHere ? "Live" : awarded ? "Closed" : "Ahead"}
            </p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              Named packages.
              <br />
              Named prices.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-paper/75">
              {liveHere
                ? "Nine packages sit against the ceiling. Award them and week 01 of 05 becomes live."
                : awarded
                  ? "Awarded. Construct holds the floor."
                  : "Nothing is tendered until design can be priced against the certified ceiling."}
            </p>
            {liveHere && mayIssue("procure") ? (
              <button
                type="button"
                onClick={() => setIssuing(true)}
                className="mt-8 inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Award the packages — open 05 →
              </button>
            ) : awarded ? (
              <Link
                to="/stage/$stageId"
                params={{ stageId: "construct" }}
                className="mt-8 inline-flex min-h-11 items-center text-ice hover:text-paper"
              >
                Onward to 05 Construct →
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
        <StageRail pathname="/packages" invert viewing="procure" />
        <div className="mt-3">
          <StageNextCue pathname="/packages" invert viewing="procure" />
        </div>
      </div>

      <PunchStats
        items={[
          { k: "Packages", v: gbp(PACKAGE_SUM) },
          { k: "Contingency", v: gbp(project.contingency) },
          { k: "Ceiling", v: gbp(project.certainty) },
          { k: "Remainder", v: gbp(remainder) },
        ]}
      />

      <ol className="mx-auto max-w-6xl -space-y-px px-4 py-10 sm:px-8 lg:px-12">
        {packages.map((p) => (
          <li key={p.id} className="sheet relative p-5 sm:p-6">
            {!awarded && (
              <span aria-hidden className="hatch pointer-events-none absolute inset-0 bg-draft-wash" />
            )}
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] tracking-wide text-muted">{p.code}</span>
                <Stamp kind={awarded ? "issued" : "draft"} />
              </div>
              <p className="mt-2 label-track text-petrol">{p.trade}</p>
              <h2 className="mt-2 font-serif text-[26px] leading-snug">{p.title}</h2>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <p className={cn("text-[14px]", awarded ? "text-ink/75" : "text-muted")}>
                  {awarded ? p.contractor : "Tendered · not awarded"}
                </p>
                <p className="font-mono text-[22px] tabular-nums tracking-tight">{gbp(p.amount)}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8 lg:px-12">
        <p className="label-track text-petrol">Packages as hatches</p>
        <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">Named on the plate</h2>
        <p className="standfirst mt-3 text-muted">
          Each room carries its package. Awarding them is what opens the weeks.
        </p>
        <FloorPlate initialLayer="packages" />
      </section>

      {issuing && (
        <CertifyRitual
          title="Award the packages"
          holder={holder}
          verb="Issue"
          onCancel={() => setIssuing(false)}
          onConfirm={() => {
            issueStage("procure");
            setIssuing(false);
          }}
        />
      )}
    </div>
  );
}
