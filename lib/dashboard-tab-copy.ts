import type { DashboardCategory } from "./dashboard-categories";
import type { GenerateAdCopy } from "./generate-api-types";

export type CopyTabId = "facebook" | "instagram" | "google" | "pdp";

type TabBank = Record<CopyTabId, string>;

const BANK: Record<DashboardCategory, TabBank> = {
  Skincare: {
    facebook:
      "Glow isn’t guesswork anymore. Ship PDP-ready ceramide visuals + Hindi/English hooks tuned for Meta Advantage+. ₹499+ ships free · COD India-wide.",
    instagram:
      "☔️ Monsoon-proof dew in one serum pump. Tap link for ₹150 launch perk + reel-ready crops—because Mumbai humidity waits for nobody.",
    google:
      "Hydrating ceramide serum India · cruelty-free · glass skin PDP bundle · Next-day renders · Shopify exports.",
    pdp:
      "• Lightweight jelly absorbs in seconds—no white cast under studio lighting\n• Ceramide + beta-glucan barrier shield\n• pH-balanced for humid coastal climates · dermatologist-loved routine slot\n• Ships COD · recyclable refill pods available",
  },
  Fashion: {
    facebook:
      "Architect your capsule wardrobe without another Lokhandwala studio day. Kota cotton co-ords rendered with runway-grade folds—performance PDP live in minutes.",
    instagram:
      "Monsoon errands hate stiff silhouettes. This fluid co-ord dries before your chai cools—DM 📩 for ₹199 first-order credit.",
    google:
      "Women co-ord sets India · breathable kota cotton · COD · PDP-ready catalogue renders · Bengaluru-made trims.",
    pdp:
      "• Breathable GSM tuned for June humidity shoots\n• Dual-pocket tailoring · tonal selvedge detail\n• Cold-water wash friendly · fade-tested under ring lights\n• Exchange-friendly sizing chart localized for INR PDP",
  },
  Jewelry: {
    facebook:
      "Heritage alloys without showroom markup. Jaipur micron plating stacks shot with guilt-free sparkle stories—perfect for festive Advantage+ bursts.",
    instagram:
      "Arm-party quiet flex ✨ Complimentary engraving above ₹2.5k—DM concierge before kiln slots vanish.",
    google:
      "22k micron plated jewelry India · nickel-safe · COD · anti-tarnish coastal coating · PDP macro renders.",
    pdp:
      "• Nickel-safe posts · allergy-tested for sensitive lobes\n• Anti-tarnish e-coating ideal for humid metros\n• Ships in recyclable rigid gift boxes · lifetime polishing pledge\n• Certification QR linked on PDP footer",
  },
  Food: {
    facebook:
      "Cold-chain storytelling without location shoots. Pour shots + ingredient overlays tuned for midnight scrolling founders.",
    instagram:
      "4 AM founders: this bottle is your silent co-founder. Tag #GlowUrbRitual—we’ll amplify three reels nightly.",
    google:
      "India cold brew concentrate · jaggery finish · COD zones · nutrition PDP localized · festive sleeves.",
    pdp:
      "• Nutrition facts localized for INR PDP templates\n• Shelf-stable 45 days refrigerated · batch-coded QR traceability\n• Gifting sleeves with handwritten foil messaging option\n• GST-ready invoicing language baked into PDP bullets",
  },
  Electronics: {
    facebook:
      "Dock everything once—surge-aware industrial design localized for flaky mains + bilingual setup QR.",
    instagram:
      "Desk spaghetti ends today. ₹100 off when you WhatsApp your invoice before Friday—PAN India logistics unlocked.",
    google:
      "Graphene docking hub India · triple-device · surge shield · EMI PDP blocks · Hindi quick-start QR.",
    pdp:
      "• BIS-friendly adapter bundles selectable at checkout\n• Graphene thermal pads tested at 42°C ambient\n• EMI micro-copy slots integrated into PDP modules\n• Tempered glass footprint guides included for photography rigs",
  },
  "Home Decor": {
    facebook:
      "Compact-city vignettes styled like Sunday editorials—glass shelving & boucle accents rendered without renting a Bandra loft.",
    instagram:
      "Golden-hour shelves finally match your espresso ritual. Stories swipe-up unlocks ₹250 bundle credit—limited metros.",
    google:
      "Modular shelving India · tempered glass shelves · COD bundles · PDP matte/brushed renders · GST-inclusive.",
    pdp:
      "• Scratch-tested finishes rated for humid coastal air\n• Modular stacking rails ship flat-pack · QR assembly reel\n• Neutral palettes calibrated for Instagram PDP ratios\n• GST-inclusive INR pricing blocks ready for Shopify import",
  },
};

export function getDashboardTabCopy(
  category: DashboardCategory,
  tab: CopyTabId,
): string {
  return BANK[category][tab];
}

export function getTabCopyText(
  tab: CopyTabId,
  ad: GenerateAdCopy | null,
  fallbackCategory: DashboardCategory = "Skincare",
): string {
  if (ad) {
    if (tab === "facebook") return ad.facebookAd;
    if (tab === "instagram") return ad.instagramCaption;
    if (tab === "google") return ad.googleAd;
    return ad.pdpBullets;
  }
  return getDashboardTabCopy(fallbackCategory, tab);
}
