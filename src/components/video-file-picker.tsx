"use client";

import { useRef } from "react";

type VideoFilePickerProps = {
  disabled?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
};

export function VideoFilePicker({
  disabled = false,
  file,
  onChange,
}: VideoFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function clearFile() {
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  }

  return (
    <div className={file ? "video-picker video-picker--selected" : "video-picker"}>
      <input
        ref={inputRef}
        className="video-picker__input"
        id="clip-video"
        name="file"
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        disabled={disabled}
        required
      />

      {file ? (
        <>
          <div className="video-picker__selection">
            <span className="video-picker__mark" aria-hidden="true">✓</span>
            <div>
              <strong>{file.name}</strong>
              <span>{formatBytes(file.size)} · Ready to upload</span>
            </div>
          </div>
          <div className="video-picker__actions">
            <label className="button-secondary" htmlFor="clip-video">
              Change video
            </label>
            <button
              type="button"
              className="button-tertiary"
              onClick={clearFile}
              disabled={disabled}
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <>
          <div>
            <strong className="video-picker__title">Choose a video</strong>
            <p>MP4, MOV, or WebM · Maximum 100 MB</p>
            <span>Uploaded privately and available only through expiring playback links.</span>
          </div>
          <label className="button-secondary" htmlFor="clip-video">
            Select video
          </label>
        </>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
