import { useNavigate } from "@tanstack/react-router";
import { useEra } from "@/lib/era/store";
import { useStageProgress } from "@/lib/era/progress";
import type { Lens } from "@/lib/era/types";
import { cn } from "@/lib/utils";

export function StudioMenu({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { lens, setLens, setFilmOpen } = useEra();
  const { replayFrom, resetSequence } = useStageProgress();
  const navigate = useNavigate();

  function preview(next: Lens) {
    setLens(next);
    onClose();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Studio"
        className={cn("rail-btn", open && "is-on")}
      >
        St
      </button>
      {open && (
        <div className="studio-pop" role="menu" aria-label="Studio">
          <p className="label-track text-paper/40">Studio</p>
          <p className="mt-2 text-body-sm text-paper/70">Preview lens. Never shown to the client.</p>
          <div className="mt-3 grid grid-cols-3 gap-1">
            {(["era", "client", "guest"] as Lens[]).map((l) => (
              <button
                key={l}
                type="button"
                role="menuitem"
                aria-pressed={lens === l}
                onClick={() => preview(l)}
                className={cn(
                  "label-track min-h-11 px-1",
                  lens === l ? "bg-paper text-ink" : "text-paper/50 hover:text-paper",
                )}
              >
                {l === "era" ? "ERA" : l === "client" ? "Client" : "Guest"}
              </button>
            ))}
          </div>
          <button
            type="button"
            role="menuitem"
            className="mt-4 flex min-h-11 w-full items-center text-left text-body text-paper/80 hover:text-paper"
            onClick={() => {
              setFilmOpen(true);
              onClose();
            }}
          >
            Play the sequence
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex min-h-11 w-full items-center text-left text-body text-paper/80 hover:text-paper"
            onClick={() => {
              replayFrom("lease");
              void navigate({ to: "/lease" });
              onClose();
            }}
          >
            Replay from 00
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex min-h-11 w-full items-center text-left text-body text-paper/80 hover:text-paper"
            onClick={() => {
              resetSequence();
              void navigate({ to: "/" });
              onClose();
            }}
          >
            Replay from 01
          </button>
        </div>
      )}
    </div>
  );
}
