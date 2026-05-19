import { NextResponse } from "next/server";
import {
  getOutputDimensions,
  openAiImageSizeForRatio,
  parseAspectRatio,
  type GenerateAspectRatio,
} from "@/lib/aspect-ratio";
import { getCopyLanguageDirective } from "@/lib/copy-languages";
import {
  GenerateApiError,
  classifyOpenAiHttpFailure,
  generateErrorResponse,
  generateErrorResponseFromUnknown,
} from "@/lib/generate-api-errors";
import type {
  AutoAdStylePresetLabel,
  GenerateAdCopy,
  GenerateSuccessResponse,
  LuxuryStyleFamily,
} from "@/lib/generate-api-types";
import {
  parseGenerateRequestBody,
  type GenerateRequestOptions,
} from "@/lib/generate-request";
import { logGenerationHistory } from "@/lib/generation-history";
import { hookLowCreditsWarningEmail } from "@/lib/email-hooks";
import { assertGenerationTrialAllowed } from "@/lib/free-trial";
import {
  applyPostSuccessCredits,
  assertEntitlementHasCredits,
  resolveGenerationEntitlement,
  resolveGenerationActor,
} from "@/lib/user-credits";
import {
  type LayoutSlotIndex,
  LAYOUT_SLOT_INDICES,
  buildLayoutSlotPrompt,
} from "@/lib/layout-slot-prompts";
import sharp from "sharp";

export const maxDuration = 120;

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/edits";
/**
 * Image API config — native cap is 1024²; prompts are tuned for hyper-detail
 * so outputs upscale cleanly to 4K/8K without softness or texture collapse.
 */
const IMAGE_GEN_SIZE = "1024x1024" as const;
const IMAGE_GEN_QUALITY = "high" as const;
const OUTPUT_SIZE = 1024;

const MAX_INPUT_IMAGE_BYTES = 10 * 1024 * 1024;
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
  /** Fine-grained type from vision, e.g. "luxury wristwatch", "vitamin C serum". */
  productType: string;
  brandName: string | null;
  colors: string[];
  mood: string;
  targetAudience: string;
  productDescription: string;
};

