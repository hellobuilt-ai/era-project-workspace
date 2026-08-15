import { createFileRoute, Navigate } from "@tanstack/react-router";
import { people } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { FilmStill } from "@/components/record/FilmStill";

export const Route = createFileRoute("/_app/people")({ component: PeoplePage });

const portraits: Record<string, string> = {
  de: "/era/david.jpg",
  hg: "/era/henry.jpg",
};

function PeoplePage() {
  const { lens } = useEra();
  if (lens === "guest") return <Navigate to="/" />;

  return (
    <div>
      <FilmStill src="/era/space-night.jpg" alt="" className="min-h-[40vh]">
        <div className="flex min-h-[40vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <p className="label-track text-ice">Named humans only</p>
          <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
            Issued.
            <br />
            Time-boxed.
          </h1>
        </div>
      </FilmStill>

      <ul className="divide-y divide-rule">
        {people.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-5 px-5 py-6 sm:px-10 lg:px-14">
            <div className="flex items-center gap-5">
              {portraits[p.id] ? (
                <img
                  src={portraits[p.id]}
                  alt=""
                  className="size-16 object-cover outline outline-1 -outline-offset-1 outline-black/10 sm:size-20"
                />
              ) : (
                <span className="grid size-16 place-items-center bg-ink font-mono text-[13px] text-paper sm:size-20">
                  {p.initials}
                </span>
              )}
              <div>
                <p className="font-serif text-[26px] leading-tight">{p.name}</p>
                <p className="mt-1 text-[15px] text-ink/75">{p.role}</p>
                <p className="text-[13px] text-muted">{p.org}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="label-track text-petrol">
                {p.lens === "restricted" ? "Guest · 14 days" : p.lens === "era" ? "Principal" : "Sponsor"}
              </p>
              {p.id === "sk" && <p className="mt-1 font-mono text-[11px] text-signal-hold">Expires 29 Aug 2026</p>}
            </div>
          </li>
        ))}
      </ul>

      {lens === "era" && (
        <div className="border-t border-rule bg-paper px-5 py-8 sm:px-10 lg:px-14">
          <p className="label-track text-petrol">Issue access</p>
          <p className="mt-2 max-w-xl text-[16px] text-ink/80">
            Name a human, a surface, and a clock. Shared passwords cannot be issued. The contractor as a firm
            will be refused.
          </p>
          <button type="button" className="mt-5 bg-ink px-5 py-3 text-[13px] font-medium text-paper">
            Issue a credential
          </button>
        </div>
      )}
    </div>
  );
}
