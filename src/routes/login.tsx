import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useEra } from "@/lib/era/store";
import type { Lens } from "@/lib/era/types";
import { lensMeta } from "@/lib/era/nav";
import { project } from "@/lib/era/project";
import { cn, gbp } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: Login });

const cards: Lens[] = ["era", "client", "guest"];

function Login() {
  const navigate = useNavigate();
  const { setLens } = useEra();
  const [picked, setPicked] = useState<Lens | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const preview = picked ? lensMeta[picked] : null;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink text-paper">
      <img
        src="/era/space-meet.jpg"
        alt=""
        className="kenburns absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgb(11_31_51_/_0.88)_0%,rgb(11_31_51_/_0.55)_46%,rgb(11_31_51_/_0.28)_100%)]" />

      <div className="relative z-10 mx-auto grid min-h-dvh max-w-[1440px] lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 lg:py-12">
          <div className="stagger-in">
            <img src="/brand/era-logo-white.png" alt="ERA" className="h-12 w-auto sm:h-14" />
            <p className="mt-5 label-track text-ice">Project Management & Cost Consultancy</p>
          </div>

          <div className="stagger-in max-w-2xl py-10">
            <p className="label-track text-ice">Invite-only project record</p>
            {picked ? (
              <>
                <h1 className="mt-4 font-display text-[length:var(--text-display-xl)] leading-[0.96]">
                  {project.name}.
                  <br />
                  {gbp(project.certainty)}.
                </h1>
                <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-paper/75">
                  {preview?.name} will see{" "}
                  {picked === "guest"
                    ? "the licence pack only."
                    : picked === "client"
                      ? "the client face — fees, brief, decisions. No ERA notes."
                      : "the full record, including the draft desk."}
                </p>
              </>
            ) : (
              <>
                <h1 className="mt-4 font-display text-[length:var(--text-display-xl)] leading-[0.96]">
                  This new Era
                  <br />
                  of the record.
                </h1>
                <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-paper/75">
                  One controlled record. Named people. Named fees. Absolute cost certainty —
                  without public links or informal sign-off.
                </p>
              </>
            )}
            <p className="mt-8 font-mono text-[12px] tracking-wide text-paper/45">
              {project.areaSqft.toLocaleString("en-GB")} sq ft · {project.programmeWeeks} week programme ·{" "}
              {project.contract}
            </p>
          </div>

          <p className="text-[12px] text-paper/45">
            Access is issued, not requested. Draft AI never approves or certifies.
          </p>
        </section>

        <section className="flex items-end px-4 pb-6 sm:px-8 lg:items-center lg:p-12">
          <div className="w-full max-w-md border border-white/15 bg-paper p-6 text-ink shadow-[var(--shadow-float)] sm:p-8">
            <p className="label-track text-petrol">Sign in</p>
            <h2 className="mt-1 font-serif text-[32px] leading-none">Enter the record</h2>
            <p className="mt-2 text-sm text-muted">Issued for a named person on a named project.</p>

            {authEnabled && (
              <div className="mt-6 space-y-2">
                {GROK_PROVIDERS.map((p) => (
                  <button
                    key={p.providerId}
                    type="button"
                    onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                    className="w-full border border-rule bg-paper px-3.5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-petrol"
                  >
                    Continue with {p.label}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="mt-6 text-left text-[13px] text-petrol underline-offset-4 hover:underline"
            >
              {showPreview ? "Hide preview invitations" : "Preview the record"}
            </button>

            {showPreview && (
              <div className="mt-4 space-y-2">
                {cards.map((l) => {
                  const m = lensMeta[l];
                  const active = picked === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setPicked(l)}
                      className={cn(
                        "w-full border px-3 py-3 text-left transition-[border-color,background-color] duration-150",
                        active ? "border-petrol bg-[rgb(0_79_113_/_0.06)]" : "border-rule hover:border-ink/40",
                      )}
                    >
                      <p className="label-track text-muted">Preview — not issued</p>
                      <p className="mt-1 font-serif text-lg leading-tight">{m.name}</p>
                      <p className="text-[13px] text-muted">
                        {m.privilege}
                        {m.expires ? ` · expires ${m.expires}` : ""}
                      </p>
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={!picked}
                  onClick={() => {
                    if (!picked) return;
                    setLens(picked);
                    void navigate({ to: "/" });
                  }}
                  className="w-full bg-petrol px-3.5 py-3 text-sm font-medium text-paper transition-colors duration-150 hover:bg-petrol-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {picked ? `Enter as ${lensMeta[picked].name}` : "Select an invitation"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
