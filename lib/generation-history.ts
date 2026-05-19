import { getCopyLanguageLabel } from "@/lib/copy-languages";
import type { GenerateSuccessResponse } from "@/lib/generate-api-types";
import type { GenerateRequestOptions } from "@/lib/generate-request";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type GenerationHistoryRecord = {
  id: string;
  user_id: string;
  image_url: string;
  prompt: string | null;
  aspect_ratio: string | null;
  created_at: string;
};

function normalizeImageUrl(image: string): string {
  const trimmed = image.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:image/png;base64,${trimmed.replace(/\s/g, "")}`;
}

function buildHistoryPrompt(
  options: GenerateRequestOptions,
  payload: Omit<GenerateSuccessResponse, "updatedCredits">,
): string {
  const parts = [
    options.brandName ? `Brand: ${options.brandName}` : null,
    options.coreHook ? `Campaign hook: ${options.coreHook}` : null,
    `Detected category: ${payload.detectedCategory}`,
    payload.autoStylePresetLabel ? `Style preset: ${payload.autoStylePresetLabel}` : null,
    `Aspect ratio: ${payload.ratio ?? options.ratio}`,
    `Copy language: ${getCopyLanguageLabel(payload.copyLanguage ?? options.copyLanguage)}`,
    options.aiEnhancementMode ? "Creative enhancement: enabled" : "Creative enhancement: standard",
    payload.productAnalysis ? `Analysis: ${payload.productAnalysis}` : null,
  ].filter(Boolean);

  return parts.join("\n");
}

export async function logGenerationHistory(params: {
  userId: string;
  options: GenerateRequestOptions;
  payload: Omit<GenerateSuccessResponse, "updatedCredits">;
}): Promise<void> {
  const firstLayout = params.payload.layoutImages[0];
  if (!firstLayout) return;

  try {
    const admin = createAdminSupabaseClient();
    const { error } = await admin.from("generations").insert({
      user_id: params.userId,
      image_url: normalizeImageUrl(firstLayout),
      prompt: buildHistoryPrompt(params.options, params.payload),
      aspect_ratio: params.payload.ratio ?? params.options.ratio,
    });

    if (error) {
      console.warn("generation history insert failed", error.message);
    }
  } catch (err) {
    console.warn("generation history unavailable", err);
  }
}
