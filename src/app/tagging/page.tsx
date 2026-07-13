"use client";

import { FormEvent, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { matchSessions, players } from "@/lib/mock-data";
import {
  PLAYER_POINT_OUTCOMES,
  PRESSURE_TRIGGERS,
  type PlayerPointOutcome,
  type PressureTrigger,
} from "@/lib/pinpoint-types";

type ClipContext = {
  playerId: string;
  matchSessionId: string;
  clipLink: string;
  timestamp: string;
  scoreContext: string;
  pressureTrigger: PressureTrigger | "";
  playerPointOutcome: PlayerPointOutcome;
  coachNote: string;
};

type AnalysisDraft = {
  serveOrReturn: string;
  pointOutcome: string;
  playerPointOutcome: string;
  firstServeIn: string;
  rallyLengthEstimate: string;
  primaryPattern: string;
  pressurePatternFamily: string;
  likelyBreakdownMoment: string;
  decisionQuality: string;
  executionQuality: string;
  missedOpportunity: string;
  eliteReferencePattern: string;
  aggressionLevel: string;
  riskDecision: string;
  shotThatDecidedPoint: string;
  errorOrWinnerType: string;
  resetBehavior: string;
  bodyLanguageNote: string;
  tacticalPrinciple: string;
  coachingTakeaway: string;
  tags: string[];
  confidenceLevel: string;
  eliteComparison: string;
  nextTimeAdjustment: string;
  trainingFocus: string;
  analysisNotes: string;
};

const analysisLabels: Record<keyof AnalysisDraft, string> = {
  serveOrReturn: "Serve / return",
  pointOutcome: "Point outcome",
  playerPointOutcome: "Player point outcome",
  firstServeIn: "First serve in",
  rallyLengthEstimate: "Rally length estimate",
  primaryPattern: "What happened",
  pressurePatternFamily: "Pressure pattern family",
  likelyBreakdownMoment: "Breakdown moment",
  decisionQuality: "Decision quality",
  executionQuality: "Execution quality",
  missedOpportunity: "Missed opportunity",
  eliteReferencePattern: "Elite reference pattern",
  aggressionLevel: "Aggression level",
  riskDecision: "Risk decision",
  shotThatDecidedPoint: "Shot that decided point",
  errorOrWinnerType: "Error / winner type",
  resetBehavior: "Reset behavior",
  bodyLanguageNote: "Body language note",
  tacticalPrinciple: "Tactical principle",
  coachingTakeaway: "Coaching takeaway",
  tags: "Tags",
  confidenceLevel: "Confidence level",
  eliteComparison: "Elite comparison",
  nextTimeAdjustment: "Next-time adjustment",
  trainingFocus: "Training focus",
  analysisNotes: "Analysis notes",
};

const analysisDisplayOrder: (keyof AnalysisDraft)[] = [
  "primaryPattern",
  "pressurePatternFamily",
  "likelyBreakdownMoment",
  "eliteComparison",
  "nextTimeAdjustment",
  "trainingFocus",
  "coachingTakeaway",
  "decisionQuality",
  "executionQuality",
  "missedOpportunity",
  "eliteReferencePattern",
  "serveOrReturn",
  "playerPointOutcome",
  "pointOutcome",
  "rallyLengthEstimate",
  "riskDecision",
  "aggressionLevel",
  "firstServeIn",
  "shotThatDecidedPoint",
  "errorOrWinnerType",
  "resetBehavior",
  "bodyLanguageNote",
  "tacticalPrinciple",
  "tags",
  "confidenceLevel",
  "analysisNotes",
];

const fullWidthAnalysisFields = new Set<keyof AnalysisDraft>([
  "primaryPattern",
  "pressurePatternFamily",
  "likelyBreakdownMoment",
  "eliteComparison",
  "nextTimeAdjustment",
  "trainingFocus",
  "coachingTakeaway",
  "decisionQuality",
  "executionQuality",
  "missedOpportunity",
  "analysisNotes",
]);

function formatAnalysisValue(value: AnalysisDraft[keyof AnalysisDraft]) {
  return Array.isArray(value) ? value.join(", ") : value;
}

function parseAnalysisValue(field: keyof AnalysisDraft, value: string) {
  if (field === "tags") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return value;
}

export default function TaggingPage() {
  const [context, setContext] = useState<ClipContext>({
    playerId: players[0].id,
    matchSessionId: matchSessions[0].id,
    clipLink: "",
    timestamp: "00:42:12-00:42:24",
    scoreContext: "5-5, deuce, second set",
    pressureTrigger: "Deuce",
    playerPointOutcome: "Lost",
    coachNote: "",
  });
  const [analysis, setAnalysis] = useState<AnalysisDraft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

  function updateContext<Field extends keyof ClipContext>(
    field: Field,
    value: ClipContext[Field],
  ) {
    setContext((current) => ({ ...current, [field]: value }));
  }

  function updateAnalysis(field: keyof AnalysisDraft, value: string) {
    setAnalysis((current) =>
      current
        ? { ...current, [field]: parseAnalysisValue(field, value) }
        : current,
    );
  }

  async function generateDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setAnalysisError("");
    setReviewStatus("");

    const player = players.find((item) => item.id === context.playerId);
    const matchSession = matchSessions.find(
      (item) => item.id === context.matchSessionId,
    );

    try {
      const response = await fetch("/api/analyze-clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: player?.name ?? "Unknown player",
          matchSession: matchSession
            ? `${matchSession.event} - ${matchSession.date}`
            : "Unknown match/session",
          clipSource: context.clipLink,
          timestampOrRange: context.timestamp,
          scoreContext: context.scoreContext,
          pressureTrigger: context.pressureTrigger,
          playerPointOutcome: context.playerPointOutcome,
          coachNote: context.coachNote,
        }),
      });

      if (!response.ok) {
        throw new Error("The analysis service returned an error.");
      }

      const draft = (await response.json()) as AnalysisDraft;
      setAnalysis(draft);
      setIsEditing(false);
      setReviewStatus("AI draft generated from the supplied clip context.");
    } catch {
      setAnalysisError(
        "Could not generate the AI draft. Check the clip context and try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function setStatus(status: string) {
    setReviewStatus(status);
    setIsEditing(false);
  }

  return (
    <PageShell
      eyebrow="AI-assisted pressure point analysis"
      title="Clip Analysis Workspace"
      description="Provide the clip context. Pinpoint AI drafts the tactical analysis for coach review."
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-semibold text-emerald-950">
            How this will work in the MVP
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            The current output is mock prototype data. In the MVP, Pinpoint AI
            will analyze the clip, structure the observation into an AI Draft
            Analysis, compare it with the elite pressure library, and present
            the draft for coach review. The coach supplies context and approves
            or edits the draft; the AI drafts the analysis.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Future save behavior
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Analyzed clips will be saved to a match or training session after
            coach review. Saved reports can be reopened later for demo or
            coaching review, and reanalysis will be a manual action rather than
            an automatic background update.
          </p>
        </section>

        <form
          onSubmit={generateDraft}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              Clip Context
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Add only what is known. The analysis fields are generated from
              the clip and this context.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Player being analyzed
              </span>
              <select
                value={context.playerId}
                onChange={(event) =>
                  updateContext("playerId", event.target.value)
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Match / session
              </span>
              <select
                value={context.matchSessionId}
                onChange={(event) =>
                  updateContext("matchSessionId", event.target.value)
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {matchSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.event} - {session.date}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="block text-sm font-medium text-slate-700">
                Clip link or upload
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste a video or clip link"
                  value={context.clipLink}
                  onChange={(event) =>
                    updateContext("clipLink", event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
                <button
                  type="button"
                  disabled
                  title="This workspace currently accepts clip links"
                  className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500"
                >
                  Clip link only
                </button>
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Timestamp or clip range
              </span>
              <input
                value={context.timestamp}
                onChange={(event) =>
                  updateContext("timestamp", event.target.value)
                }
                placeholder="e.g. 00:42:12-00:42:24"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Score context{" "}
                <span className="font-normal text-slate-500">(if known)</span>
              </span>
              <input
                value={context.scoreContext}
                onChange={(event) =>
                  updateContext("scoreContext", event.target.value)
                }
                placeholder="e.g. 5-5, deuce, second set"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Pressure trigger{" "}
                <span className="font-normal text-slate-500">(if known)</span>
              </span>
              <select
                value={context.pressureTrigger}
                onChange={(event) =>
                  updateContext(
                    "pressureTrigger",
                    event.target.value as PressureTrigger | "",
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Not specified</option>
                {PRESSURE_TRIGGERS.map((trigger) => (
                  <option key={trigger}>{trigger}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Player point outcome
              </span>
              <select
                value={context.playerPointOutcome}
                onChange={(event) =>
                  updateContext(
                    "playerPointOutcome",
                    event.target.value as PlayerPointOutcome,
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {PLAYER_POINT_OUTCOMES.map((outcome) => (
                  <option key={outcome}>{outcome}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Optional coach note
            </span>
            <textarea
              value={context.coachNote}
              onChange={(event) =>
                updateContext("coachNote", event.target.value)
              }
              rows={3}
              placeholder="Add relevant context that may not be visible in the clip."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <button
            type="submit"
            disabled={isGenerating}
            className="mt-5 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating AI Draft..." : "Generate AI Draft Analysis"}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Prototype output only - no video or external AI service is
            connected.
          </p>
          {analysisError && (
            <p
              role="alert"
              className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {analysisError}
            </p>
          )}
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                AI Draft Analysis
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Review the coach-facing feedback before it becomes part of the
                player record. Lost points are framed around the next useful
                adjustment, not blame.
              </p>
            </div>
            {analysis && (
              <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                Draft - coach review required
              </span>
            )}
          </div>

          {!analysis ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No analysis generated yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Complete the clip context and generate an AI draft.
              </p>
            </div>
          ) : (
            <dl className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {analysisDisplayOrder.map(
                (field) => (
                  <div
                    key={field}
                    className={fullWidthAnalysisFields.has(field) ? "md:col-span-2" : ""}
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {analysisLabels[field]}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-slate-900">
                      {isEditing ? (
                        <textarea
                          value={formatAnalysisValue(analysis[field])}
                          onChange={(event) =>
                            updateAnalysis(field, event.target.value)
                          }
                          rows={
                            field === "coachingTakeaway" ||
                            field === "eliteComparison" ||
                            field === "analysisNotes"
                              ? 2
                              : 1
                          }
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
                        />
                      ) : (
                        formatAnalysisValue(analysis[field])
                      )}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Coach Review
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Confirm the system draft, refine it with your coaching perspective,
            flag uncertainty, or add it to a report.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!analysis}
              onClick={() => setStatus("Draft accepted by coach.")}
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Accept draft
            </button>
            <button
              type="button"
              disabled={!analysis}
              onClick={() => {
                setIsEditing((current) => !current);
                setReviewStatus(
                  isEditing
                    ? "Draft refinements retained for coach review."
                    : "Editing enabled. Review every change before saving.",
                );
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isEditing ? "Finish editing" : "Edit before saving"}
            </button>
            <button
              type="button"
              disabled={!analysis}
              onClick={() =>
                setStatus("Draft marked uncertain for further coach review.")
              }
              className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Mark uncertain
            </button>
            <button
              type="button"
              disabled={!analysis}
              onClick={() => setStatus("Draft added to the report queue.")}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add to report
            </button>
          </div>
          {reviewStatus && (
            <p
              role="status"
              className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {reviewStatus}
            </p>
          )}
        </section>
      </div>
    </PageShell>
  );
}
