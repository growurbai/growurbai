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
        <span className="layout-slot-glass-icon" aria-hidden>
          📥
        </span>
        <span className="layout-slot-glass-btn-label">Download</span>
      </button>

      <div className="layout-slot-glass-btn-wrap group/tip relative">
        <button
          type="button"
          className="layout-slot-glass-btn"
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          aria-label="View fullscreen"
        >
          <span className="layout-slot-glass-icon" aria-hidden>
            🔍
          </span>
          <span className="layout-slot-glass-btn-label">Preview</span>
        </button>
        <span className="layout-slot-tooltip" role="tooltip">
          View Fullscreen
        </span>
      </div>
    </div>
  );
}
