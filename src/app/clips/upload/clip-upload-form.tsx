"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { MatchSessionCreateForm } from "@/app/matches/match-session-create-form";
import { PlayerCreateForm } from "@/app/players/player-create-form";
import { VideoFilePicker } from "@/components/video-file-picker";
import {
  EmptyState,
  FormSection,
  InlineCreatePanel,
  StatusMessage,
} from "@/components/workflow-ui";

type PlayerOption = {
  id: string;
  name: string;
};

type SessionOption = {
  id: string;
  playerId: string;
  title: string;
  detail: string;
};

type UploadedClip = {
  id: string;
  title: string;
  originalFileName: string;
  fileSizeBytes: number;
  uploadStatus: "ready";
};

type UploadResponse = {
  clip?: UploadedClip;
  error?: string;
};

type ClipUploadFormProps = {
  players: PlayerOption[];
  sessions: SessionOption[];
};

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export function ClipUploadForm({
  players: initialPlayers,
  sessions: initialSessions,
}: ClipUploadFormProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [sessions, setSessions] = useState(initialSessions);
  const initialPlayerId = initialPlayers[0]?.id ?? "";
  const [playerId, setPlayerId] = useState(initialPlayerId);
  const [matchSessionId, setMatchSessionId] = useState(
    initialSessions.find((session) => session.playerId === initialPlayerId)?.id ??
      "",
  );
  const [showPlayerCreate, setShowPlayerCreate] = useState(
    initialPlayers.length === 0,
  );
  const [showSessionCreate, setShowSessionCreate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploadedClip, setUploadedClip] = useState<UploadedClip | null>(null);
  const [signedUrl, setSignedUrl] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const selectedPlayer = players.find((player) => player.id === playerId);
  const availableSessions = useMemo(
    () => sessions.filter((session) => session.playerId === playerId),
    [playerId, sessions],
  );
  const missingRequirements = [
    !playerId ? "Select or add a player" : null,
    playerId && !matchSessionId ? "Create or select a match session" : null,
    !title.trim() ? "Add a clip title" : null,
    !file ? "Choose a video" : null,
  ].filter((item): item is string => Boolean(item));
  const canUpload = missingRequirements.length === 0 && !isUploading;

  function choosePlayer(nextPlayerId: string) {
    setPlayerId(nextPlayerId);
    setMatchSessionId(
      sessions.find((session) => session.playerId === nextPlayerId)?.id ?? "",
    );
    setShowSessionCreate(false);
    clearOutcome();
  }

  function chooseFile(nextFile: File | null) {
    setFile(nextFile);
    clearOutcome();

    if (nextFile && !title.trim()) {
      setTitle(nextFile.name.replace(/\.[^.]+$/, ""));
    }
  }

  function clearOutcome() {
    setError("");
    setUploadedClip(null);
    setSignedUrl("");
  }

  function handlePlayerCreated(player: PlayerOption) {
    setPlayers((current) => [
      ...current.filter((item) => item.id !== player.id),
      player,
    ]);
    setPlayerId(player.id);
    setMatchSessionId("");
    setShowPlayerCreate(false);
    setShowSessionCreate(true);
    clearOutcome();
  }

  function handleSessionCreated(session: SessionOption) {
    setSessions((current) => [
      ...current.filter((item) => item.id !== session.id),
      session,
    ]);
    setPlayerId(session.playerId);
    setMatchSessionId(session.id);
    setShowSessionCreate(false);
    clearOutcome();
  }

  async function submitUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isUploading) return;

    clearOutcome();
    const validationError = validateSelection(
      file,
      playerId,
      matchSessionId,
      title,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const payload = await sendUpload(formData, setUploadProgress);
      if (!payload.clip) {
        throw new Error(payload.error || "The clip upload did not complete.");
      }
      setUploadedClip(payload.clip);
      setUploadProgress(100);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The clip upload did not complete.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function loadPrivatePreview() {
    if (!uploadedClip) return;

    setError("");
    setIsLoadingPreview(true);
    try {
      const response = await fetch(
        `/api/clips/${encodeURIComponent(uploadedClip.id)}/signed-url`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as {
        error?: string;
        signedUrl?: string;
      };

      if (!response.ok || !payload.signedUrl) {
        throw new Error(payload.error || "The private preview could not load.");
      }
      setSignedUrl(payload.signedUrl);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "The private preview could not load.",
      );
    } finally {
      setIsLoadingPreview(false);
    }
  }

  return (
    <div className="clip-upload-layout">
      <form onSubmit={submitUpload} className="surface clip-upload-workspace">
        <FormSection
          title="Player and match"
          description="Every clip needs a player and an owned match session before it can be stored."
        >
          <div className="field-stack">
            <div className="field-heading">
              <label className="field-label" htmlFor="upload-player">Player <span>Required</span></label>
              <button
                type="button"
                className="button-tertiary button-compact"
                onClick={() => setShowPlayerCreate((open) => !open)}
                disabled={isUploading}
              >
                Add new player
              </button>
            </div>
            <select
              id="upload-player"
              className="field-control"
              name="playerId"
              value={playerId}
              onChange={(event) => choosePlayer(event.target.value)}
              disabled={isUploading || players.length === 0}
              required
            >
              {players.length === 0 && <option value="">No players yet</option>}
              {players.map((player) => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>

          {showPlayerCreate && (
            <InlineCreatePanel
              title="Add a new player"
              description="Create the private roster record, then continue here with the new player selected."
              onClose={() => setShowPlayerCreate(false)}
            >
              <PlayerCreateForm embedded hideIntro onCreated={handlePlayerCreated} />
            </InlineCreatePanel>
          )}

          {playerId && (
            <div className="field-stack">
              <div className="field-heading">
                <label className="field-label" htmlFor="upload-session">Match session <span>Required</span></label>
                {availableSessions.length > 0 && (
                  <button
                    type="button"
                    className="button-tertiary button-compact"
                    onClick={() => setShowSessionCreate((open) => !open)}
                    disabled={isUploading}
                  >
                    Create new session
                  </button>
                )}
              </div>
              <select
                id="upload-session"
                className="field-control"
                name="matchSessionId"
                value={matchSessionId}
                onChange={(event) => {
                  setMatchSessionId(event.target.value);
                  clearOutcome();
                }}
                disabled={isUploading || availableSessions.length === 0}
                required
              >
                {availableSessions.length === 0 ? (
                  <option value="">No match session yet</option>
                ) : (
                  availableSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.title}{session.detail ? ` — ${session.detail}` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {playerId && availableSessions.length === 0 && !showSessionCreate && (
            <EmptyState
              title="No match session exists for this player yet."
              description="Create the required match context here. Your player, title, file, and point context will stay in place."
              action={
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setShowSessionCreate(true)}
                >
                  Create match session
                </button>
              }
            />
          )}

          {playerId && showSessionCreate && (
            <InlineCreatePanel
              title={`Create a session for ${selectedPlayer?.name ?? "this player"}`}
              description="The new session will be selected automatically when it is created."
              onClose={() => setShowSessionCreate(false)}
            >
              <MatchSessionCreateForm
                embedded
                hideIntro
                players={players}
                playerId={playerId}
                onCreated={handleSessionCreated}
              />
            </InlineCreatePanel>
          )}
        </FormSection>

        <FormSection
          title="Clip details"
          description="Name the moment so it is easy to find in saved clips and future reports."
        >
          <label>
            <span className="field-label">Clip title <span>Required</span></span>
            <input
              className="field-control"
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                clearOutcome();
              }}
              maxLength={200}
              placeholder="e.g. Second-set deuce return point"
              disabled={isUploading}
              required
            />
          </label>
          <VideoFilePicker
            file={file}
            onChange={chooseFile}
            disabled={isUploading}
          />
        </FormSection>

        <details className="workflow-disclosure">
          <summary>
            <span>Point context <small>Optional</small></span>
            <span>Add score, pressure, and coaching notes</span>
          </summary>
          <div className="workflow-disclosure__body field-grid">
            <label>
              <span className="field-label">Timestamp or range</span>
              <input
                className="field-control tabular"
                name="timestampOrRange"
                maxLength={100}
                placeholder="e.g. 00:42:12–00:42:24"
                disabled={isUploading}
              />
            </label>
            <label>
              <span className="field-label">Score context</span>
              <input
                className="field-control"
                name="scoreContext"
                maxLength={200}
                placeholder="e.g. 5–5, deuce, second set"
                disabled={isUploading}
              />
            </label>
            <label>
              <span className="field-label">Pressure trigger</span>
              <select className="field-control" name="pressureTrigger" disabled={isUploading}>
                <option value="">Not specified</option>
                {["30-30", "Deuce", "Advantage", "Break Point", "Set Point", "Match Point", "Tiebreak"].map(
                  (value) => <option key={value}>{value}</option>,
                )}
              </select>
            </label>
            <label>
              <span className="field-label">Player point outcome</span>
              <select className="field-control" name="playerPointOutcome" disabled={isUploading}>
                <option value="">Not specified</option>
                <option>Won</option>
                <option>Lost</option>
                <option>Unknown</option>
              </select>
            </label>
            <label className="field-grid__wide">
              <span className="field-label">Coach note</span>
              <textarea
                className="field-control"
                name="coachNote"
                maxLength={5000}
                rows={3}
                placeholder="Add context that is not visible in the footage."
                disabled={isUploading}
              />
            </label>
          </div>
        </details>

        {isUploading && (
          <div className="upload-progress" aria-live="polite">
            <div>
              <strong>{uploadProgress < 100 ? "Uploading private footage" : "Securing clip record"}</strong>
              <span className="tabular">{uploadProgress}%</span>
            </div>
            <progress max="100" value={uploadProgress}>{uploadProgress}%</progress>
            <p>Keep this tab open until the clip is marked ready.</p>
          </div>
        )}

        {error && <StatusMessage tone="error">{error}</StatusMessage>}

        <footer className="workflow-submit">
          <div>
            <strong>{canUpload ? "Ready for private upload" : "Complete the required details"}</strong>
            {missingRequirements.length > 0 ? (
              <ul aria-label="Upload requirements">
                {missingRequirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <p>Ownership and match-session membership are verified on the server.</p>
            )}
          </div>
          <button className="button-primary" type="submit" disabled={!canUpload}>
            {isUploading ? "Uploading securely…" : "Upload private clip"}
          </button>
        </footer>
      </form>

      <aside className="clip-upload-support" aria-label="Upload guidance">
        <section>
          <h2>Private by design</h2>
          <p>The original video stays in private Storage. Playback is opened only with a short-lived signed URL.</p>
          <dl>
            <div><dt>Access</dt><dd>Authenticated owner only</dd></div>
            <div><dt>Formats</dt><dd>MP4, MOV, WebM</dd></div>
            <div><dt>Maximum</dt><dd>100 MB per clip</dd></div>
          </dl>
        </section>
        <section>
          <h2>Workflow</h2>
          <ol>
            <li><span>1</span><p><strong>Add context</strong>Choose the player and required session.</p></li>
            <li><span>2</span><p><strong>Upload privately</strong>Select one supported video.</p></li>
            <li><span>3</span><p><strong>Analyze later</strong>Open the saved clip in Analyze Clip.</p></li>
          </ol>
        </section>
        <section className="upload-status-panel">
          <h2>Upload status</h2>
          <p>{uploadedClip ? "Clip stored and ready for private playback." : isUploading ? `Uploading securely · ${uploadProgress}%` : "Waiting for a complete clip."}</p>
        </section>
      </aside>

      {uploadedClip && (
        <section className="surface upload-success" aria-labelledby="upload-success-heading">
          <div className="upload-success__head">
            <div>
              <span className="status status-success">Stored privately</span>
              <h2 id="upload-success-heading">{uploadedClip.title}</h2>
              <p>{uploadedClip.originalFileName} · {formatBytes(uploadedClip.fileSizeBytes)}</p>
            </div>
            <div className="upload-success__actions">
              <button
                className="button-secondary"
                type="button"
                onClick={loadPrivatePreview}
                disabled={isLoadingPreview}
              >
                {isLoadingPreview ? "Creating preview…" : signedUrl ? "Refresh preview" : "Load private preview"}
              </button>
              <Link href="/tagging" className="button-primary">Analyze saved clip</Link>
            </div>
          </div>

          {signedUrl ? (
            <div className="private-preview">
              <video src={signedUrl} controls preload="metadata">
                Your browser does not support HTML video.
              </video>
              <p>This signed preview expires in five minutes.</p>
            </div>
          ) : (
            <p className="upload-success__hint">
              You can reopen this clip from Matches or continue to Analyze Clip.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function validateSelection(
  file: File | null,
  playerId: string,
  matchSessionId: string,
  title: string,
): string | null {
  if (!playerId) return "Choose a player for this clip.";
  if (!matchSessionId) return "Create or choose a match session for this player.";
  if (!title.trim()) return "Add a title for the clip.";
  if (!file) return "Choose one video file to upload.";
  if (file.size <= 0) return "The selected video is empty.";
  if (file.size > MAX_FILE_BYTES) return "The selected video exceeds 100 MB.";
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Choose an MP4, MOV, or WebM video.";
  }
  return null;
}

function sendUpload(
  formData: FormData,
  onProgress: (progress: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/clips/upload");
    request.responseType = "json";

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    });
    request.addEventListener("load", () => {
      const payload = (request.response ?? {}) as UploadResponse;
      if (request.status >= 200 && request.status < 300) {
        resolve(payload);
        return;
      }
      reject(new Error(payload.error || "The clip upload did not complete."));
    });
    request.addEventListener("error", () => {
      reject(new Error("The network connection interrupted the upload."));
    });
    request.addEventListener("abort", () => {
      reject(new Error("The clip upload was cancelled."));
    });

    request.send(formData);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
