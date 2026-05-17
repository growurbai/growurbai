"use client";

type LayoutSlotHoverControlsProps = {
  onDownload: () => void;
  onZoom: () => void;
};

export function LayoutSlotHoverControls({
  onDownload,
  onZoom,
}: LayoutSlotHoverControlsProps) {
  return (
    <div
      className="layout-slot-hover-controls"
      aria-label="Layout image actions"
    >
      <button
        type="button"
        className="layout-slot-glass-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDownload();
        }}
        aria-label="Download high resolution image"
        title="Download"
      >
        <DownloadIcon />
        <span className="layout-slot-glass-btn-label">Download</span>
      </button>
      <button
        type="button"
        className="layout-slot-glass-btn"
        onClick={(e) => {
          e.stopPropagation();
          onZoom();
        }}
        aria-label="View fullscreen"
        title="View Fullscreen"
      >
        <ZoomIcon />
        <span className="layout-slot-glass-btn-label">View Fullscreen</span>
      </button>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
      />
    </svg>
  );
}
