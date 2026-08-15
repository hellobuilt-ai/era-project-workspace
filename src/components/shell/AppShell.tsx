import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useEra } from "@/lib/era/store";
import { CommandPalette } from "./CommandPalette";
import { PracticeRail } from "./PracticeRail";
import { FolioPanel } from "./FolioPanel";
import { MobileDock, MobileDrawer, MobileTop } from "./MobileChrome";
import { StagePassage } from "@/components/record/StagePassage";
import { PulseBar } from "@/components/record/PulseBar";
import { SequenceSpine } from "@/components/record/SequenceSpine";
import { ReturnSlip } from "@/components/record/ReturnSlip";
import { SequenceFilm } from "@/components/record/SequenceFilm";
import { StageCompare } from "@/components/record/StageCompare";
import { useStageProgress } from "@/lib/era/progress";
import { STAGE_ORDER, adjacentStages, stageFromPath } from "@/lib/era/stages";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setCommandOpen, commandOpen, passage, markVisit, visit, filmOpen, setCompareWith, compareWith } =
    useEra();
  const { currentStage, decisions } = useStageProgress();
  const navigate = useNavigate();
  const [slip, setSlip] = useState<{ sinceLeft: boolean } | null>(null);
  const [folio, setFolio] = useState(false);
  const [invite, setInvite] = useState(false);
  const [studio, setStudio] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const chromeOpen = commandOpen || passage || filmOpen || folio || invite || studio || drawer;

  function closePops() {
    setInvite(false);
    setStudio(false);
  }

  function toggleFolio() {
    closePops();
    setFolio((v) => !v);
  }

  function toggleInvite() {
    setStudio(false);
    setFolio(false);
    setInvite((v) => !v);
  }

  function toggleStudio() {
    setInvite(false);
    setFolio(false);
    setStudio((v) => !v);
  }

  function closeAll() {
    setFolio(false);
    setInvite(false);
    setStudio(false);
    setDrawer(false);
    setCompareWith(null);
  }

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (folio || invite || studio || drawer || compareWith) {
          e.preventDefault();
          closeAll();
        }
        return;
      }
      if (chromeOpen) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const viewing = stageFromPath(pathname, currentStage);
      const { prev, next } = adjacentStages(viewing);
      if (e.key === "ArrowRight" || e.key === "]") {
        if (!next) return;
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: next.id } });
      } else if (e.key === "ArrowLeft" || e.key === "[") {
        if (!prev) return;
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: prev.id } });
      } else if (/^[0-6]$/.test(e.key)) {
        const id = STAGE_ORDER[Number(e.key)];
        if (!id) return;
        e.preventDefault();
        void navigate({ to: "/stage/$stageId", params: { stageId: id } });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chromeOpen, folio, invite, studio, drawer, compareWith, pathname, currentStage, navigate, setCompareWith]);

  useEffect(() => {
    const waiting = decisions.some((d) => d.status === "open" || d.status === "countered");
    const sinceLeft = Boolean(visit && Date.now() - visit.at > 90_000);
    const seen = typeof sessionStorage !== "undefined" && sessionStorage.getItem("era-slip") === "1";
    if (!seen && (waiting || sinceLeft)) {
      setSlip({ sinceLeft });
    }
    markVisit(currentStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFolio(false);
    setDrawer(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-warm text-ink">
      <a
        href="#record"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to record
      </a>

      <div className="lg:flex">
        <div className="hidden lg:block">
          <PracticeRail
            folioOpen={folio}
            inviteOpen={invite}
            studioOpen={studio}
            onFolio={toggleFolio}
            onInvite={toggleInvite}
            onStudio={toggleStudio}
            onClosePop={closePops}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="chrome-sticky hidden lg:block">
            <PulseBar pathname={pathname} />
            <SequenceSpine pathname={pathname} />
          </div>

          <MobileTop />

          <main id="record" className="mobile-main">
            {slip && (
              <ReturnSlip
                sinceLeft={slip.sinceLeft}
                onDismiss={() => {
                  setSlip(null);
                  try {
                    sessionStorage.setItem("era-slip", "1");
                  } catch {
                    /* ignore */
                  }
                }}
              />
            )}
            <StageCompare />
            <Outlet />
          </main>

          <MobileDock onContents={() => setDrawer(true)} />
        </div>
      </div>

      {folio && (
        <div className="hidden lg:block">
          <FolioPanel pathname={pathname} onClose={() => setFolio(false)} onNavigate={() => setFolio(false)} />
        </div>
      )}

      <MobileDrawer
        open={drawer}
        pathname={pathname}
        inviteOpen={invite}
        onInvite={toggleInvite}
        onInviteClose={() => setInvite(false)}
        onClose={() => {
          setDrawer(false);
          setInvite(false);
        }}
      />

      <CommandPalette />
      <StagePassage />
      <SequenceFilm />
    </div>
  );
}
