import sharp from "sharp";

type SvgBuilder = (width: number, height: number) => string;

const LAYOUT_BACKGROUNDS: readonly SvgBuilder[] = [
  (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="m1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="45%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <radialGradient id="m2" cx="72%" cy="18%" r="58%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="m3" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f1f5f9" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#m1)"/>
  <rect width="100%" height="100%" fill="url(#m2)"/>
  <rect width="100%" height="100%" fill="url(#m3)"/>
</svg>`.trim(),

  (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="n1" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="50%" stop-color="#14532d"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${Math.max(w, h) * 0.04}"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#n1)"/>
  <circle cx="${w * 0.22}" cy="${h * 0.28}" r="${Math.max(w, h) * 0.28}" fill="#4ade80" opacity="0.22" filter="url(#blur)"/>
  <circle cx="${w * 0.78}" cy="${h * 0.72}" r="${Math.max(w, h) * 0.22}" fill="#22c55e" opacity="0.18" filter="url(#blur)"/>
  <circle cx="${w * 0.52}" cy="${h * 0.48}" r="${Math.max(w, h) * 0.14}" fill="#86efac" opacity="0.12" filter="url(#blur)"/>
</svg>`.trim(),

  (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fafafa"/>
      <stop offset="100%" stop-color="#e5e5e5"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g1)"/>
</svg>`.trim(),

  (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="d1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#312e81"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
    <radialGradient id="d2" cx="30%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#6d28d9" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#d1)"/>
  <rect width="100%" height="100%" fill="url(#d2)"/>
</svg>`.trim(),
];

export async function buildFourLayoutPngsBase64(
  transparentPng: Buffer
): Promise<[string, string, string, string]> {
  const meta = await sharp(transparentPng).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  const fg = await sharp(transparentPng).ensureAlpha().png().toBuffer();

  const out: string[] = [];
  for (const buildSvg of LAYOUT_BACKGROUNDS) {
    const svg = Buffer.from(buildSvg(w, h));
    const bg = await sharp(svg).png().toBuffer();
    const composed = await sharp(bg)
      .composite([{ input: fg, blend: "over" }])
      .png()
      .toBuffer();
    out.push(composed.toString("base64"));
  }
  return out as [string, string, string, string];
}
