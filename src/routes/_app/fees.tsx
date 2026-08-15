import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fees, project } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { gbp } from "@/lib/utils";
import { Stamp } from "@/components/record/Stamp";
import { FilmStill } from "@/components/record/FilmStill";
import { stills } from "@/lib/era/stills";

export const Route = createFileRoute("/_app/fees")({ component: FeesPage });

function FeesPage() {
  const { lens, thriveIssued } = useEra();
  const [picked, setPicked] = useState(fees[0]?.id ?? "f1");
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setArmed(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (lens === "guest") return <Navigate to="/" />;

  const lines = fees.map((f) =>
    f.id === "f4" && thriveIssued ? { ...f, status: "issued" as const } : f,
  );
  const issued = lines.filter((f) => f.status !== "draft");
  const issuedTotal = issued.reduce((a, f) => a + f.amount, 0);
  const draftTotal = lines.filter((f) => f.status === "draft").reduce((a, f) => a + f.amount, 0);
  const active = lines.find((f) => f.id === picked) ?? lines[0];

  const previous = project.previousCertainty;
  const now = project.certainty;
  const ve = previous - now;
  const held = project.contingency;
  const rail = (n: number) => (armed ? n : 0);

  return (
    <div>
      <FilmStill src={stills.cdn.portrait} alt="" className="min-h-[42vh]">
        <div className="flex min-h-[42vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <p className="label-track text-ice">Named people · named fees</p>
          <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
            {gbp(project.certainty)}.
            <br />
            Held.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-paper/75">
            A fee is a professional promise. Variations are new rows. Nothing is edited in place.
          </p>
        </div>
      </FilmStill>

      <section className="border-b border-rule bg-paper px-4 py-10 sm:px-8 lg:px-12">
        <p className="label-track text-petrol">The ceiling</p>
        <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">How construction is held</h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">
          Named by Henry Geldenhuys. Construction is certified at {gbp(now)}. Professional fees sit
          beside it, never inside it.
        </p>
        <dl className="mt-8 max-w-2xl space-y-5">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-track text-muted">Previous pass</dt>
              <dd className="font-mono text-[15px] tabular-nums">{gbp(previous)}</dd>
            </div>
            <div className="relative mt-2 h-[3px] bg-field">
              <div
                className="absolute inset-y-0 left-0 bg-ink/70"
                style={{
                  width: `${rail(100)}%`,
                  transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-track text-muted">Certified construction</dt>
              <dd className="font-mono text-[15px] tabular-nums">{gbp(now)}</dd>
            </div>
            <div className="relative mt-2 h-[3px] bg-field">
              <div
                className="absolute inset-y-0 left-0 bg-ink"
                style={{
                  width: `${rail((now / previous) * 100)}%`,
                  transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-track text-muted">VE stair</dt>
              <dd className="font-mono text-[15px] tabular-nums text-petrol">{`\u2212${gbp(ve)}`}</dd>
            </div>
            <div className="relative mt-2 h-[3px] bg-field">
              <div
                className="absolute inset-y-0 left-0 bg-ink"
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
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-track text-muted">Contingency held</dt>
              <dd className="font-mono text-[15px] tabular-nums">{gbp(held)}</dd>
            </div>
            <div className="mt-2 h-[3px] bg-field">
              <div
                className="hatch h-full bg-ink/35"
                style={{
                  width: `${rail((held / previous) * 100)}%`,
                  transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </div>
        </dl>
        <p className="mt-6 max-w-2xl border-t border-rule pt-4 text-[13px] text-muted">
          Henry Geldenhuys · 8 Aug 2026. Secondary staircase taken out. Contingency stays inside the
          number. Draft lines cannot move it.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-8 lg:px-12">
        <p className="label-track text-petrol">Named promises</p>
        <h2 className="mt-1 font-display text-[length:var(--text-display-md)]">Issued against each other</h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">
          Issued fees are drawn against the issued total of {gbp(issuedTotal)}. Draft stays hatched
          and unsigned. Each row names a person.
        </p>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-12">
        <div>
          <ol className="-space-y-px">
            {issued.map((f) => {
              const i = lines.indexOf(f);
              const on = f.id === active.id;
              const share = issuedTotal > 0 ? (f.amount / issuedTotal) * 100 : 0;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(f.id)}
                    className="sheet relative w-full p-5 text-left sm:p-6"
                  >
                    {on && (
                      <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-ice" />
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-mono text-[11px] tracking-wide text-muted">
                        HV-FAR-FEE-00{i + 1}
                      </span>
                      <Stamp kind={f.status} />
                    </div>
                    <h3 className="mt-3 font-serif text-[22px] leading-snug sm:text-[26px]">{f.item}</h3>
                    <p className="mt-2 text-[14px] text-ink/75">{f.basis}</p>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                      <p className="text-[13px] text-muted">Named to {f.namedTo}</p>
                      <p className="font-mono text-[22px] tabular-nums tracking-tight">{gbp(f.amount)}</p>
                    </div>
                    <div className="mt-4 h-[3px] bg-field">
                      <div
                        className="h-full bg-ink"
                        style={{
                          width: `${rail(share)}%`,
                          transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[11px] tabular-nums text-muted">
                      {Math.round(share)}% of issued
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>

          <p className="label-track mb-3 mt-8 text-signal-hold">Draft · unsigned</p>
          <ol className="-space-y-px">
            {lines
              .filter((f) => f.status === "draft")
              .map((f) => {
                const i = lines.indexOf(f);
                const on = f.id === active.id;
                const draftShare = issuedTotal > 0 ? (f.amount / issuedTotal) * 100 : 0;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setPicked(f.id)}
                      className="sheet relative w-full p-5 text-left sm:p-6"
                    >
                      <span
                        aria-hidden
                        className="hatch pointer-events-none absolute inset-0 bg-draft-wash"
                      />
                      {on && (
                        <span aria-hidden className="absolute inset-y-0 left-0 z-[1] w-[2px] bg-ice" />
                      )}
                      <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="font-mono text-[11px] tracking-wide text-muted">
                            HV-FAR-FEE-00{i + 1}
                          </span>
                          <Stamp kind={f.status} />
                        </div>
                        <h3 className="mt-3 font-serif text-[22px] leading-snug sm:text-[26px]">
                          {f.item}
                        </h3>
                        <p className="mt-2 text-[14px] text-ink/75">{f.basis}</p>
                        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                          <p className="text-[13px] text-muted">Named to {f.namedTo}</p>
                          <p className="font-mono text-[22px] tabular-nums tracking-tight">
                            {gbp(f.amount)}
                          </p>
                        </div>
                        <div className="mt-4 h-[3px] bg-field">
                          <div
                            className="hatch h-full bg-signal-hold/55"
                            style={{
                              width: `${rail(draftShare)}%`,
                              transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                          />
                        </div>
                        <p className="mt-2 font-mono text-[11px] tabular-nums text-muted">
                          Unsigned · not on the issued total
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
          </ol>
        </div>

        <aside
          className={
            active.status === "draft"
              ? "sheet relative p-5 lg:sticky lg:top-8 lg:self-start"
              : "sheet p-5 lg:sticky lg:top-8 lg:self-start"
          }
        >
          {active.status === "draft" && (
            <span aria-hidden className="hatch pointer-events-none absolute inset-0 bg-draft-wash" />
          )}
          <div className="relative">
            <p className="label-track text-petrol">Selected promise</p>
            <h3 className="mt-2 font-serif text-[26px] leading-tight">{active.item}</h3>
            <p className="mt-3 font-mono text-[28px] tabular-nums leading-none">{gbp(active.amount)}</p>
            <p className="mt-4 text-[14px] text-ink/75">{active.basis}</p>
            <p className="mt-3 text-[13px] text-muted">
              Named to {active.namedTo}.{" "}
              {active.status === "draft"
                ? "Draft AI cannot issue this line."
                : "Issued as a professional promise."}
            </p>
            <dl className="mt-6 space-y-2 border-t border-rule pt-4 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Issued total</dt>
                <dd className="font-mono tabular-nums">{gbp(issuedTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Draft, unsigned</dt>
                <dd className="font-mono tabular-nums">{gbp(draftTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Construction ceiling</dt>
                <dd className="font-mono tabular-nums">{gbp(project.certainty)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
