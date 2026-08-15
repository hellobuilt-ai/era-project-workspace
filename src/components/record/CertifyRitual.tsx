import { useEffect, useState } from "react";
import { project } from "@/lib/era/project";
import { gbp } from "@/lib/utils";

export function CertifyRitual({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"read" | "sign" | "done">("read");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4 text-paper">
      <div className="w-full max-w-lg border border-white/15 bg-ink px-6 py-8 sm:px-10">
        <p className="label-track text-ice">Certification</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight">{title}</h2>
        <p className="mt-4 text-[15px] text-paper/70">
          Off-record confirmation is not a decision. A comment cannot certify. This act names you.
        </p>
        <dl className="mt-6 space-y-2 border-y border-white/10 py-4 font-mono text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Certified construction</dt>
            <dd>{gbp(project.certainty)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-paper/50">Fee impact</dt>
            <dd>£0 · no variation</dd>
          </div>
        </dl>

        {step === "read" && (
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
        {step === "sign" && (
          <div className="mt-6">
            <p className="text-[13px] text-paper/70">
              I certify this as David Evans, Director, Project Management.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("done");
                  window.setTimeout(onConfirm, 700);
                }}
                className="bg-paper px-4 py-2.5 text-[13px] font-medium text-ink"
              >
                Certify
              </button>
              <button type="button" onClick={onCancel} className="px-4 py-2.5 text-[13px] text-paper/70">
                Withdraw
              </button>
            </div>
          </div>
        )}
        {step === "done" && (
          <p className="mt-6 font-serif text-xl text-ice">Recorded on the ledger.</p>
        )}
      </div>
    </div>
  );
}
