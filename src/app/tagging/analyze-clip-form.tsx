"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { SavedClipPlayback } from "@/app/matches/saved-clip-playback";
import {
  saveAnalysisDraftAction,
  type AnalysisSaveState,
} from "@/app/tagging/actions";
import { EmptyState, StatusMessage } from "@/components/workflow-ui";
import { WorkflowSubmitButton } from "@/components/workflow-submit-button";

type SavedClip = {
  id: string;
  title: string;
  playerName: string;
  sessionTitle: string;
  sessionDetail: string;
  timestampOrRange: string | null;
  scoreContext: string | null;
  pressureTrigger: string | null;
  playerPointOutcome: "Won" | "Lost" | "Unknown" | null;
  coachNote: string | null;
  analysisStatus: string;
  reviewStatus: string;
  originalFileName: string;
  createdAt: string;
};

type AnalysisDraft = {
  serveOrReturn: string;
  pointOutcome: string;
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

type AnalyzeClipFormProps = {
  clips: SavedClip[];
};

const INITIAL_SAVE_STATE: AnalysisSaveState = {
  status: "idle",
  message: "",
};

export function AnalyzeClipForm({ clips }: AnalyzeClipFormProps) {
  const [selectedClipId, setSelectedClipId] = useState("");
  const [draft, setDraft] = useState<AnalysisDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [saveState, saveAction] = useActionState(
    saveAnalysisDraftAction,
    INITIAL_SAVE_STATE,
  );
  const selectedClip = useMemo(
    () => clips.find((clip) => clip.id === selectedClipId),
    [clips, selectedClipId],
  );

  function chooseClip(clipId: string) {
    setSelectedClipId(clipId);
    setDraft(null);
    setGenerationError("");
  }

  async function generateDraft() {
    if (!selectedClip || isGenerating) return;
    setGenerationError("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/analyze-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: selectedClip.playerName,
          matchSession: selectedClip.sessionTitle,
          clipSource: selectedClip.originalFileName,
          timestampOrRange: selectedClip.timestampOrRange ?? "",
          scoreContext: selectedClip.scoreContext ?? "",
          pressureTrigger: selectedClip.pressureTrigger ?? "",
          playerPointOutcome: selectedClip.playerPointOutcome ?? "Unknown",
          coachNote: selectedClip.coachNote ?? "",
        }),
      });
      const payload = (await response.json()) as AnalysisDraft & {
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error || "The mock analysis could not be generated.");
      }
      setDraft(payload);
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "The mock analysis could not be generated.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function updateDraft<Key extends keyof AnalysisDraft>(
    key: Key,
    value: AnalysisDraft[Key],
  ) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  }

  if (clips.length === 0) {
    return (
      <section className="surface analyze-empty-page">
        <EmptyState
          title="No saved clips are ready for analysis."
          description="Upload a private clip first. Once it is stored successfully, it will appear here automatically."
          action={<Link href="/clips/upload" className="button-primary">Upload a clip</Link>}
        />
      </section>
    );
  }

  return (
    <div className="analyze-workflow">
      <section className="surface clip-chooser" aria-labelledby="choose-clip-heading">
        <header className="clip-chooser__header">
          <div>
            <h2 id="choose-clip-heading">Choose a saved clip</h2>
            <p>Select private footage before generating or reviewing analysis.</p>
          </div>
          <span>{clips.length} ready clip{clips.length === 1 ? "" : "s"}</span>
        </header>

        <label className="clip-chooser__select">
          <span className="field-label">Saved clip</span>
          <select
            className="field-control"
            value={selectedClipId}
            onChange={(event) => chooseClip(event.target.value)}
          >
            <option value="">Choose a clip…</option>
            {clips.map((clip) => (
              <option key={clip.id} value={clip.id}>
                {clip.playerName} — {clip.title}
              </option>
            ))}
          </select>
        </label>

        <div className="clip-chooser__list">
          {clips.map((clip) => {
            const selected = clip.id === selectedClipId;
            return (
              <button
                key={clip.id}
                type="button"
                aria-pressed={selected}
                className={selected ? "is-selected" : ""}
                onClick={() => chooseClip(clip.id)}
              >
                <div className="clip-choice__identity">
                  <span>{clip.playerName}</span>
                  <strong>{clip.title}</strong>
                  <small>{clip.sessionTitle}</small>
                </div>
                <dl>
                  <div><dt>Score</dt><dd>{clip.scoreContext || "Not added"}</dd></div>
                  <div><dt>Pressure</dt><dd>{clip.pressureTrigger || "Not specified"}</dd></div>
                  <div><dt>Outcome</dt><dd>{clip.playerPointOutcome || "Unknown"}</dd></div>
                </dl>
                <span className={clip.analysisStatus === "not_started" ? "status status-neutral" : "status status-success"}>
                  {formatStatus(clip.analysisStatus)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {!selectedClip ? (
        <section className="analyze-gate">
          <p>Choose a saved clip to reveal its video, match context, and analysis workflow.</p>
        </section>
      ) : (
        <>
          <section className="surface selected-clip" aria-labelledby="selected-clip-heading">
            <header>
              <div>
                <p>{selectedClip.playerName} · {selectedClip.sessionTitle}</p>
                <h2 id="selected-clip-heading">{selectedClip.title}</h2>
                <span>{selectedClip.sessionDetail || "No optional match details added."}</span>
              </div>
              <span className="status status-neutral">{formatStatus(selectedClip.reviewStatus)}</span>
            </header>
            <div className="selected-clip__body">
              <SavedClipPlayback
                clipId={selectedClip.id}
                isReady
                title={selectedClip.title}
              />
              <dl className="selected-clip__context">
                <div><dt>Time</dt><dd>{selectedClip.timestampOrRange || "Full clip"}</dd></div>
                <div><dt>Score</dt><dd>{selectedClip.scoreContext || "Not added"}</dd></div>
                <div><dt>Pressure trigger</dt><dd>{selectedClip.pressureTrigger || "Not specified"}</dd></div>
                <div><dt>Point outcome</dt><dd>{selectedClip.playerPointOutcome || "Unknown"}</dd></div>
              </dl>
            </div>
            <footer className="generate-analysis">
              <div>
                <strong>Generate AI Draft</strong>
                <p>Uses the existing mock endpoint. No video frames or external AI services are processed.</p>
              </div>
              <button
                type="button"
                className="button-primary"
                onClick={generateDraft}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating draft…" : draft ? "Regenerate draft" : "Generate AI Draft"}
              </button>
            </footer>
          </section>

          {generationError && <StatusMessage tone="error">{generationError}</StatusMessage>}

          {draft && (
            <form action={saveAction} className="analysis-review-form">
              <input type="hidden" name="clipId" value={selectedClip.id} />
              <input type="hidden" name="serveOrReturn" value={draft.serveOrReturn} />
              <input type="hidden" name="pointOutcome" value={draft.pointOutcome} />
              <input type="hidden" name="pressurePatternFamily" value={draft.pressurePatternFamily} />
              <input type="hidden" name="confidenceLevel" value={draft.confidenceLevel} />
              <input type="hidden" name="tags" value={draft.tags.join(", ")} />

              <section className="surface ai-draft" aria-labelledby="ai-draft-heading">
                <header className="ai-draft__header">
                  <div>
                    <h2 id="ai-draft-heading">AI Draft Analysis</h2>
                    <p>Review and edit the coaching language before saving.</p>
                  </div>
                  <span className="status status-warning">Mock draft</span>
                </header>

                <div className="analysis-editor">
                  <label className="analysis-editor__lead">
                    <span className="field-label">What happened</span>
                    <textarea
                      className="field-control"
                      name="whatHappened"
                      rows={4}
                      value={draft.primaryPattern}
                      onChange={(event) => updateDraft("primaryPattern", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-label">Breakdown moment</span>
                    <textarea
                      className="field-control"
                      name="breakdownMoment"
                      rows={4}
                      value={draft.likelyBreakdownMoment}
                      onChange={(event) => updateDraft("likelyBreakdownMoment", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-label">Elite comparison</span>
                    <textarea
                      className="field-control"
                      name="eliteComparison"
                      rows={4}
                      value={draft.eliteComparison}
                      onChange={(event) => updateDraft("eliteComparison", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-label">Next-time adjustment</span>
                    <textarea
                      className="field-control"
                      name="nextTimeAdjustment"
                      rows={4}
                      value={draft.nextTimeAdjustment}
                      onChange={(event) => updateDraft("nextTimeAdjustment", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span className="field-label">Training focus</span>
                    <textarea
                      className="field-control"
                      name="trainingFocus"
                      rows={4}
                      value={draft.trainingFocus}
                      onChange={(event) => updateDraft("trainingFocus", event.target.value)}
                      required
                    />
                  </label>
                  <label className="analysis-editor__lead">
                    <span className="field-label">Coaching takeaway</span>
                    <textarea
                      className="field-control"
                      name="coachingTakeaway"
                      rows={4}
                      value={draft.coachingTakeaway}
                      onChange={(event) => updateDraft("coachingTakeaway", event.target.value)}
                      required
                    />
                  </label>
                </div>

                <details className="analysis-evidence">
                  <summary>
                    <span>Supporting observations</span>
                    <span>Decision, execution, and tactical detail</span>
                  </summary>
                  <dl>
                    <div><dt>Decision quality</dt><dd>{draft.decisionQuality}</dd></div>
                    <div><dt>Execution quality</dt><dd>{draft.executionQuality}</dd></div>
                    <div><dt>Missed opportunity</dt><dd>{draft.missedOpportunity}</dd></div>
                    <div><dt>Tactical principle</dt><dd>{draft.tacticalPrinciple}</dd></div>
                  </dl>
                </details>
              </section>

              <section className="surface coach-review" aria-labelledby="coach-review-heading">
                <header>
                  <h2 id="coach-review-heading">Coach Review</h2>
                  <p>Set the review state and add any correction or nuance that should stay with the draft.</p>
                </header>
                <div className="coach-review__fields">
                  <label>
                    <span className="field-label">Review state</span>
                    <select className="field-control" name="reviewStatus" defaultValue="draft">
                      <option value="draft">Save as draft</option>
                      <option value="in_review">In coach review</option>
                      <option value="approved">Approved</option>
                    </select>
                  </label>
                  <label>
                    <span className="field-label">Coach review notes <span>Optional</span></span>
                    <textarea
                      className="field-control"
                      name="coachReviewNotes"
                      rows={4}
                      defaultValue={draft.analysisNotes}
                      placeholder="Correct the draft, add nuance, or note what to verify in the footage."
                    />
                  </label>
                </div>
              </section>

              {saveState.message && saveState.savedClipId === selectedClip.id && (
                <StatusMessage tone={saveState.status === "error" ? "error" : "success"}>
                  {saveState.message}
                </StatusMessage>
              )}
              {saveState.status === "error" && !saveState.savedClipId && (
                <StatusMessage tone="error">{saveState.message}</StatusMessage>
              )}

              <footer className="analysis-save-bar">
                <div>
                  <strong>Save Analysis</strong>
                  <p>The draft remains attached to this owned clip and can be refined later.</p>
                </div>
                <div>
                  {saveState.status === "success" && saveState.savedClipId === selectedClip.id && (
                    <Link href="/reports" className="button-secondary">Open reports</Link>
                  )}
                  <WorkflowSubmitButton
                    idleLabel="Save analysis"
                    pendingLabel="Saving analysis…"
                  />
                </div>
              </footer>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function formatStatus(value: string): string {
  return value.replaceAll("_", " ");
}
