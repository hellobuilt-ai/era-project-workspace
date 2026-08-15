import { createFileRoute } from "@tanstack/react-router";
import { documents } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { Stamp } from "@/components/record/Stamp";
import { cn } from "@/lib/utils";
import { lensMeta } from "@/lib/era/nav";

export const Route = createFileRoute("/_app/documents")({ component: DocumentsPage });

function DocumentsPage() {
  const { lens, selectedDoc, setSelectedDoc } = useEra();
  const meta = lensMeta[lens];
  const list = documents.filter((d) => {
    if (lens === "guest") return d.kind === "Legal" || d.id === "doc4";
    if (lens === "client") return d.stamp !== "internal";
    return true;
  });
  const active = list.find((d) => d.id === selectedDoc) ?? list[0];

  return (
    <div className="lg:flex lg:min-h-dvh">
      <div className="border-b border-rule bg-ink text-paper lg:w-[360px] lg:shrink-0 lg:border-b-0">
        <div className="relative overflow-hidden px-5 py-8">
          <img src="/era/space-night.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative">
            <p className="label-track text-ice">Evidence</p>
            <h1 className="mt-2 font-serif text-[34px] leading-[0.95]">Always a child.</h1>
            <p className="mt-3 text-[13px] text-paper/65">No folder. No public link. Issue is the verb.</p>
          </div>
        </div>
        <ul>
          {list.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setSelectedDoc(d.id)}
                className={cn(
                  "w-full border-t border-white/10 px-5 py-4 text-left hover:bg-white/5",
                  active?.id === d.id && "bg-white/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="label-track text-ice">{d.kind}</span>
                  <Stamp kind={d.stamp} invert />
                </div>
                <p className="mt-2 font-serif text-[18px] leading-snug">{d.title}</p>
                <p className="mt-1 font-mono text-[11px] text-paper/45">
                  Rev {d.rev} · {d.updated}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {active && (
        <article className="relative min-w-0 flex-1 bg-[url('/era/hero-wide.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-warm/88" />
          <div className="relative mx-auto max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
            <div className="border border-rule bg-paper p-8 shadow-[var(--shadow-float)] sm:p-12">
              {active.stamp === "draft" && (
                <div className="hatch -mx-8 -mt-8 mb-8 border-b border-dashed border-rule bg-draft-wash px-8 py-3 sm:-mx-12 sm:-mt-12 sm:px-12">
                  <p className="label-track text-signal-hold">Draft AI · not a certificate · cannot be issued</p>
                </div>
              )}
              <p className="label-track text-petrol">{active.kind}</p>
              <h2 className="mt-3 font-serif text-4xl leading-[0.98]">{active.title}</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-ink/80">{active.summary}</p>
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-rule pt-6 font-mono text-[12px]">
                <div>
                  <dt className="text-muted">Revision</dt>
                  <dd className="mt-1">{active.rev}</dd>
                </div>
                <div>
                  <dt className="text-muted">Pages</dt>
                  <dd className="mt-1">{active.pages}</dd>
                </div>
                <div>
                  <dt className="text-muted">Owner</dt>
                  <dd className="mt-1">{active.owner}</dd>
                </div>
                <div>
                  <dt className="text-muted">Updated</dt>
                  <dd className="mt-1">{active.updated}</dd>
                </div>
              </dl>
              <p className="mt-10 text-[12px] text-muted">
                Watermarked to {meta.name}. Download is a logged act. Copy link does not exist.
              </p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
