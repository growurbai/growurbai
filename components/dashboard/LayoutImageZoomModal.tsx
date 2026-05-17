"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getLayoutAspectStyle,
  getLayoutAspectTailwindClass,
  type GenerateAspectRatio,
} from "@/lib/aspect-ratio";
import { downloadLayoutImage } from "@/lib/download-layout-image";

type LayoutImageZoomModalProps = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  ratio: GenerateAspectRatio;
  title: string;
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

  const safeName = title.toLowerCase().replace(/\s+/g, "-");

  return createPortal(
    <div
      className="layout-zoom-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} fullscreen preview`}
      onClick={handleBackdropClick}
    >
      <div className="layout-zoom-modal-inner">
        <header className="layout-zoom-modal-header">
          <div>
            <p className="layout-zoom-modal-eyebrow">Fullscreen preview</p>
            <h2 className="layout-zoom-modal-title">{title}</h2>
            <p className="layout-zoom-modal-ratio">{ratio} · High resolution</p>
          </div>
          <div className="layout-zoom-modal-actions">
            <button
              type="button"
              className="layout-zoom-modal-btn"
              onClick={() => downloadLayoutImage(imageSrc, `growurb-${safeName}.png`)}
            >
              <DownloadIcon />
              Download
            </button>
            <button
              type="button"
              className="layout-zoom-modal-btn layout-zoom-modal-btn--close"
              onClick={onClose}
              aria-label="Close preview"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div
          className={`layout-zoom-modal-frame ${aspectClass}`}
          style={getLayoutAspectStyle(ratio)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={`${title} full resolution`}
            className="layout-zoom-modal-image"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
