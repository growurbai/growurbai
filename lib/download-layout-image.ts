/** Trigger a high-res PNG download from a data URL or raw base64 string. */
export function downloadLayoutImage(
  imageSrc: string,
  filename = "growurb-layout.png",
): void {
  const href = imageSrc.trim().startsWith("data:")
    ? imageSrc
    : `data:image/png;base64,${imageSrc.replace(/\s/g, "")}`;

  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}
