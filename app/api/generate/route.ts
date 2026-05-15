import { NextResponse } from "next/server";
import type { GenerateAdCopy } from "@/lib/generate-api-types";
import sharp from "sharp";

export const maxDuration = 120;

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/edits";
const OUTPUT_SIZE = 1024;
const HEADLINE_FONT_PX = 48;
const EDGE_PADDING = 50;
const CTA_HEIGHT = 54;
const CTA_WIDTH = 280;
const PURPLE_CTA = "#7c3aed";

type CategoryKey =
  | "Skincare"
  | "Electronics"
  | "Fashion"
  | "Jewelry"
  | "Food"
  | "Automotive"
  | "Default";

type VisionAnalysis = {
  detailedAnalysis: string;
  detectedCategory: CategoryKey;
  brandName: string | null;
  colors: string[];
  mood: string;
  targetAudience: string;
  productDescription: string;
};

function stripDataUrl(input: string): { base64: string; mime: string } {
  const trimmed = input.trim();
  const m = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (m?.[1] && m[2]) return { mime: m[1], base64: m[2].replace(/\s/g, "") };
  return { mime: "image/jpeg", base64: trimmed.replace(/\s/g, "") };
}

function parseJsonFromAssistantContent(raw: string): unknown {
  let s = raw.trim();
  const fenced = s.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (fenced?.[1]) s = fenced[1].trim();
  return JSON.parse(s) as unknown;
}

function isAdCopy(value: unknown): value is GenerateAdCopy {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.facebookAd === "string" &&
    typeof o.instagramCaption === "string" &&
    typeof o.googleAd === "string" &&
    typeof o.pdpBullets === "string"
  );
}

function truncateMessage(input: string, max = 900): string {
  return input.length <= max ? input : `${input.slice(0, max)}...`;
}

