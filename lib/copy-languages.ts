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

const COPY_LANGUAGE_IDS = new Set<CopyLanguageId>(
  COPY_LANGUAGE_OPTIONS.map((o) => o.id),
);

export function parseCopyLanguage(value: unknown): CopyLanguageId {
  if (typeof value === "string" && COPY_LANGUAGE_IDS.has(value as CopyLanguageId)) {
    return value as CopyLanguageId;
  }
  return DEFAULT_COPY_LANGUAGE;
}

export function getCopyLanguageLabel(id: CopyLanguageId): string {
  return COPY_LANGUAGE_OPTIONS.find((o) => o.id === id)?.label ?? "English 🇬🇧";
}

/** Strict LLM directive for omni-channel ad copy language / vibe. */
export function getCopyLanguageDirective(language: CopyLanguageId): string {
  switch (language) {
    case "hi":
      return [
        "LANGUAGE (mandatory): Write facebookAd, instagramCaption, googleAd, and pdpBullets entirely in Hindi using Devanagari script.",
        "Tone: premium Indian D2C, natural and persuasive — not literal word-for-word translation from English.",
      ].join(" ");
    case "hinglish":
      return [
        "LANGUAGE (mandatory): Write all four fields in Hinglish — authentic Hindi–English code-mixing as used on Indian Instagram and Meta ads.",
        "Blend Hindi phrases with English commerce terms (COD, launch, limited stock) where creators actually would.",
        "Avoid stiff formal Hindi-only or pure English-only output.",
      ].join(" ");
    case "es":
      return [
        "LANGUAGE (mandatory): Write all four fields entirely in Spanish (neutral/global Spanish, premium brand voice).",
        "Adapt India-market logistics references only if they fit; otherwise use universal e-commerce urgency.",
      ].join(" ");
    case "de":
      return [
        "LANGUAGE (mandatory): Write all four fields entirely in German (premium Sie-tone or neutral brand voice as appropriate for luxury retail).",
      ].join(" ");
    default:
      return [
        "LANGUAGE (mandatory): Write all four fields in fluent English with India-aware D2C nuance where relevant.",
      ].join(" ");
  }
}
