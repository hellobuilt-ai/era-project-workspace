import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lens } from "./types";
import { decisions as seedDecisions } from "./project";
import type { Decision } from "./types";

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
};

export const useEra = create<EraState>()(
  persist(
    (set) => ({
      lens: "era",
      setLens: (lens) => set({ lens }),
      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      decisions: seedDecisions,
      certify: (id, by) =>
        set((s) => ({
          decisions: s.decisions.map((d) =>
            d.id === id ? { ...d, status: "certified", certifiedBy: by, aiDraft: false } : d,
          ),
        })),
      addDecision: (d) => set((s) => ({ decisions: [d, ...s.decisions] })),
      selectedDoc: null,
      setSelectedDoc: (selectedDoc) => set({ selectedDoc }),
    }),
    { name: "era-record-lens", partialize: (s) => ({ lens: s.lens }) },
  ),
);