function ensureImageDataUrl(imageBase64: string): string {
  const { base64, mime } = stripDataUrl(imageBase64);
  return `data:${mime || "image/jpeg"};base64,${base64}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const BACKGROUNDS: Record<CategoryKey, [string, string, string, string]> = {
  Skincare: [
    "a premium bathroom counter scene with soft natural window light, subtle steam, clean tiles, spa aesthetic",
    "lush green nature background with soft bokeh, dewy leaves, fresh outdoor daylight",
    "ultra-clean white minimal studio with seamless backdrop, soft diffused shadow under the product",
    "dark moody spa interior with deep emerald tones, soft gold accent light, luxury wellness vibe",
  ],
  Electronics: [
    "dark high-end tech studio with dramatic rim lighting, matte surfaces, cinematic shadows",
    "neon minimal futuristic set with subtle magenta and cyan glow on deep charcoal background",
    "realistic lifestyle scene: modern desk, warm ambient lamp, aspirational everyday tech context",
    "premium showcase pedestal with soft gradient backdrop, glossy reflections, flagship launch aesthetic",
  ],
  Fashion: [
    "urban street lifestyle editorial, soft depth of field, candid fashion campaign energy",
    "bright fashion studio minimal white cyclorama, even soft lighting, Vogue-clean composition",
    "luxury editorial set with rich textures, dramatic controlled lighting, high-end magazine look",
    "outdoor nature location at golden hour, soft bokeh trees or field, warm sunlight",
  ],
  Jewelry: [
    "deep velvet surface and draped velvet backdrop, single dramatic spotlight, luxury jewelry ad",
    "white marble luxury surface with subtle reflections, soft diffused daylight",
    "minimal floating aesthetic on smooth neutral gradient, airy high-key luxury",
    "golden hour warm glow with gentle lens sparkle, shallow depth of field, romantic premium mood",
  ],
  Food: [
    "bright fresh kitchen scene with natural ingredients nearby, crisp morning light, appetizing styling",
    "dark upscale restaurant table, candlelit mood, rich shadows, fine dining atmosphere",
    "minimal white surface with soft overhead light, clean editorial food photography",
    "sunny outdoor picnic setting with park bokeh, natural daylight, fresh organic vibe",
  ],
  Automotive: [
    "polished premium car showroom with reflective floor, dramatic ceiling spotlights",
    "cinematic mountain road at golden hour, dramatic sky, wide vista, automotive hero framing",
    "pristine white infinity studio with subtle floor reflection, clean automotive hero shot",
    "rainy city street at night, wet pavement reflections, moody urban neon accents",
  ],
  Default: [
    "elegant marble studio with soft directional light and subtle veining, premium still life",
    "nature bokeh background with warm sunlight through trees, soft dreamy depth of field",
    "strict minimalist neutral set with generous negative space, soft even illumination",
    "luxury dark interior with gold rim lighting, rich shadows, high-end brand campaign mood",
  ],
};

const HEADLINES: Record<CategoryKey, [string, string, string, string]> = {
  Skincare: [
    "Glow Different",
    "Your Skin Deserves Better",
    "Pure Natural Yours",
    "Luxury Redefined",
  ],
  Electronics: [
    "Power Meets Elegance",
    "Built For Perfection",
    "Future Is Now",
    "Simply Powerful",
  ],
  Fashion: ["Wear Your Story", "Style Meets Soul", "Made For You", "Define Your Style"],
  Jewelry: ["Timeless Elegance", "Wear Your Story", "Pure Luxury", "Shine Different"],
  Food: ["Taste The Difference", "Fresh Every Time", "Made With Love", "Simply Delicious"],
  Automotive: ["Drive Different", "Born To Lead", "Power Unleashed", "Your Road Your Rules"],
  Default: [
    "Elevate Your Standard",
    "Pure Natural Yours",
    "Simply Perfect",
    "Luxury Redefined",
  ],
};

function mapVisionLabelToCategory(raw: string): CategoryKey {
  const n = raw.trim().toLowerCase();
  const direct: Record<string, CategoryKey> = {
    skincare: "Skincare",
    electronics: "Electronics",
    fashion: "Fashion",
    jewelry: "Jewelry",
    food: "Food",
    automotive: "Automotive",
    other: "Default",
  };
  if (direct[n]) return direct[n];

  if (n.includes("skin") || n.includes("beauty") || n.includes("cosmetic")) return "Skincare";
  if (n.includes("electronic") || n.includes("tech") || n.includes("gadget")) return "Electronics";
  if (n.includes("fashion") || n.includes("apparel") || n.includes("clothing")) return "Fashion";
  if (n.includes("jewel")) return "Jewelry";
  if (n.includes("food") || n.includes("beverage") || n.includes("snack")) return "Food";
  if (n.includes("auto") || n.includes("car") || n.includes("vehicle") || n.includes("bike"))
    return "Automotive";
  return "Default";
}

function wrapHeadlineLines(text: string, width: number, fontSize: number): string[] {
  const maxWidth = width - EDGE_PADDING * 2;
  const avgCharPx = fontSize * 0.52;
  const maxChars = Math.max(10, Math.floor(maxWidth / avgCharPx));
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w;
    if (trial.length <= maxChars) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = w.length > maxChars ? `${w.slice(0, maxChars - 1)}…` : w;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

async function buildTextOverlaySvg(headline: string, width: number, height: number): Promise<Buffer> {
  const lines = wrapHeadlineLines(headline, width, HEADLINE_FONT_PX);
  const lineHeight = Math.round(HEADLINE_FONT_PX * 1.15);
  const topBaseline = EDGE_PADDING + HEADLINE_FONT_PX;
  const ctaY = height - EDGE_PADDING - CTA_HEIGHT;
  const ctaX = Math.round((width - CTA_WIDTH) / 2);
  const centerX = Math.round(width / 2);

  const tspans = lines
    .map((ln, i) => {
      const y = topBaseline + i * lineHeight;
      return `<tspan x="${centerX}" y="${y}">${escapeXml(ln)}</tspan>`;
    })
    .join("\n");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <filter id="headShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    <filter id="ctaShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <text
    text-anchor="middle"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-weight="700"
    font-size="${HEADLINE_FONT_PX}"
    fill="#ffffff"
    filter="url(#headShadow)"
  >${tspans}</text>
  <g filter="url(#ctaShadow)">
    <rect x="${ctaX}" y="${ctaY}" rx="27" ry="27" width="${CTA_WIDTH}" height="${CTA_HEIGHT}" fill="${PURPLE_CTA}"/>
    <text
      x="${centerX}"
      y="${ctaY + Math.round(CTA_HEIGHT / 2) + 6}"
      text-anchor="middle"
      font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-weight="600"
      font-size="22"
      fill="#ffffff"
    >Shop Now →</text>
  </g>
</svg>`.trim();

  return Buffer.from(svg);
}

