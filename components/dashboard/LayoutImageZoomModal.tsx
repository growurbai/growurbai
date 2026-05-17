"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getLayoutAspectStyle,
  getLayoutAspectTailwindClass,
  type GenerateAspectRatio,
} from "@/lib/aspect-ratio";

type LayoutImageZoomModalProps = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  ratio: GenerateAspectRatio;
  title: string;
};

const MODAL_MAX_WIDTH: Record<GenerateAspectRatio, string> = {
  "1:1": "min(92vw, 640px)",
  "4:5": "min(92vw, 520px)",
  "9:16": "min(92vw, 380px)",
  "16:9": "min(92vw, 960px)",
};

export function LayoutImageZoomModal({
  open,
  onClose,
  imageSrc,
  ratio,
  title,
}: LayoutImageZoomModalProps) {
  const aspectClass = getLayoutAspectTailwindClass(ratio);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="layout-zoom-modal fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} fullscreen preview`}
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        className="layout-zoom-close absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-zinc-300 backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 hover:text-white sm:right-6 sm:top-6"
        onClick={onClose}
        aria-label="Close preview"
      >
        <CloseIcon />
      </button>

      <div
        className={`layout-zoom-modal-frame ${aspectClass} layout-zoom-modal-frame--enter`}
        style={{
          ...getLayoutAspectStyle(ratio),
          maxWidth: MODAL_MAX_WIDTH[ratio],
          maxHeight: "min(88vh, 900px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={`${title} full resolution`}
          className="layout-zoom-modal-image block h-full w-full object-contain"
          draggable={false}
        />
      </div>

      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[11px] font-medium tracking-wide text-zinc-500">
        {title} · {ratio}
      </p>
    </div>,
    document.body,
  );
}

/* Tailwind JIT anchors — do not remove */
void ("backdrop-blur-xl bg-black/70" as const);

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
