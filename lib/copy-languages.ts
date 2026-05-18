export type CopyLanguageId = "en" | "hi" | "hinglish" | "es" | "de";

export type CopyLanguageOption = {
  id: CopyLanguageId;
  label: string;
};

export const COPY_LANGUAGE_OPTIONS: CopyLanguageOption[] = [
  { id: "en", label: "English 🇬🇧" },
  { id: "hi", label: "Hindi 🇮🇳" },
  { id: "hinglish", label: "Hinglish 🇮🇳" },
  { id: "es", label: "Spanish 🇪🇸" },
  { id: "de", label: "German 🇩🇪" },
];

export const DEFAULT_COPY_LANGUAGE: CopyLanguageId = "en";

export function getCopyLanguageLabel(id: CopyLanguageId): string {
  return COPY_LANGUAGE_OPTIONS.find((o) => o.id === id)?.label ?? "English 🇬🇧";
}