async function applyTextOverlay(imageBuffer: Buffer, headline: string): Promise<string> {
  const base = await sharp(imageBuffer)
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "cover" })
    .png()
    .toBuffer();
  const overlayPng = await sharp(
    await buildTextOverlaySvg(headline, OUTPUT_SIZE, OUTPUT_SIZE),
  )
    .png()
    .toBuffer();

  const composed = await sharp(base)
    .composite([{ input: overlayPng, left: 0, top: 0 }])
    .png()
    .toBuffer();

  return composed.toString("base64");
}

async function analyzeProductWithVision(imageBase64: string): Promise<VisionAnalysis> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");

  const prompt = `You are a senior retail vision analyst. Examine the product photograph.

Return ONLY valid JSON (no markdown) with these keys:
- detailedAnalysis: string, 4–8 sentences. Cover: what the product is, materials/finish, packaging/labels, visible logos, shelf appeal, and why you chose the category.
- detectedCategory: exactly one of: Skincare, Electronics, Fashion, Jewelry, Food, Automotive, Other
- brandName: string visible on-pack or strongly inferable; otherwise null
- colors: array of 3–8 short color descriptors (strings)
- mood: one short phrase (e.g. "clinical fresh", "bold premium")
- targetAudience: one short phrase (India-aware, e.g. "urban millennials", "premium gifting")
- productDescription: 2–4 factual sentences for ad writers (features, use case, differentiators)

Pick detectedCategory from visible product type. Use "Other" only when none fit well.`;

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: ensureImageDataUrl(imageBase64) } },
          ],
        },
      ],
      temperature: 0.25,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI vision failed (${res.status}): ${truncateMessage(raw)}`);
  }
  const data = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI vision returned empty content");

  const parsed = parseJsonFromAssistantContent(content) as {
    detailedAnalysis?: string;
    detectedCategory?: string;
    brandName?: string | null;
    colors?: unknown;
    mood?: string;
    targetAudience?: string;
    productDescription?: string;
  };

  const detailedAnalysis = (parsed.detailedAnalysis ?? "").trim();
  const productDescription = (parsed.productDescription ?? "").trim();
  if (!detailedAnalysis || !productDescription) {
    throw new Error("OpenAI vision response missing detailedAnalysis or productDescription");
  }

  const visionLabel = (parsed.detectedCategory ?? "Other").trim();
  const category = mapVisionLabelToCategory(visionLabel);

  const colors = Array.isArray(parsed.colors)
    ? parsed.colors.filter((c): c is string => typeof c === "string").map((c) => c.trim()).filter(Boolean)
    : [];

  return {
    detailedAnalysis,
    detectedCategory: category,
    brandName:
      parsed.brandName === null || parsed.brandName === undefined
        ? null
        : String(parsed.brandName).trim() || null,
    colors,
    mood: (parsed.mood ?? "").trim() || "premium",
    targetAudience: (parsed.targetAudience ?? "").trim() || "value-conscious Indian shoppers",
    productDescription,
  };
}

function buildGptImagePrompt(backgroundFragment: string): string {
  return `Place this EXACT product (preserve 100% - colors, logo, text, shape) in ${backgroundFragment}. Only change background. Add realistic lighting, shadow, reflection.`;
}

async function generateSceneWithGptImage1(
  imageBase64: string,
  backgroundFragment: string,
): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");

  const { base64, mime } = stripDataUrl(imageBase64);
  const imageBuffer = Buffer.from(base64, "base64");
  const ext = mime.includes("png") ? "png" : "jpg";
  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", buildGptImagePrompt(backgroundFragment));
  form.append("size", "1024x1024");
  form.append("quality", "high");
  form.append(
    "image",
    new Blob([new Uint8Array(imageBuffer)], { type: mime || "image/jpeg" }),
    `product.${ext}`,
  );

  const res = await fetch(OPENAI_IMAGES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    body: form,
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`gpt-image-1 failed (${res.status}): ${truncateMessage(raw)}`);
  }
  const data = JSON.parse(raw) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const first = data.data?.[0];
  const b64 = first?.b64_json;
  if (b64) return Buffer.from(b64, "base64");

  const url = first?.url;
  if (url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      throw new Error(`gpt-image-1 image fetch failed (${imgRes.status})`);
    }
    return Buffer.from(await imgRes.arrayBuffer());
  }

  throw new Error("gpt-image-1 response missing b64_json and url");
}

function categoryAllowsCod(cat: CategoryKey): boolean {
  return cat !== "Automotive";
}

async function generateAdCopy(
  category: CategoryKey,
  analysis: VisionAnalysis,
): Promise<GenerateAdCopy> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");

  const brandLine = analysis.brandName
    ? `Detected brand name (use exactly if appropriate): ${analysis.brandName}.`
    : "No confident brand name detected; do not invent a brand.";

  const codRule = categoryAllowsCod(category)
    ? "India market: mention Cash on Delivery (COD) naturally in at least two of the four channels where it fits (not forced into PDP bullets if awkward)."
    : "India market: DO NOT mention COD (not relevant for this category). Use other trust cues (warranty, authorized service, EMI, test drive/dealer network) instead.";

  const userPrompt = `You are a senior performance marketer for Indian D2C and e-commerce brands.

