export type Lens = "era" | "client" | "guest";

export type Stamp = "draft" | "issued" | "certified" | "superseded" | "internal";

export type StageId =
  | "lease"
  | "strategic"
  | "brief"
  | "design"
  | "procure"
  | "construct"
  | "handover";

export type Person = {
  id: string;
  name: string;
  role: string;
  org: string;
  lens: Lens | "restricted";
  initials: string;
};

export type Decision = {
  id: string;
  title: string;
  body: string;
  status: "open" | "countered" | "certified" | "declined";
  feeNamed: string | null;
  namedBy: string;
  certifiedBy: string | null;
  at: string;
  aiDraft: boolean;
};

export type Document = {
  id: string;
  title: string;
  kind: string;
  rev: string;
  stamp: Stamp;
  pages: number;
  updated: string;
  owner: string;
  summary: string;
};

export type FeeLine = {
  id: string;
  item: string;
  basis: string;
  amount: number;
  status: Stamp;
  namedTo: string;
};

export type Week = {
  id: number;
  label: string;
  phase: string;
  note: string;
  status: "done" | "live" | "next" | "later";
};

export type Drawing = {
  id: string;
  code: string;
  title: string;
  kind: "General arrangement" | "Interior" | "Joinery" | "Services";
  rev: string;
  author: string;
  studio: string;
  floor: string | null;
  note: string;
};

export type Package = {
  id: string;
  code: string;
  title: string;
  amount: number;
  contractor: string;
  trade: string;
};

export type Risk = {
  id: string;
  title: string;
  severity: "watch" | "hold" | "risk";
  owner: string;
  note: string;
};
