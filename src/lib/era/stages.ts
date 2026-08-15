import type { Lens, StageId, Week } from "./types";
import { project } from "./project";
import { stills } from "./stills";

export type StageTone = "passed" | "live" | "next" | "ahead";

export type StageWork = {
  label: string;
  hint: string;
  to: string;
};

export type StageDef = {
  id: StageId;
  n: string;
  label: string;
  title: string;
  dek: string;
  still: string;
  period: string;
  gate: string;
  outcome: string;
  work: StageWork[];
  beats: { k: string; v: string }[];
  workPath: string;
  closeLabel: string;
  issueLabel: string;
};

export const QUALITY_ID = "d3";

export const STAGE_ORDER: StageId[] = [
  "lease",
  "strategic",
  "brief",
  "design",
  "procure",
  "construct",
  "handover",
];

export const stageBook: Record<StageId, StageDef> = {
  lease: {
    id: "lease",
    n: "00",
    label: "Lease",
    title: "The floor is named.",
    dek: "14 Saffron Hill is held. Occupation from 1 October. The record opens on a named address, not a search.",
    still: stills.cdn.night,
    period: "Closed · July 2026",
    gate: "Lease executed. No further sentence required.",
    outcome: "Address, area and occupation date locked. Strategic definition could open.",
    workPath: "/lease",
    closeLabel: "Confirm execution",
    issueLabel: "Confirm execution — open 01",
    work: [
      { label: "Executed instrument", hint: "The floor is named", to: "/lease" },
      { label: "Named occupiers", hint: "Amelia Croft · James Lang", to: "/people" },
    ],
    beats: [
      { k: "Address", v: project.address },
      { k: "Area", v: `${project.areaSqft.toLocaleString("en-GB")} sq ft` },
      { k: "Occupation", v: "1 Oct 2026" },
    ],
  },
  strategic: {
    id: "strategic",
    n: "01",
    label: "Strategic",
    title: "The RFP lives here.",
    dek: "Strategic definition is live. Cost is certified. Fees are named. One decision still holds the gate — the quality band on the partners’ floor.",
    still: stills.cdn.wide,
    period: "Live · RFP close",
    gate: "Certify the Cat B quality band. That single sentence closes 01 and makes 02 Brief the live stage.",
    outcome: "Certainty held at £4.125m. Procurement route certified. Quality still open.",
    workPath: "/",
    closeLabel: "Certify the quality band",
    issueLabel: "Close 01 Strategic",
    work: [
      { label: "Certify the quality band", hint: "This is the door to 02", to: "/" },
      { label: "Named fees", hint: "PM + cost", to: "/fees" },
      { label: "Read the brief being drawn", hint: "02 is already open to read", to: "/brief" },
    ],
    beats: [
      { k: "Certainty", v: "£4,125,000" },
      { k: "Contract", v: project.contract },
      { k: "Holding the gate", v: "Quality band" },
    ],
  },
  brief: {
    id: "brief",
    n: "02",
    label: "Brief",
    title: "Four tensions. One brief.",
    dek: "Space, budget, programme, quality. Three are agreed. Quality is the open sentence. You may work 02 while 01 is live — you cannot issue it until 01 closes.",
    still: stills.cdn.floor,
    period: "Opening · drawn during 01",
    gate: "Issue the brief only after the quality band is certified. Design will not open on an unsigned band.",
    outcome: "The brief is the RFP. Not a PDF that outranks the record.",
    workPath: "/brief",
    closeLabel: "Issue the brief",
    issueLabel: "Issue 02 — open 03 Design",
    work: [
      { label: "Open the four tensions", hint: "Space · budget · time · quality", to: "/brief" },
      { label: "Certify quality", hint: "The last open sentence", to: "/" },
    ],
    beats: [
      { k: "Space", v: "Agreed" },
      { k: "Budget", v: "Agreed" },
      { k: "Programme", v: "Agreed" },
      { k: "Quality", v: "Open" },
    ],
  },
  design: {
    id: "design",
    n: "03",
    label: "Design",
    title: "Authorship, not a package.",
    dek: "JCT Traditional was chosen so the partners’ floor stays authored. Design opens only when the brief has been issued.",
    still: stills.cdn.portrait,
    period: "Ahead · not opened",
    gate: "Requires 02 issued. Studio North then takes the floor.",
    outcome: "Drawings will enter the record as issued revisions — never as a side deck.",
    workPath: "/design",
    closeLabel: "Issue first drawings",
    issueLabel: "Issue 03 — open 04 Procure",
    work: [
      { label: "Drawings register", hint: "Five sheets", to: "/design" },
      { label: "Design lead", hint: "Marcus Teale", to: "/people" },
    ],
    beats: [
      { k: "Route", v: "JCT Traditional" },
      { k: "Author", v: "Studio North" },
      { k: "Opens after", v: "02 Brief" },
    ],
  },
  procure: {
    id: "procure",
    n: "04",
    label: "Procure",
    title: "Named packages. Named prices.",
    dek: "Procurement is a later instrument. Nothing is tendered until design can be priced against the certified ceiling.",
    still: stills.cdn.meet,
    period: "Ahead · not opened",
    gate: "Requires 03 Design issued far enough to price. Ceiling remains £4.125m.",
    outcome: "Each package will be a row. Variations will be new rows.",
    workPath: "/packages",
    closeLabel: "Award the packages",
    issueLabel: "Award 04 — open 05 Construct",
    work: [
      { label: "Named packages", hint: "Nine packages", to: "/packages" },
      { label: "The ceiling", hint: "How construction is held", to: "/fees" },
    ],
    beats: [
      { k: "Ceiling", v: "£4,125,000" },
      { k: "Contingency", v: "£185,000 held" },
      { k: "Opens after", v: "03 Design" },
    ],
  },
  construct: {
    id: "construct",
    n: "05",
    label: "Construct",
    title: "Fourteen weeks. After the RFP.",
    dek: "On site 12 October. The bar is proposed, not live. Time is not drag-resized. This stage opens when packages are awarded.",
    still: stills.cdn.meet,
    period: "Proposed · not yet on site",
    gate: "Requires 04 packages awarded. Occupation of the lease is 1 October; site starts 12 October.",
    outcome: "Strip-out to practical completion in fourteen weeks.",
    workPath: "/programme",
    closeLabel: "Certify practical completion",
    issueLabel: "Certify PC — open 06 Handover",
    work: [
      { label: "Walk the fourteen weeks", hint: "Fourteen weeks on site", to: "/programme" },
      { label: "Stone lead time", hint: "On the number", to: "/" },
    ],
    beats: [
      { k: "On site", v: project.onSite },
      { k: "Completion", v: project.handover },
      { k: "Weeks", v: "14" },
    ],
  },
  handover: {
    id: "handover",
    n: "06",
    label: "Handover",
    title: "Soft landing. Then thrive.",
    dek: "Practical completion on 18 January. Staff return from week 13. A twelve-week thrive retainer sits as a draft fee — optional, not assumed.",
    still: stills.cdn.night,
    period: "Ahead · after PC",
    gate: "Requires 05 at practical completion. Thrive is a separate named fee, not a silent extension.",
    outcome: "The record does not close on PC. It stays issued while the floor is occupied.",
    workPath: "/handover",
    closeLabel: "Keep the record issued",
    issueLabel: "The record stays issued",
    work: [
      { label: "Soft landing", hint: "Staff return · week 13", to: "/handover" },
      { label: "Thrive", hint: "Optional retainer", to: "/fees" },
    ],
    beats: [
      { k: "PC", v: project.handover },
      { k: "Thrive", v: "12 weeks · draft" },
      { k: "Opens after", v: "05 Construct" },
    ],
  },
};

