"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import {
  createMatchSessionAction,
  type CreationActionState,
} from "@/app/player-workflow/actions";
import { WorkflowSubmitButton } from "@/components/workflow-submit-button";

type PlayerOption = {
  id: string;
  name: string;
};

type MatchSessionCreateFormProps = {
  embedded?: boolean;
  hideIntro?: boolean;
  onCreated?: (session: {
    id: string;
    playerId: string;
    title: string;
    detail: string;
  }) => void;
  playerId?: string;
  players: PlayerOption[];
};

const INITIAL_STATE: CreationActionState = { status: "idle", message: "" };

export function MatchSessionCreateForm({
  embedded = false,
  hideIntro = false,
  onCreated,
  playerId,
  players,
}: MatchSessionCreateFormProps) {
  const [state, formAction] = useActionState(
    createMatchSessionAction,
    INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const notifiedSessionId = useRef("");
  const selectedPlayer = playerId
    ? players.find((player) => player.id === playerId)
    : undefined;

  useEffect(() => {
    if (state.status !== "success" || !state.createdSession) return;
    formRef.current?.reset();
    if (notifiedSessionId.current === state.createdSession.id) return;
    notifiedSessionId.current = state.createdSession.id;
    onCreated?.(state.createdSession);
  }, [onCreated, state]);

  return (
    <section
      className={embedded ? "workflow-create workflow-create--embedded" : "surface workflow-create"}
      aria-label={hideIntro ? "Create a match session" : undefined}
      aria-labelledby={hideIntro ? undefined : "create-session-heading"}
    >
      {!hideIntro && (
        <div className="workflow-create__intro">
          <div>
            <h2 id="create-session-heading" className="section-heading">Create a match session</h2>
            <p className="section-copy">
              Give every uploaded clip a required match, practice, or review context.
            </p>
          </div>
          <span className="status status-neutral">Required for upload</span>
        </div>
      )}

      {players.length === 0 ? (
        <div className="workflow-create__empty">
          <p>Add a player before creating a match session.</p>
          <Link href="/players" className="button-secondary">Open players</Link>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="workflow-create__form">
          <div className="workflow-form-grid">
            {selectedPlayer ? (
              <div className="workflow-player-context">
                <span className="field-label">Player</span>
                <strong>{selectedPlayer.name}</strong>
                <input type="hidden" name="playerId" value={selectedPlayer.id} />
              </div>
            ) : (
              <label>
                <span className="field-label">Player</span>
                <select className="field-control" name="playerId" required>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              <span className="field-label">Session title</span>
              <input
                className="field-control"
                name="title"
                maxLength={200}
                placeholder="e.g. Regional semifinal"
                required
              />
            </label>
          </div>

          <details className="workflow-create__optional">
            <summary>Optional match details</summary>
            <div className="detail-body workflow-form-grid">
              <label>
                <span className="field-label">Opponent</span>
                <input className="field-control" name="opponent" maxLength={200} />
              </label>
              <label>
                <span className="field-label">Event</span>
                <input className="field-control" name="eventName" maxLength={200} />
              </label>
              <label>
                <span className="field-label">Surface</span>
                <select className="field-control" name="surface" defaultValue="">
                  <option value="">Not specified</option>
                  <option>Hard</option>
                  <option>Clay</option>
                  <option>Grass</option>
                  <option>Indoor Hard</option>
                </select>
              </label>
              <label>
                <span className="field-label">Date</span>
                <input className="field-control" name="sessionDate" type="date" />
              </label>
              <label className="workflow-form-grid__wide">
                <span className="field-label">Notes</span>
                <textarea
                  className="field-control"
                  name="notes"
                  maxLength={5000}
                  rows={3}
                />
              </label>
            </div>
          </details>

          <div className="workflow-create__actions">
            <WorkflowSubmitButton
              idleLabel="Create match session"
              pendingLabel="Creating session…"
            />
            <span>The selected player is verified again on the server.</span>
          </div>

          {state.message && (
            <p
              className={`workflow-form-message workflow-form-message--${state.status}`}
              role={state.status === "error" ? "alert" : "status"}
            >
              {state.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
