import type { Lens, StageId } from "./types";

export type NavItem = {
  to: string;
  label: string;
  short: string;
  lenses: Lens[];
};

export const navItems: NavItem[] = [
  { to: "/", label: "Record", short: "Re", lenses: ["era", "client", "guest"] },
  { to: "/brief", label: "Brief", short: "Br", lenses: ["era", "client"] },
  { to: "/lease", label: "Lease", short: "Le", lenses: ["era", "client"] },
  { to: "/design", label: "Design", short: "De", lenses: ["era", "client"] },
  { to: "/packages", label: "Packages", short: "Pk", lenses: ["era", "client"] },
  { to: "/programme", label: "Programme", short: "Pr", lenses: ["era", "client", "guest"] },
  { to: "/handover", label: "Handover", short: "Hd", lenses: ["era", "client"] },
  { to: "/fees", label: "Fees", short: "Fe", lenses: ["era", "client"] },
  { to: "/documents", label: "Evidence", short: "Ev", lenses: ["era", "client", "guest"] },
  { to: "/people", label: "People", short: "Pe", lenses: ["era", "client"] },
  { to: "/desk", label: "Draft desk", short: "Dr", lenses: ["era"] },
];

/** Instruments that belong to a stage chapter — the rest sit under Elsewhere. */
export const chapterOf: Record<StageId, string[]> = {
  lease: ["/lease", "/people"],
  strategic: ["/", "/fees", "/documents", "/people", "/desk"],
  brief: ["/brief", "/", "/documents"],
  design: ["/design", "/people", "/documents"],
  procure: ["/packages", "/fees", "/documents"],
  construct: ["/programme", "/documents"],
  handover: ["/handover", "/fees", "/documents"],
};

export const lensMeta: Record<
  Lens,
  { name: string; privilege: string; org: string; initials: string; expires?: string; whisper: string }
> = {
  era: {
    name: "David Evans",
    privilege: "ERA · Project Management",
    org: "Full record",
    initials: "DE",
    whisper: "Full record. You may certify.",
  },
  client: {
    name: "Amelia Croft",
    privilege: "Client sponsor",
    org: "Harrow & Vale LLP",
    initials: "AC",
    whisper: "This is your sentence — the quality band.",
  },
  guest: {
    name: "Saira Khan",
    privilege: "Licence pack only",
    org: "Pritchard Hale",
    initials: "SK",
    expires: "29 Aug 2026",
    whisper: "Licence pack only. Not a public link.",
  },
};