type AutoAdStylePreset = {
  family: LuxuryStyleFamily;
  label: AutoAdStylePresetLabel;
  modifier: string;
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

function shouldUseMockGenerate(): boolean {
  const flag = process.env.USE_MOCK_GENERATE?.trim().toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return !process.env.OPENAI_API_KEY;
}

async function validateInputImage(imageBase64: string): Promise<{ base64: string; mime: string }> {
  const { base64, mime } = stripDataUrl(imageBase64);
  if (!base64 || base64.length < 32) {
    throw new GenerateApiError("INVALID_IMAGE", "Invalid or empty image payload.");
  }

  let buf: Buffer;
  try {
    buf = Buffer.from(base64, "base64");
  } catch {
    throw new GenerateApiError("INVALID_IMAGE", "Image data is not valid base64.");
  }

  if (buf.length > MAX_INPUT_IMAGE_BYTES) {
    throw new GenerateApiError(
      "IMAGE_SIZE_INVALID",
      "Image exceeds the 10MB upload limit.",
    );
  }

  try {
    const meta = await sharp(buf).metadata();
    if (!meta.width || !meta.height) {
      throw new GenerateApiError("INVALID_IMAGE", "Could not read image dimensions.");
    }
    if (meta.width < 64 || meta.height < 64) {
      throw new GenerateApiError(
        "IMAGE_SIZE_INVALID",
        "Image is too small — use at least 64×64 pixels.",
      );
    }
    if (meta.width > 8192 || meta.height > 8192) {
      throw new GenerateApiError(
        "IMAGE_SIZE_INVALID",
        "Image dimensions exceed the maximum supported size (8192px).",
      );
    }
  } catch (err) {
    if (err instanceof GenerateApiError) throw err;
    throw new GenerateApiError("INVALID_IMAGE", "Could not decode the uploaded image.");
  }

  return { base64, mime };
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

  if (
    n.includes("skin") ||
    n.includes("beauty") ||
    n.includes("cosmetic") ||
    n.includes("makeup") ||
    n.includes("perfume") ||
    n.includes("fragrance")
  ) {
    if (n.includes("perfume") || n.includes("fragrance") || n.includes("cologne")) return "Jewelry";
    return "Skincare";
  }
  if (n.includes("electronic") || n.includes("tech") || n.includes("gadget")) return "Electronics";
  if (
    n.includes("fashion") ||
    n.includes("apparel") ||
    n.includes("clothing") ||
    n.includes("sneaker") ||
    n.includes("footwear")
  ) {
    return "Fashion";
  }
  if (n.includes("jewel") || n.includes("watch") || n.includes("timepiece")) return "Jewelry";
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

async function buildTextOverlaySvg(
  headline: string,
  width: number,
  height: number,
  fontSize = HEADLINE_FONT_PX,
): Promise<Buffer> {
  const lines = wrapHeadlineLines(headline, width, fontSize);
  const lineHeight = Math.round(fontSize * 1.15);
  const topBaseline = EDGE_PADDING + fontSize;
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
    font-size="${fontSize}"
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

async function applyTextOverlay(
  imageBuffer: Buffer,
  headline: string,
  width: number,
  height: number,
): Promise<string> {
  const edge = Math.min(width, height);
  const fontSize = edge <= 512 ? Math.round(HEADLINE_FONT_PX * 0.55) : HEADLINE_FONT_PX;
  const base = await sharp(imageBuffer)
    .resize(width, height, { fit: "cover" })
    .png()
    .toBuffer();
  const overlayPng = await sharp(await buildTextOverlaySvg(headline, width, height, fontSize))
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

  const prompt = `You are a senior retail vision analyst for luxury D2C product ads. Examine the product photograph carefully.

Return ONLY valid JSON (no markdown) with these keys:
- detailedAnalysis: string, 4–8 sentences. What is the product, materials/finish, packaging, logos, shelf appeal, and why you chose the category.
- productType: string, precise product name (e.g. "vitamin C serum bottle", "luxury chronograph watch", "wireless earbuds", "cotton streetwear hoodie", "gold pendant necklace").
- detectedCategory: exactly one of: Skincare, Electronics, Fashion, Jewelry, Food, Automotive, Other
  - Skincare: cosmetics, beauty, serum, cream, sunscreen, shampoo, makeup
  - Jewelry: jewelry, watches, perfumes, fragrances, luxury glass bottles with gold accents
  - Electronics: gadgets, phones, laptops, audio, chargers, smart devices
  - Fashion: apparel, clothing, sneakers, footwear, textiles
  - Food: food, beverages, snacks
  - Automotive: vehicles, car accessories
- brandName: string visible on-pack or strongly inferable; otherwise null
- colors: array of 3–8 short color descriptors (strings)
- mood: one short phrase (e.g. "clinical fresh", "bold premium")
- targetAudience: one short phrase (India-aware, e.g. "urban millennials", "premium gifting")
- productDescription: 2–4 factual sentences for ad writers (features, use case, differentiators)

Pick detectedCategory from the actual product type. Use "Other" only when none fit.`;

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
    throw classifyOpenAiHttpFailure(res.status, raw);
  }
  const data = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI vision returned empty content");

  const parsed = parseJsonFromAssistantContent(content) as {
    detailedAnalysis?: string;
    productType?: string;
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

  const productType = (parsed.productType ?? productDescription.split(/[.!?]/)[0] ?? category).trim();

  return {
    detailedAnalysis,
    detectedCategory: category,
    productType: productType || category,
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

/** Agency-level backdrop presets — injected automatically from vision (no user input). */
const AUTO_AD_STYLE_PRESETS: Record<LuxuryStyleFamily, AutoAdStylePreset> = {
  organic: {
    family: "organic",
    label: "Organic Eco",
    modifier:
      "Organic Eco style: high-end botanical setting, soft morning light, scattered leaves and natural greenery, premium wood texture surfaces, dewy spa atmosphere, sustainable luxury beauty campaign aesthetic.",
  },
  marble: {
    family: "marble",
    label: "Luxury Marble",
    modifier:
      "Luxury Marble style: premium polished Carrara stone platforms, high-fashion dramatic studio lighting, elite reflections and specular highlights, museum-grade jewelry and fragrance campaign aesthetic.",
  },
  cyberpunk: {
    family: "cyberpunk",
    label: "Cyber Tech",
    modifier:
      "Cyber Tech style: dark moody studio background, crisp neon cyan and magenta highlights, futuristic tech aesthetic, controlled rim light, premium electronics launch campaign energy.",
  },
  studio: {
    family: "studio",
    label: "Studio Elite",
    modifier:
      "Studio Elite style: ultra-clean professional cyclorama studio backdrop, flagship product launch lighting, flawless depth of field, editorial negative space, global fashion and apparel campaign polish.",
  },
};

/**
 * Autonomous product → preset matcher. User never selects a style.
 * Priority: category rules, then productType/corpus keywords.
 */
function resolveAutoAdStylePreset(
  category: CategoryKey,
  analysis: VisionAnalysis,
): AutoAdStylePreset {
  const corpus =
    `${analysis.productType} ${analysis.productDescription} ${analysis.detailedAnalysis} ${analysis.mood}`.toLowerCase();

  const isSkincareCosmetics =
    category === "Skincare" ||
    /skincare|cosmetic|serum|moisturi|sunscreen|cream|lotion|cleanser|toner|mask|beauty|makeup|shampoo|conditioner|spf|retinol|hyaluronic/i.test(
      corpus,
    );

  const isJewelryLuxury =
    category === "Jewelry" ||
    /jewel|necklace|ring|bracelet|earring|pendant|diamond|gold|silver|platinum|perfume|fragrance|cologne|parfum|watch|timepiece|chronograph|luxury bottle/i.test(
      corpus,
    );

  const isElectronicsTech =
    category === "Electronics" ||
    category === "Automotive" ||
    /electronic|gadget|phone|smartphone|laptop|tablet|earbud|headphone|speaker|charger|cable|drone|camera|gaming|rgb|tech|smartwatch|sneaker|trainer|footwear|sneakers|keyboard|mouse|console/i.test(
      corpus,
    );

  const isFashionApparel =
    category === "Fashion" ||
    /apparel|clothing|garment|dress|shirt|tee|t-shirt|hoodie|jacket|coat|denim|jeans|fabric|textile|streetwear|fashion|wear|blouse|saree|kurta/i.test(
      corpus,
    );

  if (isSkincareCosmetics && !isJewelryLuxury) {
    return AUTO_AD_STYLE_PRESETS.organic;
  }
  if (isJewelryLuxury) {
    return AUTO_AD_STYLE_PRESETS.marble;
  }
  if (isElectronicsTech && !isFashionApparel) {
    return AUTO_AD_STYLE_PRESETS.cyberpunk;
  }
  if (isFashionApparel) {
    return AUTO_AD_STYLE_PRESETS.studio;
  }
  if (category === "Food") {
    return AUTO_AD_STYLE_PRESETS.organic;
  }

  if (/organic|botanical|natural|herbal|eco|green|farm|dewy/i.test(corpus)) {
    return AUTO_AD_STYLE_PRESETS.organic;
  }
  if (/marble|velvet|gold|jewel|perfume|watch|prestige/i.test(corpus)) {
    return AUTO_AD_STYLE_PRESETS.marble;
  }
  if (/neon|cyber|futur|tech|gaming|rgb|digital|moody/i.test(corpus)) {
    return AUTO_AD_STYLE_PRESETS.cyberpunk;
  }

  return AUTO_AD_STYLE_PRESETS.studio;
}

async function generateLayoutScene(
  slotIndex: LayoutSlotIndex,
  imageBase64: string,
  analysis: VisionAnalysis,
  preset: AutoAdStylePreset,
  ratio: GenerateAspectRatio,
  targetWidth: number,
  targetHeight: number,
  aiEnhancementMode: boolean,
): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new GenerateApiError("CONFIG_ERROR", "OPENAI_API_KEY is not configured.");
  }

  const { base64, mime } = await validateInputImage(imageBase64);
  const imageBuffer = Buffer.from(base64, "base64");
  const ext = mime.includes("png") ? "png" : "jpg";

  const prompt = buildLayoutSlotPrompt({
    slotIndex,
    category: analysis.detectedCategory,
    analysis,
    preset,
    aiEnhancementMode,
  });

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", prompt);
  form.append("size", openAiImageSizeForRatio(ratio));
  form.append("quality", IMAGE_GEN_QUALITY);
  form.append(
    "image",
    new Blob([new Uint8Array(imageBuffer)], { type: mime || "image/jpeg" }),
    `product.${ext}`,
  );

  const res = await fetch(OPENAI_IMAGES_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  const raw = await res.text();
  if (!res.ok) {
    throw classifyOpenAiHttpFailure(res.status, raw);
  }

  let data: { data?: Array<{ b64_json?: string; url?: string }> };
  try {
    data = JSON.parse(raw) as { data?: Array<{ b64_json?: string; url?: string }> };
  } catch {
    throw new GenerateApiError(
      "GENERATION_FAILED",
      `Layout ${slotIndex + 1}: invalid response from image API.`,
    );
  }

  const first = data.data?.[0];
  let rawBuffer: Buffer | null = null;
  const b64Out = first?.b64_json;
  if (b64Out) rawBuffer = Buffer.from(b64Out, "base64");

  const url = first?.url;
  if (!rawBuffer && url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      throw new GenerateApiError(
        "GENERATION_FAILED",
        `Layout ${slotIndex + 1}: failed to download generated image.`,
      );
    }
    rawBuffer = Buffer.from(await imgRes.arrayBuffer());
  }

  if (!rawBuffer) {
    throw new GenerateApiError(
      "GENERATION_FAILED",
      `Layout ${slotIndex + 1}: image API returned no image data.`,
    );
  }

  return sharp(rawBuffer)
    .resize(targetWidth, targetHeight, { fit: "cover" })
    .png()
    .toBuffer();
}

async function generateAllLayoutScenes(
  imageBase64: string,
  analysis: VisionAnalysis,
  preset: AutoAdStylePreset,
  ratio: GenerateAspectRatio,
  targetWidth: number,
  targetHeight: number,
  aiEnhancementMode: boolean,
): Promise<[Buffer, Buffer, Buffer, Buffer]> {
  const buffers = await Promise.all(
    LAYOUT_SLOT_INDICES.map((slotIndex) =>
      generateLayoutScene(
        slotIndex,
        imageBase64,
        analysis,
        preset,
        ratio,
        targetWidth,
        targetHeight,
        aiEnhancementMode,
      ),
    ),
  );
  return buffers as [Buffer, Buffer, Buffer, Buffer];
}

async function composeLayoutImages(
  sceneBuffers: [Buffer, Buffer, Buffer, Buffer],
  headlines: [string, string, string, string],
  width: number,
  height: number,
): Promise<[string, string, string, string]> {
  const layoutImages = await Promise.all(
    sceneBuffers.map((buf, idx) =>
      applyTextOverlay(buf, headlines[idx] ?? headlines[0]!, width, height),
    ),
  );
  return layoutImages as [string, string, string, string];
}

function categoryAllowsCod(cat: CategoryKey): boolean {
  return cat !== "Automotive";
}

type AdCopyGenerationContext = Pick<
  GenerateRequestOptions,
  "brandName" | "coreHook" | "copyLanguage"
>;

function buildBrandContextLines(
  analysis: VisionAnalysis,
  ctx: AdCopyGenerationContext,
): { brandLine: string; offerLine: string } {
  const userBrand = ctx.brandName?.trim();
  const visionBrand = analysis.brandName?.trim();

  let brandLine: string;
  if (userBrand) {
    brandLine = `MANDATORY brand name — use exactly "${userBrand}" in every channel where it strengthens trust (headline, CTA, or sign-off). Never substitute, abbreviate, or misspell.`;
    if (visionBrand && visionBrand.toLowerCase() !== userBrand.toLowerCase()) {
      brandLine += ` Vision detected "${visionBrand}" on-pack; always prioritize the user's brand name above.`;
    }
  } else if (visionBrand) {
    brandLine = `Detected brand name from packaging (use exactly if appropriate): ${visionBrand}.`;
  } else {
    brandLine = "No brand name supplied or detected on-pack; do not invent a brand.";
  }

  const offerLine = ctx.coreHook?.trim()
    ? `MANDATORY core hook / offer — feature this exact offer prominently in Facebook, Instagram, and Google copy: "${ctx.coreHook.trim()}". Reflect it in PDP bullets as a primary value prop.`
    : "No specific offer provided; use tasteful launch urgency without fabricating discount codes or percentages.";

  return { brandLine, offerLine };
}

async function generateAdCopy(
  category: CategoryKey,
  analysis: VisionAnalysis,
  ctx: AdCopyGenerationContext,
): Promise<GenerateAdCopy> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new GenerateApiError("CONFIG_ERROR", "OPENAI_API_KEY is not configured.");
  }

  const { brandLine, offerLine } = buildBrandContextLines(analysis, ctx);
  const languageDirective = getCopyLanguageDirective(ctx.copyLanguage);

  const codRule = categoryAllowsCod(category)
    ? "India market: mention Cash on Delivery (COD) naturally in at least two of the four channels where it fits (not forced into PDP bullets if awkward)."
    : "India market: DO NOT mention COD (not relevant for this category). Use other trust cues (warranty, authorized service, EMI, test drive/dealer network) instead.";

  const userPrompt = `You are a senior performance marketer for Indian D2C and e-commerce brands.

Product vertical: ${category}
${brandLine}
${offerLine}

${languageDirective}

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
- User-supplied brand name and core hook / offer are mandatory when provided above.

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
          content: [
            "You only output valid JSON objects. Never include markdown or commentary outside JSON.",
            languageDirective,
            "When a mandatory brand name or offer is given in the user message, every channel must honor them.",
          ].join(" "),
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.72,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw classifyOpenAiHttpFailure(res.status, errText);
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

/** Mock output size — smaller payloads so the dashboard can parse the JSON reliably. */
const MOCK_OUTPUT_SIZE = 512;

/** 1×1 PNG — last-resort placeholder so the client always gets four layout strings. */
const MOCK_FALLBACK_LAYOUT_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const MOCK_DETECTED_CATEGORY: CategoryKey = "Skincare";

const MOCK_AD_COPY: GenerateAdCopy = {
  facebookAd:
    "Your hero SKU deserves a luxury studio treatment—not another rushed catalog shoot. Growurb AI turns one mobile photo into four premium ad layouts with channel-ready copy in under a minute. Watermark-free on Growth Pro · global USD pricing · built for D2C founders scaling paid social.",
  instagramCaption:
    "One upload. Four luxury backgrounds. Copy that ships with your PDP.\n\nStudio-grade skincare ads without the agency invoice—tap through to generate your brand kit.\n\n#D2C #skincare #productphotography #growurb",
  googleAd:
    "AI Luxury Product Ads | 4 Studio Layouts\nTurn phone photos into premium PDP + Meta creatives. Free trial · $19/mo Growth Pro.",
  pdpBullets:
    "• Agency-style marble, nature, minimal, and dark luxury backgrounds\n• Preserves your pack shot, logo, and label fidelity\n• Omni-channel copy: Meta, Instagram, Google, PDP bullets\n• 1024px export ready for upscale and paid campaigns\n• Generate four variants per run—pick your winner in minutes",
};

const MOCK_PRODUCT_ANALYSIS =
  "Premium skincare or beauty product detected. Packaging reads clean and label-forward with neutral tones suited to luxury marble and dark studio lanes. Recommended vertical: Skincare. Target: global D2C and social-first founders who need fast PDP and paid-social refreshes without a physical studio.";

const MOCK_VISION_ANALYSIS: VisionAnalysis = {
  detailedAnalysis: MOCK_PRODUCT_ANALYSIS,
  detectedCategory: MOCK_DETECTED_CATEGORY,
  productType: "premium skincare serum bottle",
  brandName: null,
  colors: ["pearl white", "soft rose", "champagne gold"],
  mood: "clinical fresh luxury",
  targetAudience: "global D2C skincare founders",
  productDescription:
    "Premium skincare serum in minimal glass packaging with clean label hierarchy and spa-grade positioning.",
};

/** Vision pass for style matching — used in live and mock paths when API key is set. */
async function analyzeProductForGeneration(imageBase64: string): Promise<VisionAnalysis> {
  try {
    return await analyzeProductWithVision(imageBase64);
  } catch (err) {
    console.warn("Vision analysis failed, using heuristic fallback", err);
    return { ...MOCK_VISION_ANALYSIS };
  }
}

const MOCK_STYLE_SCENES: Record<
  LuxuryStyleFamily,
  readonly [{ top: string; bottom: string; accent: string }, { top: string; bottom: string; accent: string }, { top: string; bottom: string; accent: string }, { top: string; bottom: string; accent: string }]
> = {
  marble: [
    { top: "#f7f3ef", bottom: "#cfc6bc", accent: "rgba(255,255,255,0.35)" },
    { top: "#ebe4dc", bottom: "#b8aea3", accent: "rgba(212,175,95,0.22)" },
    { top: "#faf8f5", bottom: "#ddd6ce", accent: "rgba(255,255,255,0.45)" },
    { top: "#2a2238", bottom: "#0c0a12", accent: "rgba(212,175,95,0.2)" },
  ],
  organic: [
    { top: "#3d6b52", bottom: "#0f2418", accent: "rgba(180,220,160,0.25)" },
    { top: "#5a8f6a", bottom: "#1a3324", accent: "rgba(120,200,140,0.2)" },
    { top: "#8fb39a", bottom: "#2d4a38", accent: "rgba(255,255,220,0.15)" },
    { top: "#1f3d2c", bottom: "#0a1510", accent: "rgba(100,180,120,0.18)" },
  ],
  studio: [
    { top: "#f4f4f6", bottom: "#d8d8de", accent: "rgba(255,255,255,0.55)" },
    { top: "#ececf0", bottom: "#c9c9d1", accent: "rgba(200,200,220,0.2)" },
    { top: "#fafafa", bottom: "#e4e4ea", accent: "rgba(255,255,255,0.5)" },
    { top: "#1c1c22", bottom: "#08080c", accent: "rgba(255,255,255,0.08)" },
  ],
  cyberpunk: [
    { top: "#1a1030", bottom: "#06040c", accent: "rgba(0,255,255,0.18)" },
    { top: "#12082a", bottom: "#04020a", accent: "rgba(255,0,180,0.15)" },
    { top: "#0f1428", bottom: "#020408", accent: "rgba(80,200,255,0.2)" },
    { top: "#201040", bottom: "#080418", accent: "rgba(180,80,255,0.22)" },
  ],
};

/** Scene gradients — generated locally (no network). */
async function createMockSceneBuffer(
  variant: number,
  width: number,
  height: number,
  styleFamily: LuxuryStyleFamily,
): Promise<Buffer> {
  const palette = MOCK_STYLE_SCENES[styleFamily];
  const { top, bottom, accent } = palette[variant % 4]!;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${top}"/>
      <stop offset="100%" stop-color="${bottom}"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="25%" r="55%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
</svg>`.trim();
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function thumbRemovedBgBase64(imageBase64: string): Promise<string> {
  const { base64 } = stripDataUrl(imageBase64);
  try {
    const buf = Buffer.from(base64, "base64");
    return (
      await sharp(buf)
        .resize(256, 256, { fit: "inside", withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toBuffer()
    ).toString("base64");
  } catch {
    return base64.slice(0, 12_000);
  }
}

function mockSuccessPayload(
  removedBgImage: string,
  layoutImages: [string, string, string, string],
  ratio: GenerateAspectRatio,
  analysis: VisionAnalysis,
  preset: AutoAdStylePreset,
  adCopy: GenerateAdCopy,
  options: Pick<GenerateRequestOptions, "copyLanguage" | "aiEnhancementMode">,
) {
  return {
    removedBgImage,
    layoutImages,
    images: layoutImages,
    adCopy,
    detectedCategory: analysis.detectedCategory,
    productAnalysis: `${analysis.detailedAnalysis} Auto-selected preset: ${preset.label} (${analysis.productType}).`,
    categoryWarning: null,
    mockMode: true,
    ratio,
    autoStyleFamily: preset.family,
    autoStylePresetLabel: preset.label,
    copyLanguage: options.copyLanguage,
    aiEnhancementMode: options.aiEnhancementMode,
  };
}

function buildMockFallbackPayload(
  ratio: GenerateAspectRatio,
  options: Pick<GenerateRequestOptions, "copyLanguage" | "aiEnhancementMode">,
) {
  const layouts: [string, string, string, string] = [
    MOCK_FALLBACK_LAYOUT_B64,
    MOCK_FALLBACK_LAYOUT_B64,
    MOCK_FALLBACK_LAYOUT_B64,
    MOCK_FALLBACK_LAYOUT_B64,
  ];
  const fallbackPreset = AUTO_AD_STYLE_PRESETS.marble;
  return mockSuccessPayload(
    MOCK_FALLBACK_LAYOUT_B64,
    layouts,
    ratio,
    MOCK_VISION_ANALYSIS,
    fallbackPreset,
    MOCK_AD_COPY,
    options,
  );
}

async function resolveAdCopyForGeneration(
  category: CategoryKey,
  analysis: VisionAnalysis,
  options: Pick<GenerateRequestOptions, "brandName" | "coreHook" | "copyLanguage">,
): Promise<GenerateAdCopy> {
  const hasKey =
    typeof process.env.OPENAI_API_KEY === "string" &&
    process.env.OPENAI_API_KEY.length > 0;
  if (!hasKey) return MOCK_AD_COPY;

  try {
    return await generateAdCopy(category, analysis, {
      brandName: options.brandName,
      coreHook: options.coreHook,
      copyLanguage: options.copyLanguage,
    });
  } catch (err) {
    console.warn("Ad copy generation failed, using static fallback", err);
    return MOCK_AD_COPY;
  }
}

async function buildMockGeneratePayload(
  imageBase64: string,
  options: GenerateRequestOptions,
) {
  const { ratio } = options;
  const analysis =
    process.env.OPENAI_API_KEY != null && process.env.OPENAI_API_KEY.length > 0
      ? await analyzeProductForGeneration(imageBase64)
      : MOCK_VISION_ANALYSIS;

  const preset = resolveAutoAdStylePreset(analysis.detectedCategory, analysis);
  const { width, height } = getOutputDimensions(ratio, MOCK_OUTPUT_SIZE);
  const headlines = HEADLINES[analysis.detectedCategory];
  const sceneBuffers = await Promise.all(
    LAYOUT_SLOT_INDICES.map((i) => createMockSceneBuffer(i, width, height, preset.family)),
  );

  const layoutImages = (await Promise.all(
    sceneBuffers.map((buf, idx) =>
      applyTextOverlay(buf, headlines[idx] ?? headlines[0]!, width, height),
    ),
  )) as [string, string, string, string];

  const removedBgImage = await thumbRemovedBgBase64(imageBase64);
  const adCopy = await resolveAdCopyForGeneration(
    analysis.detectedCategory,
    analysis,
    options,
  );

  return mockSuccessPayload(removedBgImage, layoutImages, ratio, analysis, preset, adCopy, {
    copyLanguage: options.copyLanguage,
    aiEnhancementMode: options.aiEnhancementMode,
  });
}

async function runLiveGenerationPayload(
  options: GenerateRequestOptions,
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new GenerateApiError("CONFIG_ERROR", "OPENAI_API_KEY is not configured.");
  }

  const { imageBase64, ratio, aiEnhancementMode, copyLanguage } = options;
  await validateInputImage(imageBase64);

  const analysis = await analyzeProductWithVision(imageBase64);
  const preset = resolveAutoAdStylePreset(analysis.detectedCategory, analysis);
  const headlines = HEADLINES[analysis.detectedCategory];
  const { width, height } = getOutputDimensions(ratio, OUTPUT_SIZE);

  const [sceneBuffers, adCopy] = await Promise.all([
    generateAllLayoutScenes(
      imageBase64,
      analysis,
      preset,
      ratio,
      width,
      height,
      aiEnhancementMode,
    ),
    generateAdCopy(analysis.detectedCategory, analysis, {
      brandName: options.brandName,
      coreHook: options.coreHook,
      copyLanguage: options.copyLanguage,
    }),
  ]);

  const layoutImages = await composeLayoutImages(sceneBuffers, headlines, width, height);

  return {
    removedBgImage: stripDataUrl(imageBase64).base64,
    layoutImages,
    images: layoutImages,
    adCopy,
    detectedCategory: analysis.detectedCategory,
    productAnalysis: `${analysis.detailedAnalysis} Auto-selected preset: ${preset.label} (${analysis.productType}).`,
    categoryWarning: null,
    ratio,
    autoStyleFamily: preset.family,
    autoStylePresetLabel: preset.label,
    copyLanguage,
    aiEnhancementMode,
    mockMode: false,
  };
}

async function executeBrandKitGeneration(
  options: GenerateRequestOptions,
): Promise<Omit<GenerateSuccessResponse, "updatedCredits">> {
  if (shouldUseMockGenerate()) {
    try {
      return await buildMockGeneratePayload(options.imageBase64, options);
    } catch (mockErr) {
      console.error("Mock generate failed, returning fallback payload", mockErr);
      return buildMockFallbackPayload(options.ratio, {
        copyLanguage: options.copyLanguage,
        aiEnhancementMode: options.aiEnhancementMode,
      });
    }
  }

  return await runLiveGenerationPayload(options);
}

export async function POST(req: Request) {
  let options: GenerateRequestOptions;

  try {
    const rawBody: unknown = await req.json();
    const parsed = parseGenerateRequestBody(rawBody);
    if ("error" in parsed) {
      return NextResponse.json(
        { error: true as const, status: "INVALID_IMAGE" as const, message: parsed.error },
        { status: parsed.status },
      );
    }
    options = parsed;
    await validateInputImage(options.imageBase64);
  } catch (err) {
    console.error("Generate request validation failed", err);
    return generateErrorResponseFromUnknown(err);
  }

  try {
    const actor = await resolveGenerationActor();
    await assertGenerationTrialAllowed(actor, actor.accountCreatedAt);
    const entitlement = await resolveGenerationEntitlement(actor);
    assertEntitlementHasCredits(entitlement);

    const payload = await executeBrandKitGeneration(options);
    const updatedCredits = await applyPostSuccessCredits(actor, entitlement);

    await logGenerationHistory({
      userId: actor.userId,
      options,
      payload,
    });

    if (!entitlement.skipPerGenerationCreditDeduction) {
      hookLowCreditsWarningEmail(actor.userId, updatedCredits);
    }

    return NextResponse.json({
      ...payload,
      updatedCredits,
    } satisfies GenerateSuccessResponse);
  } catch (err) {
    console.error("Generate pipeline failed", err);
    return generateErrorResponseFromUnknown(err);
  }
}
