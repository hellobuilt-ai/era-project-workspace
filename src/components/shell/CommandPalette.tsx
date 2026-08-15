import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useEra } from "@/lib/era/store";
import { decisions, documents, fees, project } from "@/lib/era/project";
import { navItems } from "@/lib/era/nav";
import { stageList, stageTone, toneLabel } from "@/lib/era/stages";
import { cn, gbp } from "@/lib/utils";
import { rooms } from "@/lib/era/floor";
import { useStageProgress } from "@/lib/era/progress";

type DeskGroup = "Needs you" | "Stage" | "Floor" | "Record" | "Fees" | "Evidence";

type DeskItem = {
  id: string;
  label: string;
  hint: string;
  to: string;
  params?: { stageId: string };
  hash?: string;
  group: DeskGroup;
};

const GROUP_ORDER: DeskGroup[] = ["Needs you", "Stage", "Floor", "Record", "Fees", "Evidence"];

export function CommandPalette() {
  const { commandOpen, setCommandOpen, lens, decisions: liveDecisions } = useEra();
  const { currentStage, resetSequence, replayFrom, setFocusDecision } = useStageProgress();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);
  const ledger = liveDecisions.length ? liveDecisions : decisions;

  const items = useMemo(() => {
    const open = ledger.filter((d) => d.status === "open" || d.status === "countered");
    const certified = ledger.filter((d) => d.status === "certified");
    const visibleDocs = documents.filter((d) =>
      lens === "guest" ? d.id === "doc4" || d.kind === "Legal" : lens === "client" ? d.stamp !== "internal" : true,
    );
    const visibleFees = lens === "guest" ? [] : fees;
    const pages = navItems.filter((n) => n.lenses.includes(lens));

    const desk: DeskItem[] = [];

    if (open.length) {
      desk.push({
        id: "need",
        label: "What needs you",
        hint: `${open.length} open`,
        to: "/",
        group: "Needs you",
      });
      for (const d of open) {
        desk.push({
          id: d.id,
          label: d.title,
          hint: d.id === "d3" ? "Closes 01 · opens 02" : d.aiDraft ? "Draft · not certified" : "Needs a named person",
          to: "/",
          group: "Needs you",
        });
      }
    }

    for (const s of stageList) {
      const tone = stageTone(s.id, currentStage);
      desk.push({
        id: `stage-${s.id}`,
        label: `${s.n} ${s.label}`,
        hint: toneLabel(tone),
        to: "/stage/$stageId",
        params: { stageId: s.id },
        group: "Stage",
      });
    }

    if (lens !== "guest") {
      desk.push({
        id: "replay-lease",
        label: "Replay from 00 Lease",
        hint: "Open the executed instrument",
        to: "/lease",
        group: "Stage",
      });
      desk.push({
        id: "reset-sequence",
        label: "Replay from 01 Strategic",
        hint: "Reset the sequence",
        to: "/",
        group: "Stage",
      });
      desk.push({
        id: "walk-floor",
        label: "Walk the floor",
        hint: "14 Saffron Hill",
        to: "/",
        hash: "floor",
        group: "Floor",
      });
      for (const room of rooms) {
        desk.push({
          id: `room-${room.id}`,
          label: room.name,
          hint: room.drawing,
          to: room.to,
          params: room.params,
          hash: room.hash,
          group: "Floor",
        });
      }
    }

    desk.push({
      id: "cost",
      label: `Cost certainty ${gbp(project.certainty)}`,
      hint: "Henry Geldenhuys",
      to: "/",
      group: "Record",
    });

    for (const n of pages) {
      if (n.to === "/fees") {
        desk.push({ id: n.to, label: n.label, hint: "Named fees", to: n.to, group: "Fees" });
      } else if (n.to === "/documents") {
        desk.push({ id: n.to, label: n.label, hint: "Issued record", to: n.to, group: "Evidence" });
      } else {
        desk.push({ id: n.to, label: n.label, hint: "Open", to: n.to, group: "Record" });
      }
    }

    for (const d of certified) {
      desk.push({
        id: `certified-${d.id}`,
        label: d.title,
        hint: "Certified",
        to: "/",
        group: "Record",
      });
    }

    for (const f of visibleFees) {
      desk.push({
        id: f.id,
        label: f.item,
        hint: gbp(f.amount),
        to: "/fees",
        group: "Fees",
      });
    }

    for (const d of visibleDocs) {
      desk.push({
        id: d.id,
        label: d.title,
        hint: d.kind,
        to: "/documents",
        group: "Evidence",
      });
    }

    const query = q.trim().toLowerCase();
    if (!query) return desk;
    return desk.filter(
      (i) =>
        i.label.toLowerCase().includes(query) ||
        i.hint.toLowerCase().includes(query) ||
        i.group.toLowerCase().includes(query),
    );
  }, [q, lens, ledger, currentStage]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        items: items.filter((i) => i.group === group),
      })).filter((g) => g.items.length > 0),
    [items],
  );

  useEffect(() => {
    setSel(0);
  }, [q, commandOpen]);

  useEffect(() => {
    if (!items.length) return;
    setSel((i) => Math.min(i, items.length - 1));
  }, [items.length]);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (!commandOpen) return null;

  function close() {
    setCommandOpen(false);
    setQ("");
    setSel(0);
  }

  function go(item: DeskItem) {
    if (item.id === "replay-lease") {
      replayFrom("lease");
      void navigate({ to: "/lease" });
      close();
      return;
    }
    if (item.id === "reset-sequence") {
      resetSequence();
      void navigate({ to: "/" });
      close();
      return;
    }
    if (item.id === "d3" || item.hash === "decision-d3") {
      setFocusDecision("d3");
    }
    if (item.params) {
      void navigate({ to: item.to, params: item.params });
    } else {
      void navigate({ to: item.to, hash: item.hash });
    }
    close();
  }

  function onKey(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setSel(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSel(items.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[sel];
      if (item) go(item);
    }
  }

  let running = -1;

  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-[rgb(11_31_51_/_0.46)]" aria-label="Close" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="The desk"
        onKeyDown={onKey}
        className="relative mx-auto mt-[12vh] w-[min(92vw,520px)] border border-rule bg-paper shadow-[var(--shadow-float)]"
      >
        <div className="border-b border-rule px-4 py-3">
          <p className="label-track text-muted">The desk</p>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Stage, decision, fee, evidence"
            role="combobox"
            aria-expanded
            aria-controls="desk-results"
            aria-activedescendant={items[sel] ? `desk-${items[sel].id}` : undefined}
            className="mt-2 w-full bg-transparent font-serif text-xl text-ink outline-none placeholder:text-muted/60"
          />
        </div>
        <ul id="desk-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
          {grouped.map((block) => (
            <li key={block.group} className="list-none">
              <p className="label-track px-4 pb-1 pt-3 text-petrol">{block.group}</p>
              <ul>
                {block.items.map((item) => {
                  running += 1;
                  const index = running;
                  const active = index === sel;
                  return (
                    <li key={item.id}>
                      <button
                        id={`desk-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-active={active ? "true" : "false"}
                        className={cn(
                          "flex w-full items-baseline justify-between gap-4 border-l-2 px-4 py-2.5 text-left",
                          active
                            ? "border-ice bg-[rgb(11_31_51_/_0.04)]"
                            : "border-transparent hover:bg-[rgb(11_31_51_/_0.04)]",
                        )}
                        onMouseEnter={() => setSel(index)}
                        onClick={() => go(item)}
                      >
                        <span className="text-[15px]">{item.label}</span>
                        <span className="font-mono text-[11px] text-muted">{item.hint}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">Nothing on this record matches.</li>
          )}
        </ul>
        <p className="border-t border-rule px-4 py-2 text-[11px] text-muted">
          Arrow keys move. Enter opens. Escape closes. A key never certifies.
        </p>
      </div>
    </div>
  );
}
