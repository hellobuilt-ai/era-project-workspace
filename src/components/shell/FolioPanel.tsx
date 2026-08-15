import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { instrumentItem, practiceItems } from "@/lib/era/nav";
import { stageBook, stageFromPath } from "@/lib/era/stages";
import { useStageProgress } from "@/lib/era/progress";

export function FolioPanel({
  pathname,
  onClose,
  onNavigate,
  embedded,
}: {
  pathname: string;
  onClose: () => void;
  onNavigate?: () => void;
  embedded?: boolean;
}) {
  const body = <FolioLists pathname={pathname} onNavigate={onNavigate} />;

  if (embedded) return <div className="px-1 pb-4">{body}</div>;

  return (
    <div className="folio-layer" role="dialog" aria-modal="true" aria-label="Contents">
      <aside className="folio-panel">
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="label-track text-paper/40">Contents</p>
          <button type="button" onClick={onClose} className="hit-44 px-2 font-mono text-micro text-paper/50 hover:text-paper">
            Close
          </button>
        </div>
        {body}
      </aside>
      <button type="button" className="folio-scrim" aria-label="Close contents" onClick={onClose} />
    </div>
  );
}

function FolioLists({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { currentStage, lens } = useStageProgress();
  const viewing = stageFromPath(pathname, currentStage);
  const viewed = stageBook[viewing];
  const instrument = instrumentItem(viewing);
  const practice = practiceItems(lens);
  const here = instrument.to === "/" ? pathname === "/" : pathname.startsWith(instrument.to);

  return (
    <>
      <div className="mt-6 px-4">
        <p className="label-track text-paper/40">This stage</p>
        <p className="mt-1 font-serif text-xl text-paper">
          {viewed.n} {viewed.label}
        </p>
        <Link
          to={instrument.to}
          onClick={onNavigate}
          aria-current={here ? "page" : undefined}
          className={cn(
            "mt-3 flex min-h-11 items-center px-3 text-body",
            here ? "bg-white/10 text-paper" : "text-paper/70 hover:bg-white/5 hover:text-paper",
          )}
        >
          {instrument.label}
        </Link>
      </div>

      {practice.length > 0 && (
        <div className="mt-8 px-4">
          <p className="label-track text-paper/40">The practice</p>
          <ul className="mt-2">
            {practice.map((item) => {
              const active = pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center px-3 text-body",
                      active ? "bg-white/10 text-paper" : "text-paper/65 hover:bg-white/5 hover:text-paper",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