export const stageList: StageDef[] = STAGE_ORDER.map((id) => stageBook[id]);

export function isStageId(value: string): value is StageId {
  return STAGE_ORDER.includes(value as StageId);
}

export function stageIndex(id: StageId) {
  return STAGE_ORDER.indexOf(id);
}

export function stageTone(id: StageId, live: StageId = project.stage): StageTone {
  const here = stageIndex(live);
  const i = stageIndex(id);
  if (i < here) return "passed";
  if (i === here) return "live";
  if (i === here + 1) return "next";
  return "ahead";
}

export function adjacentStages(id: StageId) {
  const i = stageIndex(id);
  return {
    prev: i > 0 ? stageBook[STAGE_ORDER[i - 1]] : null,
    next: i < STAGE_ORDER.length - 1 ? stageBook[STAGE_ORDER[i + 1]] : null,
  };
}

export function stageFromPath(pathname: string, live: StageId = project.stage): StageId {
  if (pathname.startsWith("/stage/")) {
    const raw = pathname.split("/")[2] ?? "";
    if (isStageId(raw)) return raw;
  }
  if (pathname.startsWith("/lease")) return "lease";
  if (pathname.startsWith("/brief")) return "brief";
  if (pathname.startsWith("/design")) return "design";
  if (pathname.startsWith("/packages")) return "procure";
  if (pathname.startsWith("/programme")) return "construct";
  if (pathname.startsWith("/handover")) return "handover";
  if (pathname.startsWith("/fees")) return "strategic";
  if (pathname.startsWith("/people")) return "strategic";
  if (pathname.startsWith("/documents")) return "strategic";
  if (pathname.startsWith("/desk")) return "strategic";
  return live;
}

