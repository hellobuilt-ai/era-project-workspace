import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { leaseInstrument } from "@/lib/era/project";
import { FilmStill, PunchStats } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { stills } from "@/lib/era/stills";
import { useStageProgress } from "@/lib/era/progress";

export const Route = createFileRoute("/_app/lease")({ component: LeasePage });

function LeasePage() {
  const { lens, currentStage, mayIssue, issueStage, holder } = useStageProgress();
  const [issuing, setIssuing] = useState(false);

  if (lens === "guest") return <Navigate to="/documents" />;

  const liveHere = currentStage === "lease";
  const occupiers = leaseInstrument.occupiers.join(" · ");

  return (
    <div>
      <FilmStill src={stills.cdn.night} alt="" className="min-h-[46vh]">
        <div className="flex min-h-[46vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <div className="stagger-in max-w-3xl">
            <p className="label-track text-ice">00 Lease · {liveHere ? "Live" : "Closed"}</p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              The floor is named.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-paper/75">
              {liveHere
                ? "14 Saffron Hill is held. Confirm execution and 01 Strategic opens."
                : "Executed. Occupation from 1 October. The record opened on a named address."}
            </p>
            {liveHere && mayIssue("lease") ? (
              <button
                type="button"
                onClick={() => setIssuing(true)}
                className="mt-8 inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Confirm execution — open 01 →
              </button>
            ) : (
              <Link
                to="/stage/$stageId"
                params={{ stageId: "strategic" }}
                className="mt-8 inline-flex min-h-11 items-center text-ice hover:text-paper"
              >
                Onward to 01 Strategic →
              </Link>
            )}
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink px-5 py-5 sm:px-10 lg:px-14">
        <StageRail pathname="/lease" invert viewing="lease" />
        <div className="mt-3">
          <StageNextCue pathname="/lease" invert viewing="lease" />
        </div>
      </div>

      <PunchStats
        items={[
          { k: "Address", v: leaseInstrument.address },
          { k: "Area", v: `${leaseInstrument.areaSqft.toLocaleString("en-GB")} sq ft` },
          { k: "Occupation", v: leaseInstrument.occupation },
          { k: "Occupiers", v: occupiers },
        ]}
      />

      <ol className="mx-auto max-w-6xl -space-y-px px-4 py-10 sm:px-8 lg:px-12">
        <li className="sheet p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-wide text-muted">HV-FAR-LSE-01</p>
          <p className="mt-2 label-track text-petrol">Landlord</p>
          <h2 className="mt-2 font-serif text-[26px] leading-snug">{leaseInstrument.landlord}</h2>
          <p className="mt-3 text-[15px] text-ink/75">Freehold. Executed {leaseInstrument.executed}.</p>
        </li>
        <li className="sheet p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-wide text-muted">HV-FAR-LSE-02</p>
          <p className="mt-2 label-track text-petrol">Solicitor</p>
          <h2 className="mt-2 font-serif text-[26px] leading-snug">{leaseInstrument.solicitor}</h2>
          <p className="mt-3 text-[15px] text-ink/75">
            {leaseInstrument.solicitorFirm}. Named on the instrument.
          </p>
        </li>
        <li className="sheet p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-wide text-muted">HV-FAR-LSE-03</p>
          <p className="mt-2 label-track text-petrol">Named occupiers</p>
          <h2 className="mt-2 font-serif text-[26px] leading-snug">{occupiers}</h2>
          <p className="mt-3 text-[15px] text-ink/75">
            Head of Real Estate · Managing Partner. The floor is held in their names.
          </p>
        </li>
      </ol>

      {issuing && (
        <CertifyRitual
          title="Confirm lease execution"
          holder={holder}
          onCancel={() => setIssuing(false)}
          onConfirm={() => {
            issueStage("lease");
            setIssuing(false);
          }}
        />
      )}
    </div>
  );
}
