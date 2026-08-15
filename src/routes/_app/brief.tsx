import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { briefClauses, project } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { FilmStill } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { stills } from "@/lib/era/stills";
import { useStageProgress } from "@/lib/era/progress";
import { QUALITY_ID, canCertifyDecision } from "@/lib/era/stages";
import { lensMeta } from "@/lib/era/nav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/brief")({ component: BriefPage });

const tiles = [stills.cdn.wide, stills.cdn.floor, stills.cdn.meet, stills.cdn.portrait];

function BriefPage() {
  const { lens, certify, setFocusDecision } = useEra();
  const { currentStage, qualityCertified, quality, mayIssue, issueStage, holder, live } =
    useStageProgress();
  const [issuing, setIssuing] = useState(false);
  const [certifying, setCertifying] = useState(false);
  const meta = lensMeta[lens];

  if (lens === "guest") return <Navigate to="/" />;

  const liveHere = currentStage === "brief";
  const canSignQuality = quality
    ? canCertifyDecision(lens, quality.aiDraft, quality.id, quality.status)
    : false;

  return (
    <div>
      <FilmStill src={stills.cdn.floor} alt="" className="min-h-[46vh]">
        <div className="flex min-h-[46vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <div className="stagger-in max-w-3xl">
            <p className="label-track text-ice">
              02 Brief · {liveHere ? "Live" : currentStage === "strategic" ? "Being drawn" : "On the record"}
            </p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              Four tensions.
              <br />
              One brief.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-paper/75">
              {liveHere
                ? qualityCertified
                  ? "Quality is signed. Issue this brief and 03 Design opens."
                  : "02 is live. It cannot be issued until the quality band is certified."
                : currentStage === "strategic"
                  ? "Already being drawn during 01. Read it now. It becomes live when the quality band closes 01."
                  : "Issued. Design holds the floor."}
            </p>
            {liveHere && qualityCertified && mayIssue("brief") ? (
              <button
                type="button"
                onClick={() => setIssuing(true)}
                className="mt-8 inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Issue the brief — open 03 Design →
              </button>
            ) : currentStage === "strategic" ? (
              <Link
                to="/"
                hash="decision-d3"
                onClick={() => setFocusDecision(QUALITY_ID)}
                className="mt-8 inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
              >
                Return to 01 — close the quality gate →
              </Link>
            ) : (
              <Link
                to="/stage/$stageId"
                params={{ stageId: currentStage === "brief" ? "design" : currentStage }}
                className="mt-8 inline-flex min-h-11 items-center text-ice hover:text-paper"
              >
                After this · {live.n} {live.label} →
              </Link>
            )}
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink px-5 py-5 sm:px-10 lg:px-14">
        <StageRail pathname="/brief" invert viewing="brief" />
        <div className="mt-3">
          <StageNextCue pathname="/brief" invert viewing="brief" />
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {briefClauses.map((c, i) => {
          const qualityTile = i === 3;
          const agreed = !qualityTile || qualityCertified;
          return (
            <article
              key={c.id}
              className={cn("relative min-h-[340px] overflow-hidden bg-ink", qualityTile && !agreed && "decision-aim")}
            >
              <img src={tiles[i]} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(11_31_51_/_0.15),rgb(11_31_51_/_0.78))]" />
              <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-end p-6 sm:p-8">
                <p className="label-track text-ice">
                  0{i + 1} · {c.pillar}
                </p>
                <h2 className="mt-2 font-serif text-[28px] leading-tight text-paper sm:text-[34px]">{c.title}</h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-paper/75">{c.copy}</p>
                <p className="mt-5 font-mono text-[11px] text-paper/45">
                  HV-FAR-BRI-0{i + 1} · {agreed ? "Agreed" : "Open · Amelia Croft"}
                </p>
                {qualityTile && !agreed && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {canSignQuality ? (
                      <button
                        type="button"
                        onClick={() => setCertifying(true)}
                        className="inline-flex min-h-11 items-center bg-paper px-4 py-2 text-[13px] font-medium text-ink"
                      >
                        Certify as {meta.name}
                      </button>
                    ) : (
                      <Link
                        to="/"
                        hash="decision-d3"
                        onClick={() => setFocusDecision(QUALITY_ID)}
                        className="inline-flex min-h-11 items-center bg-paper px-4 py-2 text-[13px] font-medium text-ink"
                      >
                        Open the quality gate
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <aside className="border-t border-rule bg-paper px-5 py-8 sm:px-10 lg:px-14">
        <p className="label-track text-petrol">
          {liveHere
            ? qualityCertified
              ? "Stage gate · 02 is ready to issue"
              : "Stage gate · 02 cannot issue"
            : currentStage === "strategic"
              ? "Stage gate · 01 still holds the door"
              : "Stage gate · 02 issued"}
        </p>
        <p className="mt-2 max-w-2xl text-[17px] leading-relaxed">
          {liveHere && qualityCertified
            ? "The four tensions are agreed. Issue the brief and Studio North takes the floor."
            : !qualityCertified
              ? `${project.stageLabel}. Quality remains open. The cost ceiling holds only if the partners’ floor stays inside the band Henry certified.`
              : "The brief is on the record. Design is the live instrument."}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/stage/$stageId" params={{ stageId: "strategic" }} className="label-track text-petrol hover:text-ink">
            ← 01 Strategic
          </Link>
          {liveHere && qualityCertified && mayIssue("brief") ? (
            <button
              type="button"
              onClick={() => setIssuing(true)}
              className="label-track text-petrol hover:text-ink"
            >
              Issue 02 — open 03 Design →
            </button>
          ) : (
            <Link to="/stage/$stageId" params={{ stageId: "design" }} className="label-track text-petrol hover:text-ink">
              Read ahead · 03 Design →
            </Link>
          )}
        </div>
      </aside>

      {certifying && (
        <CertifyRitual
          title="Cat B quality band"
          holder={holder}
          onCancel={() => setCertifying(false)}
          onConfirm={() => {
            certify(QUALITY_ID, holder);
            setCertifying(false);
          }}
        />
      )}
      {issuing && (
        <CertifyRitual
          title="Issue the strategic brief"
          holder={holder}
          verb="Issue"
          onCancel={() => setIssuing(false)}
          onConfirm={() => {
            issueStage("brief");
            setIssuing(false);
          }}
        />
      )}
    </div>
  );
}
