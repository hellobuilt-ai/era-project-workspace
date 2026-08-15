import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useEra } from "@/lib/era/store";
import { decisions, documents, fees, project } from "@/lib/era/project";
import { navItems } from "@/lib/era/nav";
import { gbp } from "@/lib/utils";

export function CommandPalette() {
  const { commandOpen, setCommandOpen, lens } = useEra();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const items = useMemo(() => {
    const pages = navItems
      .filter((n) => n.lenses.includes(lens))
      .map((n) => ({ id: n.to, label: n.label, hint: "Open", to: n.to }));
    const decs = decisions.map((d) => ({
      id: d.id,
      label: d.title,
      hint: d.status === "open" || d.status === "countered" ? "Needs a named person" : "Certified",
      to: "/",
    }));
    const docs = documents
      .filter((d) => (lens === "guest" ? d.id === "doc4" || d.kind === "Legal" : lens === "client" ? d.stamp !== "internal" : true))
      .map((d) => ({ id: d.id, label: d.title, hint: d.kind, to: "/documents" }));
    const feeItems =
      lens === "guest"
        ? []
        : fees.map((f) => ({ id: f.id, label: f.item, hint: gbp(f.amount), to: "/fees" }));
    const all = [
      { id: "need", label: "What needs you", hint: "Open decisions", to: "/" },
      { id: "cost", label: `Cost certainty ${gbp(project.certainty)}`, hint: "Henry Geldenhuys", to: "/" },
      ...pages,
      ...decs,
      ...feeItems,
      ...docs,
    ];
    const query = q.trim().toLowerCase();
    if (!query) return all.slice(0, 8);
    return all.filter((i) => i.label.toLowerCase().includes(query) || i.hint.toLowerCase().includes(query));
  }, [q, lens]);

  if (!commandOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-[rgb(11_31_51_/_0.46)]"
        aria-label="Close"
        onClick={() => setCommandOpen(false)}
      />
      <div className="relative mx-auto mt-[12vh] w-[min(92vw,520px)] border border-rule bg-paper shadow-[var(--shadow-float)]">
        <div className="border-b border-rule px-4 py-3">
          <p className="label-track text-muted">What needs you</p>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Decision, fee, person, evidence…"
            className="mt-2 w-full bg-transparent font-serif text-xl text-ink outline-none placeholder:text-muted/60"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left hover:bg-[rgb(11_31_51_/_0.04)]"
                onClick={() => {
                  void navigate({ to: item.to });
                  setCommandOpen(false);
                  setQ("");
                }}
              >
                <span className="text-[15px]">{item.label}</span>
                <span className="font-mono text-[11px] text-muted">{item.hint}</span>
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">Nothing on this record matches.</li>
          )}
        </ul>
        <p className="border-t border-rule px-4 py-2 text-[11px] text-muted">
          A key never certifies. Named people certify.
        </p>
      </div>
    </div>
  );
}
