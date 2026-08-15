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
  onConfirm,
  onCancel,
}: {
  title: string;
  holder: string;
  blocked?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"read" | "sign" | "done">("read");
  const timer = useRef(0);
  const reduced = usePrefersReducedMotion();
  const person = people.find((p) => p.name === holder);
  const named = person ? `${holder}, ${person.role}` : holder;

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
    timer.current = window.setTimeout(onConfirm, reduced ? 120 : 560);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4 text-paper">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="certify-title"
        className="w-full max-w-lg border border-white/15 bg-ink px-6 py-8 sm:px-10"
      >
        <p className="label-track text-ice">Certification</p>
        <h2 id="certify-title" className="mt-3 font-serif text-3xl leading-tight">
          {title}
        </h2>
        <p className="mt-4 text-[15px] text-paper/70">
          This plate names {holder}. Off-record confirmation is not a decision. A comment cannot
          certify.
        </p>
        <dl className="mt-6 space-y-2 border-y border-white/10 py-4 font-mono text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Lens holder</dt>
            <dd>{holder}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Certified construction</dt>
            <dd>{gbp(project.certainty)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Fee impact</dt>
            <dd>£0 · no variation</dd>
          </div>
        </dl>

        <div className="mt-6 grid h-[4.5rem] w-40 place-items-center border border-dashed border-white/20">
          {step === "done" ? (
            <Stamp kind="certified" invert press />
          ) : (
            <span className="label-track text-paper/35">Awaiting press</span>
          )}
        </div>

        {blocked && (
          <div className="mt-6">
            <p className="border border-dashed border-white/20 bg-white/5 px-3 py-2 text-[13px] text-signal-hold">
              Draft AI cannot enter this plate.
            </p>
            <button type="button" onClick={onCancel} className="mt-4 px-4 py-2.5 text-[13px] text-paper/70">
              Withdraw
            </button>
          </div>
        )}

        {!blocked && step === "read" && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("sign")}
              className="bg-paper px-4 py-2.5 text-[13px] font-medium text-ink"
            >
              I have read this
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2.5 text-[13px] text-paper/70">
              Cancel
            </button>
          </div>
        )}

        {!blocked && step === "sign" && (
          <div className="mt-6">
            <p className="text-[13px] text-paper/70">I certify this as {named}.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={seat}
                className="bg-paper px-4 py-2.5 text-[13px] font-medium text-ink transition-transform duration-150 active:scale-[0.97]"
              >
                Certify
              </button>
              <button type="button" onClick={onCancel} className="px-4 py-2.5 text-[13px] text-paper/70">
                Withdraw
              </button>
            </div>
          </div>
        )}

        {!blocked && step === "done" && (
          <p className="mt-6 font-serif text-xl text-ice">Recorded on the ledger.</p>
        )}
      </div>
    </div>
  );
}
