"use client";

import { FormEvent, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { matchSessions, players, PressureTrigger } from "@/lib/mock-data";

type ClipContext = {
  playerId: string;
  matchSessionId: string;
  clipLink: string;
  timestamp: string;
  scoreContext: string;
  pressureTrigger: PressureTrigger | "";
  coachNote: string;
};

type AnalysisDraft = {
  rallyLength: string;
  serveOrReturn: string;
  firstServeIn: string;
  pointOutcome: string;
  primaryPattern: string;
  aggressionLevel: string;
  riskDecision: string;
  decidingShot: string;
  resultType: string;
  resetBehavior: string;
  bodyLanguage: string;
  tacticalPrinciple: string;
  coachingTakeaway: string;
  tags: string;
  confidenceLevel: string;
  eliteComparison: string;
};

const pressureTriggers: PressureTrigger[] = [
  "30-30",
  "Deuce",
  "Advantage",
  "Break Point",
  "Set Point",
  "Match Point",
  "Tiebreak",
];

const analysisLabels: Record<keyof AnalysisDraft, string> = {
  rallyLength: "Rally length estimate",
  serveOrReturn: "Serve / return",
  firstServeIn: "First serve in",
  pointOutcome: "Point outcome",
  primaryPattern: "Primary pattern detected",
  aggressionLevel: "Aggression level",
  riskDecision: "Risk decision",
  decidingShot: "Shot that decided point",
  resultType: "Error / winner type",
  resetBehavior: "Reset behavior",
  bodyLanguage: "Body language note",
  tacticalPrinciple: "Tactical principle",
  coachingTakeaway: "Coaching takeaway",
  tags: "Tags",
  confidenceLevel: "Confidence level",
  eliteComparison: "Elite comparison",
};

function createMockAnalysis(context: ClipContext): AnalysisDraft {
  const trigger = context.pressureTrigger || "Pressure point";
  const score = context.scoreContext.trim() || "score context not supplied";
  const isReturnPoint = ["Break Point", "Match Point"].includes(trigger);
  const isHighPressure = ["Set Point", "Match Point", "Tiebreak"].includes(
    trigger,
  );

  if (isReturnPoint) {
    return {
      rallyLength: "8 shots (estimated)",
      serveOrReturn: "Return",
      firstServeIn: "Yes — visible",
      pointOutcome: "Won",
      primaryPattern:
        "Compact deep-middle return, baseline hold, then backhand redirection",
      aggressionLevel: "Controlled",
      riskDecision:
        "Protected the return margin before attacking the first shorter ball",
      decidingShot: "Backhand down the line",
      resultType: "Forced forehand error",
      resetBehavior: "Turned away promptly and restored position for the next point",
      bodyLanguage: "Stable receiving posture and low emotional variance",
      tacticalPrinciple:
        "Remove early angles under pressure, then redirect from a balanced position",
      coachingTakeaway:
        "Keep the deep-middle return as the default target before looking to change direction.",
      tags: `${trigger.toLowerCase()}, return depth, baseline hold, redirection`,
      confidenceLevel: "Medium — key ball contacts are visible",
      eliteComparison:
        "Djokovic-style deep-middle return pattern: compact contact and neutral geometry before redirection",
    };
  }

  return {
    rallyLength: isHighPressure ? "6 shots (estimated)" : "5 shots (estimated)",
    serveOrReturn: "Serve",
    firstServeIn: "Yes — visible",
    pointOutcome: "Won",
    primaryPattern:
      "Wide first serve followed by an early forehand into the open court",
    aggressionLevel: isHighPressure ? "High, but organized" : "Controlled",
    riskDecision:
      "Accepted first-strike risk from a repeatable serve-plus-one pattern",
    decidingShot: "Inside-out forehand",
    resultType: "Forced backhand error",
    resetBehavior: "Brief positive response, then a deliberate breathing reset",
    bodyLanguage: `Committed posture despite ${score}`,
    tacticalPrinciple:
      "Use serve location to create a predictable first-forehand opportunity",
    coachingTakeaway:
      "Define both serve location and plus-one target before the pressure point begins.",
    tags: `${trigger.toLowerCase()}, serve plus one, first strike, forehand`,
    confidenceLevel: context.scoreContext ? "High — context and sequence align" : "Medium — score not confirmed",
    eliteComparison:
      "Federer-style serve-plus-one structure: serve width creates space for the first forehand",
  };
}

export default function TaggingPage() {
  const [context, setContext] = useState<ClipContext>({
    playerId: players[0].id,
    matchSessionId: matchSessions[0].id,
    clipLink: "",
    timestamp: "00:42:12–00:42:24",
    scoreContext: "5-5, deuce, second set",
    pressureTrigger: "Deuce",
    coachNote: "",
  });
  const [analysis, setAnalysis] = useState<AnalysisDraft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("");

  function updateContext<Field extends keyof ClipContext>(
    field: Field,
    value: ClipContext[Field],
  ) {
    setContext((current) => ({ ...current, [field]: value }));
  }

  function updateAnalysis(field: keyof AnalysisDraft, value: string) {
    setAnalysis((current) =>
      current ? { ...current, [field]: value } : current,
    );
  }

  function generateDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalysis(createMockAnalysis(context));
    setIsEditing(false);
    setReviewStatus("AI draft generated from the supplied clip context.");
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
        <form
          onSubmit={generateDraft}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">Clip Context</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Add only what is known. The analysis fields are generated from the clip and this context.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Player being analyzed</span>
              <select
                value={context.playerId}
                onChange={(event) => updateContext("playerId", event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Match / session</span>
              <select
                value={context.matchSessionId}
                onChange={(event) => updateContext("matchSessionId", event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {matchSessions.map((session) => (
                  <option key={session.id} value={session.id}>{session.event} — {session.date}</option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="block text-sm font-medium text-slate-700">Clip link or upload</span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste a video or clip link"
                  value={context.clipLink}
                  onChange={(event) => updateContext("clipLink", event.target.value)}
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
              <span className="text-sm font-medium text-slate-700">Timestamp or clip range</span>
              <input
                value={context.timestamp}
                onChange={(event) => updateContext("timestamp", event.target.value)}
                placeholder="e.g. 00:42:12–00:42:24"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Score context <span className="font-normal text-slate-500">(if known)</span></span>
              <input
                value={context.scoreContext}
                onChange={(event) => updateContext("scoreContext", event.target.value)}
                placeholder="e.g. 5-5, deuce, second set"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Pressure trigger <span className="font-normal text-slate-500">(if known)</span></span>
              <select
                value={context.pressureTrigger}
                onChange={(event) => updateContext("pressureTrigger", event.target.value as PressureTrigger | "")}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Not specified</option>
                {pressureTriggers.map((trigger) => <option key={trigger}>{trigger}</option>)}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-slate-700">Optional coach note</span>
            <textarea
              value={context.coachNote}
              onChange={(event) => updateContext("coachNote", event.target.value)}
              rows={3}
              placeholder="Add relevant context that may not be visible in the clip."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <button
            type="submit"
            className="mt-5 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Generate AI Draft Analysis
          </button>
          <p className="mt-2 text-xs text-slate-500">Prototype output only — no video or external AI service is connected.</p>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">AI Draft Analysis</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Review AI-inferred observations before they become part of the player record.</p>
            </div>
            {analysis && <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Draft — coach review required</span>}
          </div>

          {!analysis ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-700">No analysis generated yet</p>
              <p className="mt-1 text-sm text-slate-500">Complete the clip context and generate an AI draft.</p>
            </div>
          ) : (
            <dl className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {(Object.keys(analysisLabels) as (keyof AnalysisDraft)[]).map((field) => (
                <div key={field} className={field === "coachingTakeaway" || field === "eliteComparison" ? "md:col-span-2" : ""}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{analysisLabels[field]}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-900">
                    {isEditing ? (
                      <textarea
                        value={analysis[field]}
                        onChange={(event) => updateAnalysis(field, event.target.value)}
                        rows={field === "coachingTakeaway" || field === "eliteComparison" ? 2 : 1}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      />
                    ) : analysis[field]}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Coach Review</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Confirm the system draft, refine it with your coaching perspective, flag uncertainty, or add it to a report.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={!analysis} onClick={() => setStatus("Draft accepted by coach.")} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Accept draft</button>
            <button type="button" disabled={!analysis} onClick={() => { setIsEditing((current) => !current); setReviewStatus(isEditing ? "Draft refinements retained for coach review." : "Editing enabled. Review every change before saving."); }} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">{isEditing ? "Finish editing" : "Edit before saving"}</button>
            <button type="button" disabled={!analysis} onClick={() => setStatus("Draft marked uncertain for further coach review.")} className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 disabled:cursor-not-allowed disabled:opacity-40">Mark uncertain</button>
            <button type="button" disabled={!analysis} onClick={() => setStatus("Draft added to the report queue.")} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Add to report</button>
          </div>
          {reviewStatus && <p role="status" className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{reviewStatus}</p>}
        </section>
      </div>
    </PageShell>
  );
}
