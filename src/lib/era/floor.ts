import type { StageId } from "./types";

export type FloorId = "l4" | "l5";
export type FloorLayer = "rooms" | "drawings" | "packages" | "time";

export type Room = {
  id: string;
  floor: FloorId;
  name: string;
  hint: string;
  drawing: string;
  drawingTitle: string;
  pkg: string;
  pkgTitle: string;
  weeks: number[];
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
    drawingTitle: "Reception · hospitality",
    pkg: "HV-FAR-PKG-06",
    pkgTitle: "Stone & hospitality finishes",
    weeks: [7, 8],
    to: "/design",
    area: "4 · south",
  },
  {
    id: "courts",
    floor: "l4",
    name: "Two courts of meeting",
    hint: "Client-facing. Acoustic isolation between the two.",
    drawing: "HV-FAR-DRW-001",
    drawingTitle: "GA · fourth floor",
    pkg: "HV-FAR-PKG-07",
    pkgTitle: "AV, acoustics & containment",
    weeks: [9],
    to: "/brief",
    area: "4 · east",
  },
  {
    id: "suite",
    floor: "l4",
    name: "Client suite",
    hint: "The partnership, received. West light on the stair.",
    drawing: "HV-FAR-DRW-001",
    drawingTitle: "GA · fourth floor",
    pkg: "HV-FAR-PKG-05",
    pkgTitle: "Joinery · partners & reception",
    weeks: [8, 10],
    to: "/design",
    area: "4 · west",
  },
  {
    id: "partners",
    floor: "l5",
    name: "Partners’ rooms",
    hint: "West light. The quality band is written for this edge.",
    drawing: "HV-FAR-DRW-004",
    drawingTitle: "Partners’ joinery",
    pkg: "HV-FAR-PKG-05",
    pkgTitle: "Joinery · partners & reception",
    weeks: [7, 8],
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
    drawingTitle: "GA · fifth floor",
    pkg: "HV-FAR-PKG-02",
    pkgTitle: "Partitions & drylining",
    weeks: [3, 4, 5, 6],
    to: "/brief",
    area: "5 · centre",
  },
  {
    id: "quiet",
    floor: "l5",
    name: "Quiet rooms",
    hint: "Acoustic privacy. The floor the brief is protecting.",
    drawing: "HV-FAR-DRW-002",
    drawingTitle: "GA · fifth floor",
    pkg: "HV-FAR-PKG-07",
    pkgTitle: "AV, acoustics & containment",
    weeks: [9, 11],
    to: "/stage/$stageId",
    params: { stageId: "brief" },
    area: "5 · east",
  },
];

export const floorMeta: Record<FloorId, { n: string; label: string; still: "floor" | "portrait" }> = {
  l4: { n: "04", label: "Fourth", still: "floor" },
  l5: { n: "05", label: "Fifth", still: "portrait" },
};

export const floorLayers: { id: FloorLayer; label: string }[] = [
  { id: "rooms", label: "Rooms" },
  { id: "drawings", label: "Drawings" },
  { id: "packages", label: "Packages" },
  { id: "time", label: "Time" },
];

export function roomTimeTone(room: Room, week: number | null) {
  if (week == null) return "ahead" as const;
  if (room.weeks.includes(week)) return "live" as const;
  if (room.weeks.some((w) => w < week)) return "passed" as const;
  return "ahead" as const;
}
