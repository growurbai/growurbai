export const GENERATION_PROGRESS_MESSAGES = [
  { untilSec: 3, message: "🔍 Analyzing product edges & dimensions..." },
  { untilSec: 8, message: "✂️ Removing original background flawlessly..." },
  { untilSec: 15, message: "🤖 Injecting Luxury Auto-Preset matching themes..." },
  { untilSec: Infinity, message: "✨ Rendering 8K Hasselblad textures..." },
] as const;

export function getGenerationProgressMessage(elapsedSec: number): string {
  for (const step of GENERATION_PROGRESS_MESSAGES) {
    if (elapsedSec < step.untilSec) return step.message;
  }
  return GENERATION_PROGRESS_MESSAGES[GENERATION_PROGRESS_MESSAGES.length - 1]!.message;
}
