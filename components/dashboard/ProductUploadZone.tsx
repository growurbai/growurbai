"use client";

import { useCallback, useEffect, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

type UploadCycleState =
  | "idle"
  | "dragging"
  | "file-selected"
  | "uploading"
  | "success"
  | "error";

type ProductUploadZoneProps = {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  uploadError?: string | null;
  onUploadError?: (message: string | null) => void;
  disabled?: boolean;
};

function isAcceptedImage(file: File): boolean {
  return (
    file.type.startsWith("image/") &&
    (ACCEPTED_TYPES.includes(file.type) || /\.(png|jpe?g)$/i.test(file.name))
  );
}

export function ProductUploadZone({
  file,
  previewUrl,
  onFileChange,
  uploadError,
  onUploadError,
  disabled = false,
}: ProductUploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadCycleState>(
    file ? "success" : "idle",
  );

  const dragActive = uploadState === "dragging";
  const uploadBusy = uploadState === "uploading";

  useEffect(() => {
    if (uploadError) {
      setUploadState("error");
      return;
    }
    if (file && uploadState !== "uploading") {
      setUploadState("success");
    }
    if (!file && uploadState === "success") {
      setUploadState("idle");
    }
  }, [file, uploadError, uploadState]);

  const applyFile = useCallback(
    (candidate: File | undefined) => {
      if (disabled || !candidate) return;
      if (!isAcceptedImage(candidate)) {
        setUploadState("error");
        onUploadError?.("Please upload a PNG or JPG image.");
        return;
      }
      if (candidate.size > MAX_BYTES) {
        setUploadState("error");
        onUploadError?.("Image must be 10MB or smaller.");
        return;
      }
      setUploadState("file-selected");
      onUploadError?.(null);
      window.setTimeout(() => {
        setUploadState("uploading");
        window.setTimeout(() => {
          onFileChange(candidate);
          setUploadState("success");
        }, 180);
      }, 80);
    },
    [disabled, onFileChange, onUploadError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      setUploadState(file ? "file-selected" : "idle");
      applyFile(e.dataTransfer.files?.[0]);
    },
    [applyFile, disabled, file],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyFile(e.target.files?.[0]);
    },
    [applyFile],
  );

  return (
    <div className="space-y-2">
      <div
        role="presentation"
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setUploadState("dragging");
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setUploadState("dragging");
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setUploadState(file ? "file-selected" : "idle");
        }}
        onDrop={handleDrop}
        className={`dash-upload-shell group/dash-upload rounded-[1.35rem] border-2 border-dashed p-[3px] transition-all duration-300 ${
          dragActive
            ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse"
            : "border-white/[0.14] bg-white/[0.02] hover:border-electric/55 hover:shadow-[0_0_36px_-8px_rgba(124,58,237,0.45)]"
        }`}
      >
        <div className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.08] bg-black/35 backdrop-blur-md">
          {uploadBusy ? (
            <div
              className="flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[280px]"
              role="status"
              aria-live="polite"
            >
              <span className="mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-electric" />
              <span className="text-sm font-semibold text-white">Preparing upload preview…</span>
              <span className="mt-2 text-xs text-zinc-500">Validating format and size limit.</span>
            </div>
          ) : previewUrl ? (
            <div className="animate-dash-preview-in relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded product preview"
                className="max-h-[280px] w-full object-contain sm:max-h-[320px]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-4 pb-4 pt-16">
                <p className="truncate text-xs font-medium text-zinc-300">{file?.name}</p>
                <button
                  type="button"
                  onClick={() => {
                    onUploadError?.(null);
                    setUploadState("idle");
                    onFileChange(null);
                  }}
                  className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gold transition hover:text-amber-300"
                >
                  Replace image
                </button>
              </div>
            </div>
          ) : (
            <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[280px]">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="sr-only"
                onChange={handleFileInput}
                disabled={disabled}
              />
              <span
                className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 ${
                  dragActive
                    ? "scale-110 border-purple-400/50 bg-purple-500/15 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    : "group-hover/dash-upload:-translate-y-1 group-hover/dash-upload:border-electric/30 group-hover/dash-upload:shadow-[0_0_18px_rgba(124,58,237,0.25)]"
                }`}
              >
                <svg
                  className="h-8 w-8 text-electric-glow"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.15}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-9 3.75l4.72-6.928"
                  />
                  <circle cx={12} cy={8} r={2} />
                </svg>
              </span>
              <span className="text-sm font-semibold text-white">
                Drop your catalog shot here
              </span>
              <span className="mt-2 text-xs text-zinc-500">or tap anywhere to browse files</span>
            </label>
          )}
        </div>
      </div>

      <p className="px-0.5 text-[11px] leading-relaxed text-zinc-500">
        Supports PNG, JPG, JPEG (Max 10MB) — Transparent or high-contrast backgrounds preferred for 8K
        studio rendering.
      </p>

      <p className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
        Upload state: {uploadState.replace("-", " ")}
      </p>

      {uploadError ? (
        <p role="alert" className="text-[11px] font-medium text-red-300/90">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

/* Tailwind JIT anchors — do not remove */
void (
  "border-purple-500 bg-purple-500/10 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.4)]" as const
);
