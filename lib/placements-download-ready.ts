const REQUIRED_PLACEMENT_COUNT = 4;

/** True only when results are shown and all four layout image payloads are present. */
export function arePlacementsDownloadReady(
  showResults: boolean,
  layoutImages: string[] | null | undefined,
): boolean {
  if (!showResults || layoutImages == null || layoutImages.length !== REQUIRED_PLACEMENT_COUNT) {
    return false;
  }
  return layoutImages.every(
    (src) => typeof src === "string" && src.trim().length > 0,
  );
}
