import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { fees, project } from "@/lib/era/project";
import { FilmStill, PunchStats } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { Stamp } from "@/components/record/Stamp";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { stills } from "@/lib/era/stills";
import { useStageProgress } from "@/lib/era/progress";
import { gbp } from "@/lib/utils";

export const Route = createFileRoute("/_app/handover")({ component: HandoverPage });

const thriveFee = fees.find((f) => f.id === "f4")?.amount ?? 6812;

function HandoverPage() {
  const {
    lens,
    currentStage,
    issued,
    thriveIssued,
    mayIssue,
    mayIssueThrive,
    issueStage,
    issueThrive,
    holder,
  } = useStageProgress();
  const [ritual, setRitual] = useState<"thrive" | "handover" | null>(null);

  if (lens === "guest") return <Navigate to="/" />;

  const liveHere = currentStage === "handover";
  const recordIssued = Boolean(issued.handover);

  return (
    <div>
      <FilmStill src={stills.cdn.night} alt="" className="min-h-[46vh]">
        <div className="flex min-h-[46vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <div className="stagger-in max-w-3xl">
            <p className="label-track text-ice">
              06 Handover · {recordIssued ? "Issued" : liveHere ? "Live" : "Ahead"}
            </p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              Soft landing.
              <br />
              Then thrive.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-paper/75">
              {recordIssued
                ? "The record stays issued while the floor is occupied."
                : liveHere
                  ? "Practical completion is certified. Staff return. Thrive is a named fee, not a silent extension."
                  : "Handover opens when week 14 is certified."}
            </p>
            <Link to="/fees" className="mt-8 inline-flex min-h-11 items-center text-ice hover:text-paper">
              Named fees · thrive sits here →
            </Link>
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink px-5 py-5 sm:px-10 lg:px-14">
        <StageRail pathname="/handover" invert viewing="handover" />
        <div className="mt-3">
          <StageNextCue pathname="/handover" invert viewing="handover" />
        </div>
      </div>

      <PunchStats
        items={[
          { k: "PC", v: project.handover },
          { k: "Staff return", v: "Week 13" },
          { k: "Thrive", v: gbp(thriveFee) },
          { k: "Retainer", v: "12 weeks" },
        ]}
      />

      <ol className="mx-auto max-w-6xl -space-y-px px-4 py-10 sm:px-8 lg:px-12">
        <li className="sheet p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-wide text-muted">HV-FAR-HND-01</p>
          <p className="mt-2 label-track text-petrol">Soft landing</p>
          <h2 className="mt-2 font-serif text-[26px] leading-snug">Staff return from week 13.</h2>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink/75">
            Induction on the occupied floor. Snags close in place. The record does not close on PC.
          </p>
        </li>
        <li className="sheet relative p-5 sm:p-6">
          {!thriveIssued && (
            <span aria-hidden className="hatch pointer-events-none absolute inset-0 bg-draft-wash" />
          )}
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] tracking-wide text-muted">HV-FAR-HND-02</p>
              <Stamp kind={thriveIssued ? "issued" : "draft"} />
            </div>
            <p className="mt-2 label-track text-petrol">Thrive</p>
            <h2 className="mt-2 font-serif text-[26px] leading-snug">Twelve weeks. Optional.</h2>
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink/75">
              {gbp(thriveFee)} named to David Evans. A retainer, not a silent extension.
            </p>
            {mayIssueThrive() && (
              <button
                type="button"
                onClick={() => setRitual("thrive")}
                className="mt-5 inline-flex min-h-11 items-center bg-ink px-4 py-2.5 text-[13px] font-medium text-paper"
              >
                Issue the thrive retainer
              </button>
            )}
          </div>
        </li>
        <li className="sheet p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[11px] tracking-wide text-muted">HV-FAR-HND-03</p>
            <Stamp kind={recordIssued ? "issued" : "draft"} />
          </div>
          <p className="mt-2 label-track text-petrol">End state</p>
          <h2 className="mt-2 font-serif text-[26px] leading-snug">The record stays issued.</h2>
          <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink/75">
            Handover has no next stage. Issuing it does not close the record.
          </p>
          {mayIssue("handover") && (
            <button
              type="button"
              onClick={() => setRitual("handover")}
              className="mt-5 inline-flex min-h-11 items-center bg-ink px-4 py-2.5 text-[13px] font-medium text-paper"
            >
              The record stays issued
            </button>
          )}
        </li>
      </ol>

      {ritual === "thrive" && (
        <CertifyRitual
          title="Issue the thrive retainer"
          holder={holder}
          onCancel={() => setRitual(null)}
          onConfirm={() => {
            issueThrive();
            setRitual(null);
          }}
        />
      )}
      {ritual === "handover" && (
        <CertifyRitual
          title="The record stays issued"
          holder={holder}
          onCancel={() => setRitual(null)}
          onConfirm={() => {
            issueStage("handover");
            setRitual(null);
          }}
        />
      )}
    </div>
  );
}
