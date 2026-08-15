import type { StageId } from "./types";

export type FloorId = "l4" | "l5";

export type Room = {
  id: string;
  floor: FloorId;
  name: string;
  hint: string;
  drawing: string;
  to: string;
  hash?: string;
  params?: { stageId: StageId };
  area: string;
};

export const rooms: Room[] = [
  {
    id: "hospitality",
    floor: "l4",
    name: "Hospitality reception",
    hint: "Forty-cover supper. Timber and stone — not a lobby.",
    drawing: "HV-FAR-DRW-003",
    to: "/design",
    area: "4 · south",
  },
  {
    id: "courts",
    floor: "l4",
    name: "Two courts of meeting",
    hint: "Client-facing. Acoustic isolation between the two.",
    drawing: "HV-FAR-DRW-001",
    to: "/brief",
    area: "4 · east",
  },
  {
    id: "suite",
    floor: "l4",
    name: "Client suite",
    hint: "The partnership, received. West light on the stair.",
    drawing: "HV-FAR-DRW-001",
    to: "/design",
    area: "4 · west",
  },
  {
    id: "partners",
    floor: "l5",
    name: "Partners’ rooms",
    hint: "West light. The quality band is written for this edge.",
    drawing: "HV-FAR-DRW-004",
    to: "/",
    hash: "decision-d3",
    area: "5 · west",
  },
  {
    id: "knowledge",
    floor: "l5",
    name: "Knowledge work",
    hint: "Quiet floor. Not open plan. No client traffic.",
    drawing: "HV-FAR-DRW-002",
    to: "/brief",
    area: "5 · centre",
  },
  {
    id: "quiet",
    floor: "l5",
    name: "Quiet rooms",
    hint: "Acoustic privacy. The floor the brief is protecting.",
    drawing: "HV-FAR-DRW-002",
    to: "/stage/$stageId",
    params: { stageId: "brief" },
    area: "5 · east",
  },
];

export const floorMeta: Record<FloorId, { n: string; label: string; still: "floor" | "portrait" }> = {
  l4: { n: "04", label: "Fourth", still: "floor" },
  l5: { n: "05", label: "Fifth", still: "portrait" },
};
