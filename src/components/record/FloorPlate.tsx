import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { rooms, floorMeta, type Room } from "@/lib/era/floor";
import { useEra } from "@/lib/era/store";

export function FloorPlate() {
  const [active, setActive] = useState<string>("partners");
  const setFocusDecision = useEra((s) => s.setFocusDecision);
  const room = rooms.find((r) => r.id === active) ?? rooms[0];

  return (
    <div className="floor-plate mt-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-5">
          <FloorPlan
            floor="l5"
            active={active}
            onSelect={setActive}
          />
          <FloorPlan
            floor="l4"
            active={active}
            onSelect={setActive}
          />
        </div>
        <aside className="floor-legend">
          <p className="label-track text-petrol">{room.area}</p>
          <h3 className="mt-2 font-serif text-[length:var(--text-folio)] leading-snug">{room.name}</h3>
          <p className="mt-2 text-body leading-relaxed text-ink/75">{room.hint}</p>
          <p className="mt-4 font-mono text-micro text-muted">{room.drawing}</p>
          {room.hash ? (
            <Link
              to={room.to}
              hash={room.hash}
              onClick={() => {
                if (room.hash === "decision-d3") setFocusDecision("d3");
              }}
              className="mt-5 inline-flex min-h-11 items-center bg-ink px-4 text-body font-medium text-paper transition-colors duration-[var(--motion-quick)] hover:bg-petrol"
            >
              Open the instrument →
            </Link>
          ) : room.params ? (
            <Link
              to="/stage/$stageId"
              params={room.params}
              className="mt-5 inline-flex min-h-11 items-center bg-ink px-4 text-body font-medium text-paper transition-colors duration-[var(--motion-quick)] hover:bg-petrol"
            >
              Open the instrument →
            </Link>
          ) : (
            <Link
              to={room.to}
              className="mt-5 inline-flex min-h-11 items-center bg-ink px-4 text-body font-medium text-paper transition-colors duration-[var(--motion-quick)] hover:bg-petrol"
            >
              Open the instrument →
            </Link>
          )}
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
                  <span className="text-body">{r.name}</span>
                  <span className="font-mono text-micro">{floorMeta[r.floor].n}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function FloorPlan({
  floor,
  active,
  onSelect,
}: {
  floor: Room["floor"];
  active: string;
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
      <svg
        viewBox="0 0 640 280"
        role="img"
        aria-label={`${meta.label} floor plate`}
        className="mt-1 w-full"
      >
        <rect x="8" y="8" width="624" height="264" className="floor-wall" />
        {floor === "l5" ? (
          <>
            <RoomCell id="partners" x={8} y={8} w={214} h={264} label="Partners" active={active} onSelect={onSelect} />
            <RoomCell id="knowledge" x={222} y={8} w={200} h={264} label="Knowledge" active={active} onSelect={onSelect} />
            <RoomCell id="quiet" x={422} y={8} w={210} h={264} label="Quiet" active={active} onSelect={onSelect} />
            <rect x="292" y="108" width="60" height="64" className="floor-core" />
            <text x="322" y="144" textAnchor="middle" className="floor-core-label">
              stair
            </text>
          </>
        ) : (
          <>
            <RoomCell id="suite" x={8} y={8} w={240} h={148} label="Client suite" active={active} onSelect={onSelect} />
            <RoomCell id="courts" x={248} y={8} w={384} h={148} label="Two courts" active={active} onSelect={onSelect} />
            <RoomCell
              id="hospitality"
              x={8}
              y={156}
              w={624}
              h={116}
              label="Hospitality reception"
              active={active}
              onSelect={onSelect}
            />
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
  label,
  active,
  onSelect,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  active: string;
  onSelect: (id: string) => void;
}) {
  const on = active === id;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        className={cn("floor-room", on && "is-active")}
        role="button"
        tabIndex={0}
        aria-pressed={on}
        aria-label={label}
        onClick={() => onSelect(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(id);
          }
        }}
      />
      <text x={x + 14} y={y + 28} className={cn("floor-room-label", on && "is-active")}>
        {label}
      </text>
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
