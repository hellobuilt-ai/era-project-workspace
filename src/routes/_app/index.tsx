import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { project, risks, briefClauses } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { lensMeta } from "@/lib/era/nav";
import { gbp } from "@/lib/utils";
import { Stamp } from "@/components/record/Stamp";
import { CertifyRitual } from "@/components/record/CertifyRitual";
import { FilmStill, PunchStats } from "@/components/record/FilmStill";

export const Route = createFileRoute("/_app/")({ component: RecordCover });

function RecordCover() {
  const { lens, decisions, certify } = useEra();
  const meta = lensMeta[lens];
  const [ritual, setRitual] = useState<string | null>(null);
  const [openBand, setOpenBand] = useState(false);
  const open = decisions.filter((d) => d.status === "open" || d.status === "countered");
  const certified = decisions.filter((d) => d.status === "certified");
  const visibleDecisions =
    lens === "guest" ? decisions.filter((d) => d.id === "d4" || d.id === "d1") : decisions;
  const visibleRisks = lens === "guest" ? risks.filter((r) => r.id === "r1") : risks;

  if (lens === "guest") return <Navigate to="/documents" />;

  return (
    <div className="relative">
      {lens !== "era" && (
        <div className="watermark pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <p className="absolute left-1/2 top-40 -translate-x-1/2 rotate-[-18deg] font-serif text-6xl text-paper/10">
            Preview · {meta.name}
          </p>
        </div>
      )}

      <FilmStill src="/era/hero-wide.jpg" alt="" className="min-h-[62vh] lg:min-h-[72vh]">
        <div className="flex min-h-[62vh] flex-col justify-end px-5 py-10 sm:px-10 lg:min-h-[72vh] lg:px-14 lg:py-14">
          <div className="stagger-in max-w-4xl">
            <p className="label-track text-ice">One controlled record</p>
            <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
              <span className="block">Harrow & Vale LLP</span>
              <span className="block">Farringdon HQ</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-paper/75">
              CAT B fit-out. Absolute cost certainty. Named people, named fees —
              the RFP lives here, not in a thread.
            </p>
            <button type="button" onClick={() => setOpenBand((v) => !v)} className="mt-8 block text-left">
              <p className="label-track text-paper/50">Certified construction</p>
              <p className="mt-1 font-mono text-[clamp(2.4rem,6vw,4.2rem)] tabular-nums leading-none tracking-tight text-paper">
                {gbp(project.certainty)}
              </p>
              <p className="mt-2 text-[13px] text-paper/55">
                Henry Geldenhuys · 8 Aug 2026 · band ±{(project.certaintyBand * 100).toFixed(0)}%
              </p>
            </button>
            {openBand && (
              <dl className="mt-5 max-w-sm space-y-2 border-t border-white/20 pt-4 text-[13px] text-paper/70">
                <div className="flex justify-between gap-4">
                  <dt>Previous pass</dt>
                  <dd className="font-mono tabular-nums">{gbp(project.previousCertainty)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Variance (VE stair)</dt>
                  <dd className="font-mono tabular-nums text-ice">
                    −{gbp(project.previousCertainty - project.certainty)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Contingency held</dt>
                  <dd className="font-mono tabular-nums">{gbp(project.contingency)}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </FilmStill>

      <div className="bg-ink">
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

          <ol className="mt-6 space-y-3">
            {visibleDecisions.map((d) => (
              <li key={d.id} className="lift border border-rule bg-paper p-5 sm:p-6">
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
                </div>
                <h3 className="mt-3 font-serif text-[22px] leading-snug sm:text-[26px]">{d.title}</h3>
                <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink/80">{d.body}</p>
                <p className="mt-3 text-[13px] text-muted">
                  Named by {d.namedBy}
                  {d.certifiedBy ? ` · Certified by ${d.certifiedBy}` : " · not certified"}
                  {" · "}
                  {d.at}
                </p>
                {(d.status === "open" || d.status === "countered") && lens === "era" && !d.aiDraft && (
                  <button
                    type="button"
                    onClick={() => setRitual(d.id)}
                    className="mt-4 bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-transform duration-150 active:scale-[0.96]"
                  >
                    Certify as {meta.name}
                  </button>
                )}
                {d.aiDraft && (
                  <p className="mt-4 max-w-prose border border-dashed border-rule bg-draft-wash px-3 py-2 text-[13px] text-signal-hold">
                    Draft AI · not a certificate · cannot be issued.
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-8">
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
              {lens === "client" && (
                <li className="py-3">
                  <p className="text-[15px] font-medium">Quality band still open</p>
                  <p className="mt-1 text-[12px] text-muted">Your sentence is required.</p>
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
          onCancel={() => setRitual(null)}
          onConfirm={() => {
            certify(ritual, meta.name);
            setRitual(null);
          }}
        />
      )}
    </div>
  );
}

function tone(s: "watch" | "hold" | "risk") {
  if (s === "risk") return "#8B3A32";
  if (s === "hold") return "#8A6A2F";
  return "#7EB6CC";
}
