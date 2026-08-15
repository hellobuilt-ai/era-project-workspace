import { useEffect, useRef, useState } from "react";
import { people, project } from "@/lib/era/project";
import { gbp } from "@/lib/utils";
import { Stamp } from "@/components/record/Stamp";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function CertifyRitual({
  title,
  holder,
  blocked,
  verb = "Certify",
  onConfirm,
  onCancel,
}: {
  title: string;
  holder: string;
  blocked?: boolean;
  verb?: "Certify" | "Issue";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"read" | "sign" | "done">("read");
  const timer = useRef(0);
  const reduced = usePrefersReducedMotion();
  const person = people.find((p) => p.name === holder);
  const named = person ? `${holder}, ${person.role}` : holder;
  const today = "15 Aug 2026";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.clearTimeout(timer.current);
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, [onCancel]);

  const seat = () => {
    if (blocked) return;
    setStep("done");
    timer.current = window.setTimeout(onConfirm, reduced ? 120 : 720);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4 text-paper">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="certify-title"
        className="w-full max-w-lg border border-white/15 bg-ink px-6 py-8 sm:px-10"
      >
        <p className="label-track text-ice">{verb === "Issue" ? "Issue onto the record" : "Named certification"}</p>
        <h2 id="certify-title" className="mt-3 font-serif text-3xl leading-tight">
          {title}
        </h2>
        <p className="mt-4 text-body text-paper/70">
          This plate names {holder}. Off-record confirmation is not a decision. A comment cannot{" "}
          {verb === "Issue" ? "issue" : "certify"}.
        </p>
        <dl className="mt-6 space-y-2 border-y border-white/10 py-4 font-mono text-body-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Named person</dt>
            <dd>{named}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Record</dt>
            <dd>{project.code}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Certified construction</dt>
            <dd>{gbp(project.certainty)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Date</dt>
            <dd className="tabular-nums">{today}</dd>
          </div>
        </dl>

        <div className="signature-plate mt-6">
          {step === "done" ? (
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-serif text-2xl leading-none">{holder}</p>
                <p className="mt-2 font-mono text-micro text-paper/45">{today} · {project.code}</p>
              </div>
              <Stamp kind="certified" invert press />
            </div>
          ) : (
            <div>
              <p className="label-track text-paper/35">Signature</p>
              <p className="mt-3 border-b border-dashed border-white/20 pb-2 font-serif text-2xl text-paper/25">
                {holder}
              </p>
            </div>
          )}
        </div>

        {blocked && (
          <div className="mt-6">
            <p className="border border-dashed border-white/20 bg-white/5 px-3 py-2 text-body-sm text-signal-hold">
              Draft AI cannot enter this plate.
            </p>
            <button type="button" onClick={onCancel} className="mt-4 px-4 py-2.5 text-body-sm text-paper/70">
              Withdraw
            </button>
          </div>
        )}

        {!blocked && step === "read" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("sign")}
              className="bg-paper px-4 py-2.5 text-body font-medium text-ink hover:bg-ice"
            >
              I have read this
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2.5 text-body text-paper/70">
              Cancel
            </button>
          </div>
        )}

        {!blocked && step === "sign" && (
          <div className="mt-6">
            <p className="text-body-sm text-paper/70">
              I {verb === "Issue" ? "issue" : "certify"} this as {named}.
            </p>
            <button
              type="button"
              onClick={seat}
              className="signature-press mt-4 w-full"
            >
              <span className="font-serif text-2xl leading-none">{holder}</span>
              <span className="label-track mt-2 block text-ink/50">Press to {verb.toLowerCase()}</span>
            </button>
            <button type="button" onClick={onCancel} className="mt-3 px-4 py-2.5 text-body text-paper/70">
              Withdraw
            </button>
          </div>
        )}

        {!blocked && step === "done" && (
          <p className="mt-6 font-serif text-xl text-ice">Named on the record.</p>
        )}
      </div>
    </div>
  );
}