Product vertical: ${category}
${brandLine}

Vision summary for tone:
- Mood: ${analysis.mood}
- Target audience: ${analysis.targetAudience}
- Palette cues: ${analysis.colors.join(", ") || "not specified"}

Product details for facts:
${analysis.productDescription}

Full analysis (do not paste verbatim; use for nuance):
${analysis.detailedAnalysis}

Write channel-native marketing copy. Tone: premium, confident, India-aware.
Hard requirements:
- ${codRule}
- Add genuine urgency (limited window, launch offer, seasonal demand, fast delivery) without sounding scammy.
- Weave in detected colors/mood/audience subtly, not as a checklist.
- If a brand name was provided above, mention it where it strengthens trust; never invent alternate spellings.

Return ONLY a single JSON object with exactly these string keys (no markdown, no code fences):
- facebookAd: one cohesive Facebook primary text block (2–4 short paragraphs max).
- instagramCaption: one Instagram caption with line breaks; at most 2 tasteful emoji total.
- googleAd: compact Google Ads style: headline + description in plain text (keep under ~320 characters if possible).
- pdpBullets: PDP bullet list as a single string using "• " bullets and line breaks between bullets (4–7 bullets).

All values must be non-empty strings.`;

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You only output valid JSON objects. Never include markdown or commentary outside JSON.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.72,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI ad copy failed (${res.status}): ${errText.slice(0, 800)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  let parsed: unknown;
  try {
    parsed = parseJsonFromAssistantContent(content);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }
  if (!isAdCopy(parsed)) {
    throw new Error(
      "OpenAI JSON missing required keys: facebookAd, instagramCaption, googleAd, pdpBullets",
    );
  }
  return parsed;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      imageBase64?: string;
    };
    const imageBase64 = body.imageBase64;
    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing required field: imageBase64" },
        { status: 400 },
      );
    }

    const analysis = await analyzeProductWithVision(imageBase64);
    const backgrounds = BACKGROUNDS[analysis.detectedCategory];
    const headlines = HEADLINES[analysis.detectedCategory];

    const [sceneBuffers, adCopy] = await Promise.all([
      Promise.all(backgrounds.map((bg) => generateSceneWithGptImage1(imageBase64, bg))),
      generateAdCopy(analysis.detectedCategory, analysis),
    ]);

    const layoutImages = (await Promise.all(
      sceneBuffers.map((buf, idx) => applyTextOverlay(buf, headlines[idx] ?? headlines[0]!)),
    )) as [string, string, string, string];

    const detectedCategory = analysis.detectedCategory;

    return NextResponse.json({
      removedBgImage: stripDataUrl(imageBase64).base64,
      layoutImages,
      images: layoutImages,
      adCopy,
      detectedCategory,
      productAnalysis: analysis.detailedAnalysis,
      categoryWarning: null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const stack = e instanceof Error ? e.stack : undefined;
    console.error("Generate route error", { message, stack });
    const isConfig = message.includes("OPENAI_API_KEY");
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
