"use client";

import { useState } from "react";

type SavedClipPlaybackProps = {
  clipId: string;
  isReady: boolean;
  title: string;
};

type SignedPlaybackResponse = {
  error?: string;
  expiresIn?: number;
  signedUrl?: string;
};

export function SavedClipPlayback({
  clipId,
  isReady,
  title,
}: SavedClipPlaybackProps) {
  const [signedUrl, setSignedUrl] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPrivateVideo() {
    if (!isReady || isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/clips/${encodeURIComponent(clipId)}/signed-url`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as SignedPlaybackResponse;

      if (!response.ok || !payload.signedUrl) {
        throw new Error(payload.error || "The private video could not be opened.");
      }

      setSignedUrl(payload.signedUrl);
      setExpiresIn(payload.expiresIn ?? 300);
    } catch (playbackError) {
      setSignedUrl("");
      setExpiresIn(0);
      setError(
        playbackError instanceof Error
          ? playbackError.message
          : "The private video could not be opened.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!isReady) {
    return (
      <div className="saved-clip-playback saved-clip-playback--pending">
        <p>This clip is not ready for private playback yet.</p>
      </div>
    );
  }

  return (
    <div className="saved-clip-playback">
      <div className="saved-clip-playback__head">
        <div>
          <h4>Private video</h4>
          <p>A fresh playback link is created only when you request it.</p>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={openPrivateVideo}
          disabled={isLoading}
        >
          {isLoading
            ? "Opening securely…"
            : signedUrl
              ? "Refresh private link"
              : "Open private video"}
        </button>
      </div>

      {error && <p className="saved-clip-playback__error" role="alert">{error}</p>}

      {signedUrl && (
        <div className="saved-clip-playback__video">
          <video src={signedUrl} controls preload="metadata" aria-label={title}>
            Your browser does not support HTML video.
          </video>
          <p role="status">
            This playback link expires in {Math.round(expiresIn / 60)} minutes.
          </p>
        </div>
      )}
    </div>
  );
}
