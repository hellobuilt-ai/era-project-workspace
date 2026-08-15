import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn, gbp } from "@/lib/utils";
import { useEra } from "@/lib/era/store";
import { project, stages } from "@/lib/era/project";
import { lensMeta, navItems, type NavItem } from "@/lib/era/nav";
import type { Lens } from "@/lib/era/types";
import { CommandPalette } from "./CommandPalette";
import { SignedIn, UserButton } from "@/lib/auth/gates";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lens, setLens, setCommandOpen } = useEra();
  const [open, setOpen] = useState(false);
  const meta = lensMeta[lens];
  const items = navItems.filter((n) => n.lenses.includes(lens));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  return (
    <div className="min-h-dvh bg-warm text-ink">
      <a
        href="#record"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to record
      </a>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-ink px-3 text-paper lg:hidden">
        <button
          type="button"
          aria-label="Open contents"
          className="grid size-11 place-items-center"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </button>
        <div className="min-w-0 text-center">
          <p className="truncate font-serif text-[15px]">{project.name}</p>
          <p className="font-mono text-[10px] tracking-wide text-ice">{gbp(project.certainty)}</p>
        </div>
        <Link to="/login" className="grid size-11 place-items-center">
          <img src="/brand/era-mark.png" alt="ERA" className="size-7" />
        </Link>
      </header>

      <div className="lg:flex">
        <aside className="sticky top-0 hidden h-dvh w-[300px] shrink-0 flex-col bg-ink text-paper lg:flex">
          <TitleBlock />
          <NavList items={items} pathname={pathname} />
          <LensSwitch lens={lens} setLens={setLens} />
        </aside>

        <main id="record" className="min-w-0 flex-1">
          {lens === "guest" && (
            <div className="bg-ink px-4 py-2 text-center text-[12px] text-ice sm:px-8">
              Issued to {meta.name} · Licence pack · expires {meta.expires} · not a public link
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[rgb(11_31_51_/_0.46)]"
            aria-label="Close contents"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,300px)] flex-col bg-ink text-paper">
            <div className="flex items-center justify-between px-4 py-3">
              <img src="/brand/era-logo-white.png" alt="ERA" className="h-7 w-auto" />
              <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <TitleBlock compact />
            <NavList items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
            <LensSwitch lens={lens} setLens={setLens} />
          </div>
        </div>
      )}

      <CommandPalette />
    </div>
  );
}

function TitleBlock({ compact }: { compact?: boolean }) {
  const { setCommandOpen } = useEra();
  return (
    <div className={cn("relative overflow-hidden", compact ? "px-5 py-3" : "px-5 pb-5 pt-6")}>
      {!compact && (
        <img
          src="/era/space-night.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
      )}
      <div className="relative">
        <Link to="/login" className="inline-block">
          <img src="/brand/era-logo-white.png" alt="ERA" className="h-8 w-auto" />
        </Link>
        <p className="mt-5 label-track text-ice">Controlled record</p>
        <h1 className="mt-1 font-serif text-[24px] leading-snug">{project.name}</h1>
        <p className="mt-1 text-[13px] text-paper/70">{project.subtitle}</p>
        <p className="mt-2 font-mono text-[18px] tabular-nums tracking-tight text-paper">
          {gbp(project.certainty)}
        </p>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="mt-4 w-full border border-white/20 bg-ink/40 px-3 py-2.5 text-left text-[12px] text-paper/70 backdrop-blur-[2px] transition-colors duration-150 hover:border-ice/50 hover:text-paper"
        >
          What needs you · ⌘K
        </button>
      </div>
    </div>
  );
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Record contents">
      <StageStrip />
      <ul className="mt-5 space-y-0.5">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center justify-between px-2 py-2.5 text-[15px] transition-colors duration-150",
                  active ? "bg-white/10 text-paper" : "text-paper/65 hover:bg-white/5 hover:text-paper",
                )}
              >
                <span>{item.label}</span>
                {active && <span className="h-px w-7 bg-ice" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function StageStrip() {
  return (
    <div>
      <p className="label-track px-2 text-paper/40">Stage</p>
      <ol className="mt-2 flex gap-1 px-2">
        {stages.map((s) => {
          const current = s.id === project.stage;
          return (
            <li key={s.id} className="flex-1" title={s.label}>
              <span
                className={cn(
                  "block h-0.5",
                  current ? "bg-ice" : s.id === "lease" ? "bg-paper/40" : "bg-white/15",
                )}
              />
              {current && (
                <span className="mt-1.5 block text-[10px] font-medium tracking-wide text-ice">
                  {s.n} {s.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LensSwitch({
  lens,
  setLens,
}: {
  lens: Lens;
  setLens: (l: Lens) => void;
}) {
  const meta = lensMeta[lens];
  return (
    <div className="border-t border-white/10 p-4">
      <p className="label-track text-paper/40">Preview invitation</p>
      <p className="mt-1 font-serif text-[18px]">{meta.name}</p>
      <p className="text-[12px] text-paper/60">
        {meta.privilege}
        {meta.expires ? ` · expires ${meta.expires}` : ""}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1">
        {(["era", "client", "guest"] as Lens[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLens(l)}
            className={cn(
              "px-1 py-2 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-150",
              lens === l ? "bg-paper text-ink" : "border border-white/15 text-paper/70 hover:text-paper",
            )}
          >
            {l === "era" ? "ERA" : l === "client" ? "Client" : "Guest"}
          </button>
        ))}
      </div>
      <SignedIn>
        <div className="mt-3 text-[12px] text-paper/70">
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
