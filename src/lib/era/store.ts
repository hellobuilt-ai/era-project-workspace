import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lens, StageId } from "./types";
import { decisions as seedDecisions } from "./project";
import type { Decision } from "./types";
import { QUALITY_ID, STAGE_ORDER, adjacentStages, stageIndex } from "./stages";

export type StagePassage = {
  from: StageId;
  to: StageId;
};

type EraState = {
  lens: Lens;
  setLens: (lens: Lens) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  decisions: Decision[];
  certify: (id: string, by: string) => void;
  addDecision: (d: Decision) => void;
  selectedDoc: string | null;
  setSelectedDoc: (id: string | null) => void;
  currentStage: StageId;
  issued: Partial<Record<StageId, boolean>>;
  constructWeek: number | null;
  thriveIssued: boolean;
  passage: StagePassage | null;
  focusDecision: string | null;
  setFocusDecision: (id: string | null) => void;
  issueStage: (id: StageId) => boolean;
  completeWeek: (id: number) => boolean;
  issueThrive: () => boolean;
  replayFrom: (id: StageId) => void;
  clearPassage: () => void;
  resetSequence: () => void;
};

const INITIAL_ISSUED: Partial<Record<StageId, boolean>> = { lease: true };

function seedFor(id: StageId): Pick<
  EraState,
  "decisions" | "currentStage" | "issued" | "constructWeek" | "thriveIssued" | "passage" | "focusDecision"
> {
  const i = stageIndex(id);
  const qualityDone = i > stageIndex("strategic");
  const issued: Partial<Record<StageId, boolean>> = {};
  for (const sid of STAGE_ORDER) {
    if (stageIndex(sid) < i) issued[sid] = true;
  }
  return {
    decisions: seedDecisions.map((d) =>
      d.id === QUALITY_ID && qualityDone
        ? { ...d, status: "certified" as const, certifiedBy: "Amelia Croft" }
        : { ...d },
    ),
    currentStage: id,
    issued,
    constructWeek: id === "construct" ? 1 : null,
    thriveIssued: false,
    passage: null,
    focusDecision: null,
  };
}

export const useEra = create<EraState>()(
  persist(
    (set, get) => ({
      lens: "era",
      setLens: (lens) => set({ lens }),
      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      decisions: seedDecisions,
      certify: (id, by) =>
        set((s) => {
          const decisions = s.decisions.map((d) =>
            d.id === id ? { ...d, status: "certified" as const, certifiedBy: by, aiDraft: false } : d,
          );
          if (id === QUALITY_ID && s.currentStage === "strategic") {
            return {
              decisions,
              currentStage: "brief" as StageId,
              issued: { ...s.issued, strategic: true },
              passage: { from: "strategic", to: "brief" },
              focusDecision: null,
            };
          }
          return { decisions, focusDecision: null };
        }),
      addDecision: (d) => set((s) => ({ decisions: [d, ...s.decisions] })),
      selectedDoc: null,
      setSelectedDoc: (selectedDoc) => set({ selectedDoc }),
      currentStage: "strategic",
      issued: INITIAL_ISSUED,
      constructWeek: null,
      thriveIssued: false,
      passage: null,
      focusDecision: null,
      setFocusDecision: (focusDecision) => set({ focusDecision }),
      issueStage: (id) => {
        const s = get();
        if (s.currentStage !== id) return false;
        if (id === "strategic") return false;
        if (s.issued[id]) return false;
        if (id === "brief") {
          const quality = s.decisions.find((d) => d.id === QUALITY_ID);
          if (quality?.status !== "certified") return false;
        }
        if (id === "construct" && s.constructWeek !== 14) return false;
        const constructWeek = id === "procure" ? 1 : id === "construct" ? null : s.constructWeek;
        const next = adjacentStages(id).next;
        if (!next || id === "handover") {
          set({ issued: { ...s.issued, [id]: true }, constructWeek });
          return true;
        }
        set({
          issued: { ...s.issued, [id]: true },
          currentStage: next.id,
          passage: { from: id, to: next.id },
          constructWeek,
        });
        return true;
      },
      completeWeek: (id) => {
        const s = get();
        if (s.currentStage !== "construct" || s.constructWeek !== id || id === 14) return false;
        set({ constructWeek: id + 1 });
        return true;
      },
      issueThrive: () => {
        const s = get();
        if (s.currentStage !== "handover") return false;
        set({ thriveIssued: true });
        return true;
      },
      replayFrom: (id) => set(seedFor(id)),
      clearPassage: () => set({ passage: null }),
      resetSequence: () => get().replayFrom("strategic"),
    }),
    {
      name: "era-record-v3",
      partialize: (s) => ({
        lens: s.lens,
        currentStage: s.currentStage,
        decisions: s.decisions,
        issued: s.issued,
        constructWeek: s.constructWeek,
        thriveIssued: s.thriveIssued,
      }),
    },
  ),
);
