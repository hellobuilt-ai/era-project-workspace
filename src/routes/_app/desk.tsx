import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useEra } from "@/lib/era/store";
import { project } from "@/lib/era/project";
import { gbp } from "@/lib/utils";

export const Route = createFileRoute("/_app/desk")({ component: DeskPage });

const drafts: Record<string, string> = {
  licence: `Landlord licence — draft index (unsigned)

Prepared for Harrow & Vale LLP, 14 Saffron Hill, from the issued strategic brief and the existing schedule of condition.

1. Covering letter to Pritchard Hale, naming David Evans as the only certifying principal.
2. Drawings pack: existing, proposed CAT B, MEP risers.
3. Method statement for out-of-hours strip-out on weeks 01–02.
4. Acoustic note for the two courts of meeting.
5. Proposed licence conditions — hours, hoarding, protection of the common stair.

This index was assembled by draft AI. It has no standing. It cannot be issued to Saira Khan until David Evans opens, edits, and certifies it.

Fee named: ${gbp(6500)} · HV-FEE-003 · still draft.`,
  fee: `Fee narrative — post-handover thrive (unsigned)

Twelve weeks after practical completion. Monthly cost and programme review. Snag close. No new design instruction without a ledger entry.

Proposed named fee: ${gbp(6812)} to David Evans. Optional. Not certified. Not visible to the landlord solicitor.`,
};

function DeskPage() {
  const { lens, addDecision } = useEra();
  const [kind, setKind] = useState<"licence" | "fee">("licence");
  const [text, setText] = useState(drafts.licence);
  const [claimed, setClaimed] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const dirty = useMemo(() => claimed && text !== drafts[kind], [claimed, text, kind]);

  if (lens !== "era") return <Navigate to="/" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <p className="label-track text-signal-hold">Draft desk · ERA only</p>
      <h1 className="mt-2 font-display text-[length:var(--text-display-lg)]">A draughtsman, never a signatory</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
        The model drafts. David Evans or Henry Geldenhuys certifies. A draft has no standing. The client never
        meets this room.
      </p>

      <div className="mt-6 flex gap-2">
        {(
          [
            ["licence", "Licence pack index"],
            ["fee", "Thrive fee narrative"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setText(drafts[k]);
              setClaimed(false);
              setNote(null);
            }}
            className={
              kind === k
                ? "bg-ink px-3 py-2 text-[13px] text-paper"
                : "border border-rule px-3 py-2 text-[13px] text-ink"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="hatch mt-6 border border-dashed border-rule bg-draft-wash p-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          className="w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-relaxed text-ink outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!claimed ? (
          <button
            type="button"
            onClick={() => setClaimed(true)}
            className="bg-ink px-4 py-2.5 text-[13px] font-medium text-paper"
          >
            I have opened this as David Evans
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              addDecision({
                id: `d-${Date.now()}`,
                title: kind === "licence" ? "Landlord licence pack — claimed draft" : "Thrive retainer — claimed draft",
                body: text.slice(0, 280),
                status: "open",
                feeNamed: kind === "licence" ? "£6,500" : "£6,812",
                namedBy: "David Evans",
                certifiedBy: null,
                at: "15 Aug 2026",
                aiDraft: false,
              });
              setNote("Promoted to the ledger as uncertified. Certify lives on the record, not here.");
            }}
            className="bg-ink px-4 py-2.5 text-[13px] font-medium text-paper"
          >
            Promote to the ledger
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            setNote(
              "Refused. The model cannot certify. Certify is disabled until a named principal opens and accepts the draft.",
            )
          }
          className="border border-rule px-4 py-2.5 text-[13px] text-muted line-through decoration-signal-risk"
        >
          Certify (unavailable)
        </button>
      </div>
      <p className="mt-3 text-[12px] text-muted">
        {claimed
          ? dirty
            ? "Claimed and edited. Eligible to promote."
            : "Claimed, not yet edited. Promote is allowed; certify still lives on the ledger."
          : "Author-empty. Certify structurally absent."}
      </p>
      {note && (
        <p className="mt-4 border border-rule bg-paper px-4 py-3 text-[14px] text-ink">{note}</p>
      )}
      <p className="mt-8 text-[12px] text-muted">
        Retrieval is this record only — {project.name}. Never the open web. Never another client.
      </p>
    </div>
  );
}
