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

const priorityFields: (keyof AnalysisDraft)[] = [
  "primaryPattern",
  "likelyBreakdownMoment",
  "eliteComparison",
  "nextTimeAdjustment",
  "trainingFocus",
  "coachingTakeaway",
];

const detailFields: (keyof AnalysisDraft)[] = [
  "pressurePatternFamily",
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

function formatAnalysisValue(value: AnalysisDraft[keyof AnalysisDraft]) {
  return Array.isArray(value) ? value.join(", ") : value;
}

function parseAnalysisValue(field: keyof AnalysisDraft, value: string) {
  if (field === "tags") {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
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

  function updateContext<Field extends keyof ClipContext>(field: Field, value: ClipContext[Field]) {
    setContext((current) => ({ ...current, [field]: value }));
  }

  function updateAnalysis(field: keyof AnalysisDraft, value: string) {
    setAnalysis((current) => current ? { ...current, [field]: parseAnalysisValue(field, value) } : current);
  }

  async function generateDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setAnalysisError("");
    setReviewStatus("");

    const player = players.find((item) => item.id === context.playerId);
    const matchSession = matchSessions.find((item) => item.id === context.matchSessionId);

    try {
      const response = await fetch("/api/analyze-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: player?.name ?? "Unknown player",
          matchSession: matchSession ? `${matchSession.event} - ${matchSession.date}` : "Unknown match/session",
          clipSource: context.clipLink,
          timestampOrRange: context.timestamp,
          scoreContext: context.scoreContext,
          pressureTrigger: context.pressureTrigger,
          playerPointOutcome: context.playerPointOutcome,
          coachNote: context.coachNote,
        }),
      });

      if (!response.ok) throw new Error("The analysis service returned an error.");

      const draft = (await response.json()) as AnalysisDraft;
      setAnalysis(draft);
      setIsEditing(false);
      setReviewStatus("AI draft generated from the supplied clip context.");
    } catch {
      setAnalysisError("Could not generate the AI draft. Check the clip context and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function setStatus(status: string) {
    setReviewStatus(status);
    setIsEditing(false);
  }

  function AnalysisValue({ field, compact = false }: { field: keyof AnalysisDraft; compact?: boolean }) {
    if (!analysis) return null;
    return (
      <div className={compact ? "analysis-detail" : "analysis-priority"}>
        <dt>{analysisLabels[field]}</dt>
        <dd>
          {isEditing ? (
            <textarea
              value={formatAnalysisValue(analysis[field])}
              onChange={(event) => updateAnalysis(field, event.target.value)}
              rows={compact ? 2 : 3}
              className="field-control"
            />
          ) : (
            formatAnalysisValue(analysis[field])
          )}
        </dd>
      </div>
    );
  }

  return (
    <PageShell
      eyebrow="Pressure-point workflow"
      title="Analyze Clip"
      description="Frame the moment, generate a structured draft, and apply the coach's judgment before the analysis enters the player record."
    >
      <ol className="analysis-steps" aria-label="Analysis workflow">
        {["Clip context", "Generate draft", "AI analysis", "Coach review", "Save"].map((step, index) => (
          <li key={step} className={analysis && index < 3 ? "is-complete" : index === 0 ? "is-current" : ""}>
            <span>{index + 1}</span>{step}
          </li>
        ))}
      </ol>

      <form onSubmit={generateDraft} className="surface analysis-context">
        <div className="analysis-section-head">
          <div>
            <h2 className="section-heading">Clip Context</h2>
            <p className="section-copy">Add what is known. The clip remains the evidence; context helps the draft interpret the pressure correctly.</p>
          </div>
          <span className="status status-neutral">Step 1 of 5</span>
        </div>

        <div className="analysis-form-grid">
          <label>
            <span className="field-label">Player being analyzed</span>
            <select value={context.playerId} onChange={(event) => updateContext("playerId", event.target.value)} className="field-control">
              {players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Match / session</span>
            <select value={context.matchSessionId} onChange={(event) => updateContext("matchSessionId", event.target.value)} className="field-control">
              {matchSessions.map((session) => <option key={session.id} value={session.id}>{session.event} - {session.date}</option>)}
            </select>
          </label>
          <label className="analysis-form-grid__wide">
            <span className="field-label">Clip link</span>
            <input type="url" placeholder="Paste a video or clip link" value={context.clipLink} onChange={(event) => updateContext("clipLink", event.target.value)} className="field-control" />
            <span className="field-hint">Link-based prototype. Uploads are intentionally not enabled yet.</span>
          </label>
          <label>
            <span className="field-label">Timestamp or clip range</span>
            <input value={context.timestamp} onChange={(event) => updateContext("timestamp", event.target.value)} placeholder="e.g. 00:42:12-00:42:24" className="field-control tabular" />
          </label>
          <label>
            <span className="field-label">Score context <span>(if known)</span></span>
            <input value={context.scoreContext} onChange={(event) => updateContext("scoreContext", event.target.value)} placeholder="e.g. 5-5, deuce, second set" className="field-control" />
          </label>
          <label>
            <span className="field-label">Pressure trigger <span>(if known)</span></span>
            <select value={context.pressureTrigger} onChange={(event) => updateContext("pressureTrigger", event.target.value as PressureTrigger | "")} className="field-control">
              <option value="">Not specified</option>
              {PRESSURE_TRIGGERS.map((trigger) => <option key={trigger}>{trigger}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Player point outcome</span>
            <select value={context.playerPointOutcome} onChange={(event) => updateContext("playerPointOutcome", event.target.value as PlayerPointOutcome)} className="field-control">
              {PLAYER_POINT_OUTCOMES.map((outcome) => <option key={outcome}>{outcome}</option>)}
            </select>
          </label>
        </div>

        <details className="optional-context">
          <summary>+ Add an optional coach note</summary>
          <div className="detail-body">
            <label>
              <span className="field-label">Context not visible in the clip</span>
              <textarea value={context.coachNote} onChange={(event) => updateContext("coachNote", event.target.value)} rows={3} placeholder="Add tactical, physical, or match context the draft should consider." className="field-control" />
            </label>
          </div>
        </details>

        <div className="generate-bar">
          <div>
            <strong>Generate AI Draft Analysis</strong>
            <span>Prototype output uses the current in-product analysis service.</span>
          </div>
          <button type="submit" disabled={isGenerating} className="button-primary">
            {isGenerating ? <><span className="loading-dot" aria-hidden="true" /> Generating draft…</> : <>Generate AI Draft <span aria-hidden="true">→</span></>}
          </button>
        </div>
        {analysisError && <p role="alert" className="analysis-error">{analysisError}</p>}
      </form>

      <section className="surface analysis-output" aria-labelledby="draft-heading">
        <div className="analysis-section-head">
          <div>
            <h2 id="draft-heading" className="section-heading">AI Draft Analysis</h2>
            <p className="section-copy">The six coaching-critical observations are prioritized. Detailed point attributes remain available as supporting context.</p>
          </div>
          {analysis && <span className="status status-warning">Coach review required</span>}
        </div>

        {!analysis ? (
          <div className="analysis-empty">
            <span aria-hidden="true">01</span>
            <h3>Your draft will appear here</h3>
            <p>Complete the clip context above, then generate the structured analysis.</p>
          </div>
        ) : (
          <>
            <dl className="analysis-priority-list">
              {priorityFields.map((field) => <AnalysisValue key={field} field={field} />)}
            </dl>
            <details className="analysis-details">
              <summary>
                <span>Detailed point observations</span>
                <span>{detailFields.length} fields <b aria-hidden="true">+</b></span>
              </summary>
              <dl className="detail-body analysis-detail-grid">
                {detailFields.map((field) => <AnalysisValue key={field} field={field} compact />)}
              </dl>
            </details>
          </>
        )}
      </section>

      <section className="review-panel" aria-labelledby="review-heading">
        <div className="review-panel__copy">
          <span className="status status-neutral">Step 4</span>
          <h2 id="review-heading" className="section-heading">Coach Review</h2>
          <p className="section-copy">Accept the draft, refine the language, or mark uncertainty before choosing where this evidence belongs.</p>
          <div className="review-actions">
            <button type="button" disabled={!analysis} onClick={() => setStatus("Draft accepted by coach.")} className="button-primary">Accept draft</button>
            <button type="button" disabled={!analysis} onClick={() => { setIsEditing((current) => !current); setReviewStatus(isEditing ? "Draft refinements retained for coach review." : "Editing enabled. Review every change before saving."); }} className="button-secondary">{isEditing ? "Finish editing" : "Edit draft"}</button>
            <button type="button" disabled={!analysis} onClick={() => setStatus("Draft marked uncertain for further coach review.")} className="button-tertiary">Mark uncertain</button>
          </div>
        </div>
        <div className="review-destination">
          <p>Save destination</p>
          <h3>Keep the evidence connected</h3>
          <span>Save the reviewed analysis to its match, then include it in the player report when ready.</span>
          <button type="button" disabled={!analysis} onClick={() => setStatus("Reviewed analysis saved to the match.")} className="button-secondary">Save to match</button>
          <button type="button" disabled={!analysis} onClick={() => setStatus("Draft added to the report queue.")} className="button-secondary">Add to report</button>
        </div>
      </section>
      {reviewStatus && <p role="status" className="notice analysis-status">{reviewStatus}</p>}
    </PageShell>
  );
}
