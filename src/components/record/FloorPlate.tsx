import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  rooms,
  floorMeta,
  floorLayers,
  roomTimeTone,
  type FloorLayer,
  type Room,
} from "@/lib/era/floor";
import { useEra } from "@/lib/era/store";
import { useStageProgress } from "@/lib/era/progress";

export function FloorPlate({
  initialLayer = "rooms",
  compact,
}: {
  initialLayer?: FloorLayer;
  compact?: boolean;
}) {
  const [active, setActive] = useState<string>(initialLayer === "packages" ? "hospitality" : "partners");
  const [layer, setLayer] = useState<FloorLayer>(initialLayer);
  const setFocusDecision = useEra((s) => s.setFocusDecision);
  const { constructWeek, issued, currentStage } = useStageProgress();
  const room = rooms.find((r) => r.id === active) ?? rooms[0];
  const week = currentStage === "construct" ? constructWeek : issued.construct ? 14 : null;
  const drawingsIssued = Boolean(issued.design);
  const packagesAwarded = Boolean(issued.procure);

  return (
    <div className={cn("floor-plate", !compact && "mt-6")}>
      <div className="floor-layers" role="tablist" aria-label="Floor reading">
        {floorLayers.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={layer === l.id}
            onClick={() => setLayer(l.id)}
            className={cn("floor-layer", layer === l.id && "is-on")}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className={cn("mt-4 grid gap-6", compact ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_260px]")}>
        <div className="space-y-5">
          <FloorPlan
            floor="l5"
            active={active}
            layer={layer}
            week={week}
            onSelect={setActive}
          />
          <FloorPlan
            floor="l4"
            active={active}
            layer={layer}
            week={week}
            onSelect={setActive}
          />
        </div>
        {!compact && (
          <aside className="floor-legend">
            <p className="label-track text-petrol">{room.area}</p>
            <h3 className="mt-2 font-serif text-[length:var(--text-folio)] leading-snug">{room.name}</h3>
            <p className="mt-2 text-body leading-relaxed text-ink/75">{room.hint}</p>
            <dl className="mt-4 space-y-2 border-t border-hairline pt-3 font-mono text-micro">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Drawing</dt>
                <dd>{room.drawing}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Sheet</dt>
                <dd className="text-right">{room.drawingTitle}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Package</dt>
                <dd>{room.pkg}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Weeks</dt>
                <dd>{room.weeks.map((w) => String(w).padStart(2, "0")).join(" · ")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">State</dt>
                <dd>
                  {layer === "drawings"
                    ? drawingsIssued
                      ? "Issued"
                      : "Draft"
                    : layer === "packages"
                      ? packagesAwarded
                        ? "Awarded"
                        : "Named"
                      : layer === "time"
                        ? week
                          ? `Week ${String(week).padStart(2, "0")}`
                          : "Proposed"
                        : "Named"}
                </dd>
              </div>
            </dl>
            <RoomLink room={room} onAim={() => setFocusDecision("d3")} />
            <ol className="mt-6 space-y-1 border-t border-hairline pt-4">
              {rooms.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setActive(r.id)}
                    aria-pressed={r.id === active}
                    className={cn(
                      "flex min-h-11 w-full items-baseline justify-between gap-3 px-1 text-left transition-colors duration-[var(--motion-quick)]",
                      r.id === active ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    <span className="text-body">{layerLabel(r, layer)}</span>
                    <span className="font-mono text-micro">{floorMeta[r.floor].n}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>
    </div>
  );
}

function layerLabel(room: Room, layer: FloorLayer) {
  if (layer === "drawings") return room.drawing;
  if (layer === "packages") return room.pkg;
  if (layer === "time") return `W${room.weeks.map((w) => String(w).padStart(2, "0")).join("/")}`;
  return room.name;
}

function RoomLink({ room, onAim }: { room: Room; onAim: () => void }) {
  const className =
    "mt-5 inline-flex min-h-11 items-center bg-ink px-4 text-body font-medium text-paper transition-colors duration-[var(--motion-quick)] hover:bg-petrol";
  if (room.hash) {
    return (
      <Link
        to={room.to}
        hash={room.hash}
        onClick={() => {
          if (room.hash === "decision-d3") onAim();
        }}
        className={className}
      >
        Open the instrument →
      </Link>
    );
  }
  if (room.params) {
    return (
      <Link to="/stage/$stageId" params={room.params} className={className}>
        Open the instrument →
      </Link>
    );
  }
  return (
    <Link to={room.to} className={className}>
      Open the instrument →
    </Link>
  );
}

function FloorPlan({
  floor,
  active,
  layer,
  week,
  onSelect,
}: {
  floor: Room["floor"];
  active: string;
  layer: FloorLayer;
  week: number | null;
  onSelect: (id: string) => void;
}) {
  const meta = floorMeta[floor];
  return (
    <figure className="floor-sheet">
      <figcaption className="flex items-baseline justify-between px-3 pt-3">
        <span className="label-track text-petrol">
          {meta.n} {meta.label}
        </span>
        <span className="font-mono text-micro text-muted">14 Saffron Hill</span>
      </figcaption>
      <svg viewBox="0 0 640 280" role="img" aria-label={`${meta.label} floor plate`} className="mt-1 w-full">
        <defs>
          <pattern id={`pkg-hatch-${floor}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
            <line x1="0" y1="0" x2="0" y2="8" className="floor-hatch-line" />
          </pattern>
        </defs>
        <rect x="8" y="8" width="624" height="264" className="floor-wall" />
        {floor === "l5" ? (
          <>
            <RoomCell id="partners" x={8} y={8} w={214} h={264} active={active} layer={layer} week={week} onSelect={onSelect} />
            <RoomCell id="knowledge" x={222} y={8} w={200} h={264} active={active} layer={layer} week={week} onSelect={onSelect} />
            <RoomCell id="quiet" x={422} y={8} w={210} h={264} active={active} layer={layer} week={week} onSelect={onSelect} />
            <rect x="292" y="108" width="60" height="64" className="floor-core" />
            <text x="322" y="144" textAnchor="middle" className="floor-core-label">
              stair
            </text>
          </>
        ) : (
          <>
            <RoomCell id="suite" x={8} y={8} w={240} h={148} active={active} layer={layer} week={week} onSelect={onSelect} />
            <RoomCell id="courts" x={248} y={8} w={384} h={148} active={active} layer={layer} week={week} onSelect={onSelect} />
            <RoomCell id="hospitality" x={8} y={156} w={624} h={116} active={active} layer={layer} week={week} onSelect={onSelect} />
            <rect x="292" y="112" width="60" height="64" className="floor-core" />
            <text x="322" y="148" textAnchor="middle" className="floor-core-label">
              stair
            </text>
          </>
        )}
        {westWindows()}
        <text x="620" y="24" textAnchor="end" className="floor-north">
          N
        </text>
      </svg>
    </figure>
  );
}

function RoomCell({
  id,
  x,
  y,
  w,
  h,
  active,
  layer,
  week,
  onSelect,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  active: string;
  layer: FloorLayer;
  week: number | null;
  onSelect: (id: string) => void;
}) {
  const room = rooms.find((r) => r.id === id);
  if (!room) return null;
  const on = active === id;
  const time = roomTimeTone(room, week);
  const label =
    layer === "drawings" ? room.drawing.replace("HV-FAR-", "") : layer === "packages" ? room.pkg.replace("HV-FAR-", "") : room.name;
  const sub =
    layer === "drawings"
      ? room.drawingTitle
      : layer === "packages"
        ? room.pkgTitle
        : layer === "time"
          ? `W${room.weeks.map((n) => String(n).padStart(2, "0")).join("–")}`
          : null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        className={cn(
          "floor-room",
          on && "is-active",
          layer === "packages" && "is-packaged",
          layer === "time" && time === "live" && "is-live-week",
          layer === "time" && time === "passed" && "is-passed-week",
          layer === "time" && time === "ahead" && "is-ahead-week",
        )}
        role="button"
        tabIndex={0}
        aria-pressed={on}
        aria-label={`${room.name}. ${room.drawing}. ${room.pkg}`}
        onClick={() => onSelect(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(id);
          }
        }}
      />
      {layer === "packages" && (
        <rect x={x} y={y} width={w} height={h} fill={`url(#pkg-hatch-${room.floor})`} className="pointer-events-none" opacity={on ? 0.55 : 0.28} />
      )}
      <text x={x + 14} y={y + 28} className={cn("floor-room-label", on && "is-active")}>
        {label}
      </text>
      {sub && (
        <text x={x + 14} y={y + 46} className="floor-room-sub">
          {sub}
        </text>
      )}
    </g>
  );
}

function westWindows() {
  const ticks = [28, 68, 108, 148, 188, 228];
  return (
    <g aria-hidden>
      {ticks.map((y) => (
        <line key={y} x1="4" y1={y} x2="8" y2={y} className="floor-window" />
      ))}
    </g>
  );
}
