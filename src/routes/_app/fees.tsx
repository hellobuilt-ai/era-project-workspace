import { createFileRoute, Navigate } from "@tanstack/react-router";
import { fees, project } from "@/lib/era/project";
import { useEra } from "@/lib/era/store";
import { gbp } from "@/lib/utils";
import { Stamp } from "@/components/record/Stamp";
import { FilmStill } from "@/components/record/FilmStill";

export const Route = createFileRoute("/_app/fees")({ component: FeesPage });

function FeesPage() {
  const { lens } = useEra();
  if (lens === "guest") return <Navigate to="/" />;

  return (
    <div>
      <FilmStill src="/era/hero-portrait.jpg" alt="" className="min-h-[42vh]">
        <div className="flex min-h-[42vh] flex-col justify-end px-5 py-10 sm:px-10 lg:px-14">
          <p className="label-track text-ice">Named people · named fees</p>
          <h1 className="mt-3 font-display text-[length:var(--text-display-xl)] leading-[0.94] text-paper">
            {gbp(project.certainty)}.
            <br />
            Held.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] text-paper/75">
            A fee is a professional promise. Variations are new rows. Nothing is edited in place.
          </p>
        </div>
      </FilmStill>

      <div className="overflow-x-auto px-4 py-8 sm:px-8 lg:px-12">
        <table className="w-full min-w-[640px] border-y border-rule text-left">
          <thead className="bg-warm">
            <tr className="label-track text-muted">
              <th className="px-3 py-3 font-medium">Ref</th>
              <th className="px-3 py-3 font-medium">Item</th>
              <th className="px-3 py-3 font-medium">Basis</th>
              <th className="px-3 py-3 font-medium">Named to</th>
              <th className="px-3 py-3 text-right font-medium">Amount</th>
              <th className="px-3 py-3 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f, i) => (
              <tr key={f.id} className="border-t border-rule">
                <td className="px-3 py-5 font-mono text-[12px] text-muted">HV-FAR-FEE-00{i + 1}</td>
                <td className="px-3 py-5 font-serif text-[20px]">{f.item}</td>
                <td className="px-3 py-5 text-[13px] text-ink/75">{f.basis}</td>
                <td className="px-3 py-5 text-[13px]">{f.namedTo}</td>
                <td className="px-3 py-5 text-right font-mono text-[16px] tabular-nums">{gbp(f.amount)}</td>
                <td className="px-3 py-5">
                  <Stamp kind={f.status} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink">
              <td colSpan={4} className="px-3 py-5 text-[13px] text-muted">
                Issued total (certified lines)
              </td>
              <td className="px-3 py-5 text-right font-mono text-[20px] tabular-nums">
                {gbp(fees.filter((f) => f.status !== "draft").reduce((a, f) => a + f.amount, 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