export function toneLabel(tone: StageTone) {
  if (tone === "passed") return "Closed";
  if (tone === "live") return "Live";
  if (tone === "next") return "Next";
  return "Ahead";
}

export function canCertifyDecision(lens: Lens, aiDraft: boolean, decisionId: string, status: string) {
  if (aiDraft) return false;
  if (status === "certified" || status === "declined") return false;
  if (lens === "guest") return false;
  if (lens === "client") return decisionId === QUALITY_ID;
  return lens === "era";
}

export function canIssueStage(lens: Lens, stageId: StageId) {
  if (lens === "guest") return false;
  if (stageId === "lease" || stageId === "strategic" || stageId === "brief") {
    return lens === "era" || lens === "client";
  }
  return lens === "era";
}

export function weekStatus(
  id: number,
  currentStage: StageId,
  constructWeek: number | null,
  constructIssued: boolean,
): Week["status"] {
  if (constructIssued || stageIndex(currentStage) > stageIndex("construct")) {
    return "done";
  }
  if (currentStage !== "construct" || constructWeek == null) {
    return "later";
  }
  if (id < constructWeek) return "done";
  if (id === constructWeek) return "live";
  if (id === constructWeek + 1) return "next";
  return "later";
}

export function liveSubtitle(
  id: StageId,
  ctx: {
    qualityCertified: boolean;
    constructWeek: number | null;
    issuedHandover: boolean;
  },
): string {
  if (id === "lease") return "Live · awaiting confirmation";
  if (id === "strategic") {
    return ctx.qualityCertified
      ? "Closed · quality certified"
      : "Quality band holds the gate to 02";
  }
  if (id === "brief") {
    return ctx.qualityCertified
      ? "Ready to issue — that opens 03"
      : "Live · quality still holds the brief";
  }
  if (id === "design") return "Live · first drawings";
  if (id === "procure") return "Live · named packages";
  if (id === "construct") {
    const n = ctx.constructWeek ?? 1;
    return `Live · week ${String(n).padStart(2, "0")} of 14`;
  }
  if (id === "handover") {
    return ctx.issuedHandover ? "Issued · the record remains" : "Live · soft landing";
  }
  return "Live";
}
