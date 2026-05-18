import JSZip from "jszip";
import { downloadLayoutImage } from "@/lib/download-layout-image";

export function normalizeLayoutImageSrc(imageSrc: string): string {
  const trimmed = imageSrc.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:image/png;base64,${trimmed.replace(/\s/g, "")}`;
}

function toPngBytes(imageSrc: string): Uint8Array {
  const href = normalizeLayoutImageSrc(imageSrc);
  const base64 = href.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Download each layout as an individual PNG (browser-native saves). */
export async function downloadAllLayoutsSequentially(
  layouts: string[],
  baseName = "growurb-layout",
): Promise<void> {
  const ready = layouts.filter((src) => typeof src === "string" && src.length > 0);
  for (let i = 0; i < ready.length; i += 1) {
    downloadLayoutImage(normalizeLayoutImageSrc(ready[i]!), `${baseName}-${i + 1}.png`);
    if (i < ready.length - 1) {
      await delay(280);
    }
  }
}

/** Bundle all layout PNGs into a single zip and trigger download. */
export async function downloadAllLayoutPlacements(
  layouts: string[],
  zipName = "growurb-brand-kit-placements.zip",
): Promise<void> {
  const ready = layouts
    .filter((src) => typeof src === "string" && src.length > 0)
    .map(normalizeLayoutImageSrc);

  if (ready.length === 0) {
    throw new Error("No placement images available to download.");
  }

  if (ready.length === 1) {
    downloadLayoutImage(ready[0]!, "growurb-layout-1.png");
    return;
  }

  const zip = new JSZip();
  ready.forEach((src, index) => {
    zip.file(`growurb-layout-${index + 1}.png`, toPngBytes(src), { binary: true });
  });

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = zipName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Zip download with sequential PNG fallback if bundling fails. */
export async function downloadAllLayoutsWithFallback(
  layouts: string[],
  zipName: string,
): Promise<"zip" | "sequential"> {
  const baseName = zipName.replace(/\.zip$/i, "") || "growurb-brand-kit";
  try {
    await downloadAllLayoutPlacements(layouts, zipName.endsWith(".zip") ? zipName : `${zipName}.zip`);
    return "zip";
  } catch {
    await downloadAllLayoutsSequentially(layouts, baseName);
    return "sequential";
  }
}
