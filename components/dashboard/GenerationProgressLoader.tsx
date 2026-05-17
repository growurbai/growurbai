"use client";

type GenerationProgressLoaderProps = {
  message: string;
  layoutLabel: string;
};

/** Glassmorphic in-slot loader with glowing border and status ticker. */
export function GenerationProgressLoader({
  message,
  layoutLabel,
}: GenerationProgressLoaderProps) {
  return (
    <div
      className="layout-gen-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`${layoutLabel}: ${message}`}
    >
      <span className="layout-gen-loader-border" aria-hidden />
      <span className="layout-gen-loader-border layout-gen-loader-border--delay" aria-hidden />

      <div className="layout-gen-loader-glass">
        <div className="layout-gen-loader-orbit" aria-hidden>
          <span className="layout-gen-loader-dot" />
          <span className="layout-gen-loader-dot layout-gen-loader-dot--2" />
          <span className="layout-gen-loader-dot layout-gen-loader-dot--3" />
        </div>

        <p key={message} className="layout-gen-status-text">
          {message}
        </p>
      </div>
    </div>
  );
}
