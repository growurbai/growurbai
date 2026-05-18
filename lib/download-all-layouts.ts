import JSZip from "jszip";
import { downloadLayoutImage } from "@/lib/download-layout-image";

function toPngBytes(imageSrc: string): Uint8Array {
  const href = imageSrc.trim().startsWith("data:")
    ? imageSrc
    : `data:image/png;base64,${imageSrc.replace(/\s/g, "")}`;
  const base64 = href.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Bundle all layout PNGs into a single zip and trigger download. */
export async function downloadAllLayoutPlacements(
  layouts: string[],
  zipName = "growurb-brand-kit-placements.zip",
): Promise<void> {
  const ready = layouts.filter((src) => typeof src === "string" && src.length > 0);
  if (ready.length === 0) return;

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
