import { parseAspectRatio, type GenerateAspectRatio } from "@/lib/aspect-ratio";
import { clampBrandName, clampCoreHook } from "@/lib/brand-context-limits";
import { parseCopyLanguage, type CopyLanguageId } from "@/lib/copy-languages";

/** Client + API payload for POST /api/generate */
export type GenerateRequestOptions = {
  imageBase64: string;
  ratio: GenerateAspectRatio;
  brandName?: string;
  coreHook?: string;
  copyLanguage: CopyLanguageId;
  aiEnhancementMode: boolean;
};

export function parseAiEnhancementMode(body: Record<string, unknown>): boolean {
  if (typeof body.aiEnhancementMode === "boolean") return body.aiEnhancementMode;
  if (typeof body.creativeEnhancement === "boolean") return body.creativeEnhancement;
  return false;
}

export function parseGenerateRequestBody(
  body: unknown,
): GenerateRequestOptions | { error: string; status: number } {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid JSON body", status: 400 };
  }

  const b = body as Record<string, unknown>;
  const imageBase64 = typeof b.imageBase64 === "string" ? b.imageBase64.trim() : "";
  if (!imageBase64) {
    return { error: "Missing required field: imageBase64", status: 400 };
  }

  const brandName =
    typeof b.brandName === "string" && b.brandName.trim().length > 0
      ? clampBrandName(b.brandName.trim())
      : undefined;
  const coreHook =
    typeof b.coreHook === "string" && b.coreHook.trim().length > 0
      ? clampCoreHook(b.coreHook.trim())
      : undefined;

  return {
    imageBase64,
    ratio: parseAspectRatio(b.ratio),
    brandName,
    coreHook,
    copyLanguage: parseCopyLanguage(b.copyLanguage),
    aiEnhancementMode: parseAiEnhancementMode(b),
  };
}
