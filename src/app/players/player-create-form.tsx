"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createPlayerAction,
  type CreationActionState,
} from "@/app/player-workflow/actions";
import { WorkflowSubmitButton } from "@/components/workflow-submit-button";

const INITIAL_STATE: CreationActionState = { status: "idle", message: "" };

type PlayerCreateFormProps = {
  embedded?: boolean;
  hideIntro?: boolean;
  onCreated?: (player: { id: string; name: string }) => void;
};

export function PlayerCreateForm({
  embedded = false,
  hideIntro = false,
  onCreated,
}: PlayerCreateFormProps) {
  const [state, formAction] = useActionState(createPlayerAction, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const notifiedPlayerId = useRef("");

  useEffect(() => {
    if (state.status !== "success" || !state.createdPlayer) return;
    formRef.current?.reset();
    if (notifiedPlayerId.current === state.createdPlayer.id) return;
    notifiedPlayerId.current = state.createdPlayer.id;
    onCreated?.(state.createdPlayer);
  }, [onCreated, state]);

  return (
    <section
      className={embedded ? "workflow-create workflow-create--embedded" : "surface workflow-create"}
      aria-label={hideIntro ? "Add a player" : undefined}
      aria-labelledby={hideIntro ? undefined : "create-player-heading"}
    >
      {!hideIntro && (
        <div className="workflow-create__intro">
          <div>
            <h2 id="create-player-heading" className="section-heading">Add a player</h2>
            <p className="section-copy">
              Create the player record that will own future sessions and clips.
            </p>
          </div>
          <span className="status status-neutral">Private roster</span>
        </div>
      )}

      <form ref={formRef} action={formAction} className="workflow-create__form">
        <div className="workflow-form-grid">
          <label>
            <span className="field-label">Display name</span>
            <input
              className="field-control"
              name="displayName"
              maxLength={120}
              autoComplete="off"
              placeholder="e.g. Maya Chen"
              required
            />
          </label>
          <label>
            <span className="field-label">Dominant hand <span>(optional)</span></span>
            <select className="field-control" name="dominantHand" defaultValue="">
              <option value="">Not specified</option>
              <option value="right">Right</option>
              <option value="left">Left</option>
              <option value="ambidextrous">Ambidextrous</option>
            </select>
          </label>
          <label className="workflow-form-grid__wide">
            <span className="field-label">Notes <span>(optional)</span></span>
            <textarea
              className="field-control"
              name="notes"
              maxLength={5000}
              rows={3}
              placeholder="Add coaching context that should travel with this player record."
            />
          </label>
        </div>

        <div className="workflow-create__actions">
          <WorkflowSubmitButton idleLabel="Add player" pendingLabel="Adding player…" />
          <span>Ownership is assigned from your signed-in session.</span>
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
    </section>
  );
}
