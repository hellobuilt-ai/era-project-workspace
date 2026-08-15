import { useEra } from "./store";
import {
  QUALITY_ID,
  adjacentStages,
  canCertifyDecision,
  canIssueStage,
  stageBook,
  stageTone,
  type StageTone,
} from "./stages";
import { lensMeta } from "./nav";
import type { StageId } from "./types";

export function useStageProgress() {
  const currentStage = useEra((s) => s.currentStage);
  const decisions = useEra((s) => s.decisions);
  const issued = useEra((s) => s.issued);
  const constructWeek = useEra((s) => s.constructWeek);
  const thriveIssued = useEra((s) => s.thriveIssued);
  const issueStage = useEra((s) => s.issueStage);
  const completeWeek = useEra((s) => s.completeWeek);
  const issueThrive = useEra((s) => s.issueThrive);
  const replayFrom = useEra((s) => s.replayFrom);
  const certify = useEra((s) => s.certify);
  const resetSequence = useEra((s) => s.resetSequence);
  const setFocusDecision = useEra((s) => s.setFocusDecision);
  const focusDecision = useEra((s) => s.focusDecision);
  const lens = useEra((s) => s.lens);

  const quality = decisions.find((d) => d.id === QUALITY_ID);
  const qualityCertified = quality?.status === "certified";
  const live = stageBook[currentStage];
  const next = adjacentStages(currentStage).next;
  const holder = lensMeta[lens].name;

  function tone(id: StageId): StageTone {
    return stageTone(id, currentStage);
  }

  function mayCertify(decisionId: string) {
    const d = decisions.find((item) => item.id === decisionId);
    if (!d) return false;
    return canCertifyDecision(lens, d.aiDraft, d.id, d.status);
  }

  function mayIssue(id: StageId) {
    if (!canIssueStage(lens, id)) return false;
    if (currentStage !== id) return false;
    if (issued[id]) return false;
    if (id === "brief" && !qualityCertified) return false;
    if (id === "construct" && constructWeek !== 14) return false;
    return true;
  }

  function mayCompleteWeek(id: number) {
    return lens === "era" && currentStage === "construct" && constructWeek === id && id < 14;
  }

  function mayIssueThrive() {
    return lens === "era" && currentStage === "handover" && !thriveIssued;
  }

  return {
    currentStage,
    live,
    next,
    decisions,
    issued,
    constructWeek,
    thriveIssued,
    quality,
    qualityCertified,
    issueStage,
    completeWeek,
    issueThrive,
    replayFrom,
    certify,
    resetSequence,
    setFocusDecision,
    focusDecision,
    lens,
    holder,
    tone,
    mayCertify,
    mayIssue,
    mayCompleteWeek,
    mayIssueThrive,
  };
}
