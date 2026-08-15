import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { project, risks, briefClauses } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { lensMeta } from "@/lib/era/nav";
import { cn, gbp } from "@/lib/utils";
import { Stamp } from "@/components/record/Stamp";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { FilmStill, PunchStats } from "@/components/record/FilmStill";
import { StageNextCue, StageRail } from "@/components/record/StageRail";
import { stills } from "@/lib/era/stills";
import { useStageProgress } from "@/lib/era/progress";
import { QUALITY_ID, canCertifyDecision, stageIndex } from "@/lib/era/stages";
import { FloorPlate } from "@/components/record/FloorPlate";

export const Route = createFileRoute("/_app/")({ component: RecordCover });

function RecordCover() {
  const { lens, decisions, certify, focusDecision, setFocusDecision } = useEra();
  const { currentStage, live, qualityCertified } = useStageProgress();
  const meta = lensMeta[lens];
  const [ritual, setRitual] = useState<string | null>(null);
  const [openBand, setOpenBand] = useState(false);
  const open = decisions.filter((d) => d.status === "open" || d.status === "countered");
  const certified = decisions.filter((d) => d.status === "certified");
  const visibleDecisions =
    lens === "guest" ? decisions.filter((d) => d.id === "d4" || d.id === "d1") : decisions;
  const visibleRisks = (lens === "guest" ? risks.filter((r) => r.id === "r1") : risks).filter(
    (r) => !(r.id === "r3" && qualityCertified),
  );

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (hash === "floor") {
      document.getElementById("floor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const aim = focusDecision ?? (hash.startsWith("decision-") ? hash.slice("decision-".length) : null);
    if (!aim) return;
    const node = document.getElementById(`decision-${aim}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = window.setTimeout(() => setFocusDecision(null), 2400);
    return () => window.clearTimeout(t);
  }, [focusDecision, setFocusDecision]);

  if (lens === "guest") return <Navigate to="/documents" />;

  const gateOpen = currentStage === "strategic" && !qualityCertified;
  const leaseLive = currentStage === "lease";

  return (
    <div className="relative">
      {lens !== "era" && (
        <div className="watermark pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <p className="absolute left-1/2 top-40 -translate-x-1/2 rotate-[-18deg] font-serif text-6xl text-paper/10">
            Preview · {meta.name}
          </p>
        </div>
      )}

      <FilmStill src={stills.cdn.wide} alt="" className="min-h-[62vh] lg:min-h-[72vh]">
        <div className="flex min-h-[62vh] flex-col justify-end px-5 py-10 sm:px-10 lg:min-h-[72vh] lg:px-14 lg:py-14">
          <div className="stagger-in max-w-4xl">
            <p className="label-track text-ice">
              {leaseLive
                ? "One controlled record · 00 Lease · Live"
                : gateOpen
                  ? "One controlled record · 01 Strategic · Live"
                  : `One controlled record · 01 closed · ${live.n} ${live.label} is live`}
            </p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              <span className="block">Harrow & Vale LLP</span>
              <span className="block">Farringdon HQ</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-paper/75">
              {leaseLive
                ? "The floor is named. Confirm execution and 01 Strategic opens."
                : gateOpen
                  ? "CAT B fit-out. Absolute cost certainty. One sentence still holds 01 — the quality band on the partners’ floor. Certify it, and 02 Brief becomes the live stage."
                  : "Quality is certified. 01 is on the record. The brief is now the live instrument — not a PDF that outranks it."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              {leaseLive ? (
                <>
                  <Link
                    to="/lease"
                    className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
                  >
                    Confirm the lease →
                  </Link>
                  <p className="max-w-md text-body-sm text-paper/55">
                    The instrument is executed. Confirmation opens 01.
                  </p>
                </>
              ) : gateOpen ? (
                <>
                  <a
                    href="#decision-d3"
                    onClick={() => setFocusDecision(QUALITY_ID)}
                    className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
                  >
                    Close 01 — certify the quality band →
                  </a>
                  <a href="#floor" className="label-track text-ice hover:text-paper">
                    Walk the floor →
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/stage/$stageId"
                    params={{ stageId: currentStage === "strategic" ? "brief" : currentStage }}
                    className="inline-flex min-h-11 items-center bg-paper px-5 py-2.5 text-body font-medium text-ink transition-colors duration-[var(--motion-quick)] hover:bg-ice"
                  >
                    Enter {live.n} {live.label} →
                  </Link>
                  <a href="#floor" className="label-track text-ice hover:text-paper">
                    Walk the floor →
                  </a>
                </>
              )}
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setOpenBand((v) => !v)}
                className="block text-left"
                aria-expanded={openBand}
                aria-controls="certainty-instrument"
              >
                <p className="label-track text-paper/50">Certified construction</p>
                <p className="mt-1 font-mono text-[clamp(2.4rem,6vw,4.2rem)] tabular-nums leading-none tracking-tight text-paper">
                  {gbp(project.certainty)}
                </p>
                <p className="mt-2 text-[13px] text-paper/55">
                  Henry Geldenhuys · 8 Aug 2026 · band ±{(project.certaintyBand * 100).toFixed(0)}%
                </p>
              </button>
              <CertaintyInstrument open={openBand} />
            </div>
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink">
        <div className="px-5 py-5 sm:px-10 lg:px-14">
          <StageRail pathname="/" invert />
          <div className="mt-3">
            <StageNextCue pathname="/" invert />
          </div>
        </div>
        <PunchStats
          invert
          items={[
            { k: "Area", v: `${project.areaSqft.toLocaleString("en-GB")} sq ft` },
            { k: "Programme", v: `${project.programmeWeeks} weeks` },
            { k: "Contract", v: "JCT Traditional" },
            { k: "Certified", v: `${certified.length} decisions` },
          ]}
        />
      </div>

      <section id="floor" className="scroll-mt-16 border-t border-hairline bg-warm">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
          <p className="label-track text-petrol">The floor itself</p>
          <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">14 Saffron Hill</h2>
          <p className="standfirst mt-3 text-muted">
            Two floors. Named rooms. The brief is the plan — not a PDF pinned to a wall.
          </p>
          <FloorPlate />
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-12 lg:py-14">
        <div>
          <header className="flex items-end justify-between gap-4">
            <div>
              <p className="label-track text-petrol">Decision & fee ledger</p>
              <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">The instrument</h2>
            </div>
            <p className="hidden font-mono text-[11px] text-muted sm:block">
              {open.length} awaiting a named person
            </p>
          </header>

          <ol className="mt-6 -space-y-px">
            {visibleDecisions.map((d) => {
              const aimed = focusDecision === d.id || d.id === QUALITY_ID;
              const isGate = d.id === QUALITY_ID;
              const allow = canCertifyDecision(lens, d.aiDraft, d.id, d.status);
              return (
                <li
                  key={d.id}
                  id={`decision-${d.id}`}
                  className={cn("sheet relative scroll-mt-24", aimed && isGate && d.status !== "certified" && "decision-aim")}
                >
                  {d.aiDraft && (
                    <div aria-hidden className="hatch pointer-events-none absolute inset-0 bg-draft-wash" />
                  )}
                  <div className="relative px-4 py-6 sm:px-5 sm:py-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] tracking-wide text-muted">
                        HV-FAR-DEC-0{d.id.slice(1)}
                      </span>
                      <Stamp
                        kind={
                          d.status === "certified"
                            ? "certified"
                            : d.aiDraft
                              ? "draft"
                              : d.status === "open" || d.status === "countered"
                                ? "issued"
                                : "superseded"
                        }
                      />
                      {d.feeNamed && (
                        <span className="font-mono text-[12px] text-petrol">{d.feeNamed}</span>
                      )}
                      {isGate && d.status !== "certified" && (
                        <span className="label-track text-signal-risk">Holds 01</span>
                      )}
                    </div>
                    <h3 className="mt-3 font-serif text-[22px] leading-snug sm:text-[26px]">{d.title}</h3>
                    <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink/80">{d.body}</p>
                    {isGate && d.status !== "certified" && (
                      <p className="mt-3 max-w-prose text-[14px] text-ink/70">
                        Sign this and 01 Strategic closes. 02 Brief becomes the live stage.
                      </p>
                    )}
                    <p className="mt-3 text-[13px] text-muted">
                      Named by {d.namedBy}
                      {d.certifiedBy ? ` · Certified by ${d.certifiedBy}` : " · not certified"}
                      {" · "}
                      {d.at}
                    </p>
                    {allow && (
                      <button
                        type="button"
                        onClick={() => setRitual(d.id)}
                        className="mt-4 bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-transform duration-150 active:scale-[0.96]"
                      >
                        {isGate ? `Close 01 as ${meta.name}` : `Certify as ${meta.name}`}
                      </button>
                    )}
                    {isGate && lens === "client" && d.status !== "certified" && (
                      <p className="mt-3 text-[13px] text-petrol">
                        This is your sentence. Sign it and 01 closes.
                      </p>
                    )}
                    {d.aiDraft && (
                      <p className="relative mt-4 max-w-prose border border-dashed border-rule px-3 py-2 text-[13px] text-signal-hold">
                        Draft AI · not a certificate · cannot be issued.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="space-y-8">
          {stageIndex(currentStage) <= stageIndex("brief") && (
          <section>
            <p className="label-track text-petrol">The door to 02</p>
            <ol className="mt-3 divide-y divide-rule border-y border-rule">
              <li className="py-3">
                <p className="font-mono text-micro text-muted">01</p>
                <p className="mt-1 text-[15px] font-medium">Certify Cat B quality band</p>
                <p className="mt-1 text-[12px] text-muted">
                  {qualityCertified ? "Closed. 01 is on the record." : "Open. This is the only gate."}
                </p>
              </li>
              <li className="py-3">
                <p className="font-mono text-micro text-muted">02</p>
                <p className="mt-1 text-[15px] font-medium">Brief becomes live</p>
                <p className="mt-1 text-[12px] text-muted">
                  {qualityCertified ? "Live. Enter the four tensions." : "Being drawn. Waiting on the band."}
                </p>
                <Link
                  to={qualityCertified ? "/stage/$stageId" : "/brief"}
                  params={qualityCertified ? { stageId: "brief" } : undefined}
                  className="mt-2 inline-block label-track text-petrol hover:text-ink"
                >
                  {qualityCertified ? "Enter 02 Brief →" : "Read 02 now →"}
                </Link>
              </li>
            </ol>
          </section>
          )}

          <section>
            <p className="label-track text-petrol">What needs you</p>
            <ul className="mt-3 divide-y divide-rule border-y border-rule">
              {open.map((d) => (
                <li key={d.id} className="py-3">
                  <p className="text-[15px] font-medium">{d.title}</p>
                  <p className="mt-1 text-[12px] text-muted">
                    {d.aiDraft ? "Awaiting Evans to claim the draft" : `Named by ${d.namedBy}`}
                  </p>
                </li>
              ))}
              {lens === "client" && !qualityCertified && (
                <li className="py-3">
                  <p className="text-[15px] font-medium">Quality band still open</p>
                  <p className="mt-1 text-[12px] text-muted">Your sentence closes 01.</p>
                </li>
              )}
            </ul>
          </section>

          <section>
            <p className="label-track text-petrol">Four tensions</p>
            <ul className="mt-3 space-y-3">
              {briefClauses.map((c) => (
                <li key={c.id}>
                  <Link to="/brief" className="block hover:text-petrol">
                    <p className="label-track text-ice-ink">{c.pillar}</p>
                    <p className="mt-0.5 text-[15px]">{c.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/stage/$stageId"
              params={{ stageId: "brief" }}
              className="mt-4 inline-block label-track text-petrol hover:text-ink"
            >
              Open 02 Brief →
            </Link>
          </section>

          <section>
            <p className="label-track text-petrol">On the number</p>
            <ul className="mt-3 space-y-3">
              {visibleRisks.map((r) => (
                <li key={r.id} className="border-l-2 pl-3" style={{ borderColor: tone(r.severity) }}>
                  <p className="text-[14px]">{r.title}</p>
                  <p className="mt-1 text-[12px] text-muted">
                    {r.owner}
                    {lens === "era" || r.severity !== "watch" ? ` · ${r.note}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {ritual && (
        <CertifyRitual
          title={decisions.find((d) => d.id === ritual)?.title ?? ""}
          holder={meta.name}
          blocked={decisions.find((d) => d.id === ritual)?.aiDraft === true}
          onCancel={() => setRitual(null)}
          onConfirm={() => {
            const d = decisions.find((x) => x.id === ritual);
            if (!d || d.aiDraft) return;
            certify(ritual, meta.name);
            setRitual(null);
          }}
        />
      )}
    </div>
  );
}

function CertaintyInstrument({ open }: { open: boolean }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setArmed(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setArmed(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  const previous = project.previousCertainty;
  const now = project.certainty;
  const ve = previous - now;
  const held = project.contingency;
  const band = project.certaintyBand;
  const low = now * (1 - band);
  const high = now * (1 + band);
  const span = high - low;
  const nowMark = ((now - low) / span) * 100;
  const prevMark = ((previous - low) / span) * 100;
  const rail = (n: number) => (armed ? n : 0);

  return (
    <div
      id="certainty-instrument"
      role="region"
      aria-label="Cost certainty instrument"
      className="mt-5 max-w-md border border-white/20 bg-ink/50 px-4 py-4"
    >
      <p className="label-track text-ice">Drawn pass</p>
      <dl className="mt-3 space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="label-track text-paper/50">Previous pass</dt>
            <dd className="font-mono text-[12px] tabular-nums text-paper">{gbp(previous)}</dd>
          </div>
          <div className="relative mt-1.5 h-[3px] bg-white/10">
            <div
              className="absolute inset-y-0 left-0 bg-paper/70"
              style={{
                width: `${rail(100)}%`,
                transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="label-track text-paper/50">VE stair</dt>
            <dd className="font-mono text-[12px] tabular-nums text-ice">{`−${gbp(ve)}`}</dd>
          </div>
          <div className="relative mt-1.5 h-[3px] bg-white/10">
            <div
              className="absolute inset-y-0 left-0 bg-paper"
              style={{
                width: `${rail((now / previous) * 100)}%`,
                transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
            <div
              className="absolute inset-y-0 bg-ice"
              style={{
                left: `${rail((now / previous) * 100)}%`,
                width: `${rail((ve / previous) * 100)}%`,
                transition:
                  "left 700ms cubic-bezier(0.22, 1, 0.36, 1), width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
        </div>
        <InstrumentRail
          label="Contingency held"
          value={gbp(held)}
          width={rail((held / previous) * 100)}
          fill="bg-white/35"
          hatch
        />
      </dl>

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="label-track text-paper/50">Certainty band</p>
          <p className="font-mono text-[12px] tabular-nums text-paper">±{(band * 100).toFixed(0)}%</p>
        </div>
        <div
          className="relative mt-2 h-6"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.22) 0 1px, transparent 1px 10%)",
          }}
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/25" />
          <div
            className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-ice/80"
            style={{
              left: `${armed ? 0 : nowMark}%`,
              width: `${armed ? 100 : 0}%`,
              transition: "left 700ms cubic-bezier(0.22, 1, 0.36, 1), width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          <span
            className="absolute top-0 h-6 w-px bg-paper"
            style={{ left: `${nowMark}%` }}
            title="Certified"
          />
          <span
            className="absolute top-1 h-4 w-px bg-ice"
            style={{ left: `${prevMark}%` }}
            title="Previous pass"
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-paper/45">
          <span>{gbp(low)}</span>
          <span>{gbp(now)}</span>
          <span>{gbp(high)}</span>
        </div>
      </div>

      <p className="mt-4 border-t border-white/15 pt-3 text-[12px] text-paper/60">
        Named by Henry Geldenhuys. Secondary staircase taken out. Contingency stays inside the number.
      </p>
    </div>
  );
}

function InstrumentRail({
  label,
  value,
  width,
  fill,
  hatch,
}: {
  label: string;
  value: string;
  width: number;
  fill: string;
  hatch?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="label-track text-paper/50">{label}</dt>
        <dd className="font-mono text-[12px] tabular-nums text-paper">{value}</dd>
      </div>
      <div className="mt-1.5 h-[3px] bg-white/10">
        <div
          className={`h-full ${fill}`}
          style={{
            width: `${width}%`,
            transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            backgroundImage: hatch
              ? "repeating-linear-gradient(-18deg, transparent, transparent 3px, rgb(11 31 51 / 0.35) 3px, rgb(11 31 51 / 0.35) 4px)"
              : undefined,
          }}
        />
      </div>
    </div>
  );
}

function tone(s: "watch" | "hold" | "risk") {
  if (s === "risk") return "#8B3A32";
  if (s === "hold") return "#8A6A2F";
  return "#7EB6CC";
}
