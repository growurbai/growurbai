"use client";

import { useEffect, useRef, useState } from "react";
import {
  COPY_LANGUAGE_OPTIONS,
  type CopyLanguageId,
  getCopyLanguageLabel,
} from "@/lib/copy-languages";

type CopyLanguageSelectorProps = {
  value: CopyLanguageId;
  onChange: (id: CopyLanguageId) => void;
  disabled?: boolean;
};

export function CopyLanguageSelector({
  value,
  onChange,
  disabled = false,
}: CopyLanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="copy-lang-selector relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select creative copy language"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs font-medium text-zinc-200 backdrop-blur-md transition hover:border-white/20 hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="max-w-[7.5rem] truncate sm:max-w-none">
          {getCopyLanguageLabel(value)}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <ul
        role="listbox"
        aria-label="Creative copy languages"
        className={`copy-lang-selector-menu absolute right-0 top-full z-30 mt-1.5 min-w-[10.5rem] overflow-hidden rounded-lg border border-white/10 bg-black/90 py-1 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        {COPY_LANGUAGE_OPTIONS.map((opt) => {
          const selected = opt.id === value;
          return (
            <li key={opt.id} role="option" aria-selected={selected}>
              <button
                type="button"
                className={`flex w-full items-center px-3 py-2 text-left text-xs transition ${
                  selected
                    ? "bg-electric/20 font-semibold text-white"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                }`}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
