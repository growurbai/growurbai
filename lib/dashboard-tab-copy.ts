import type { DashboardCategory } from "./dashboard-categories";
import type { GenerateAdCopy } from "./generate-api-types";

export type CopyTabId = "facebook" | "instagram" | "linkedin" | "twitter";

type TabBank = Record<CopyTabId, string>;

const BANK: Record<DashboardCategory, TabBank> = {
  Skincare: {
    facebook:
      "Glow isn’t guesswork anymore. Ship PDP-ready ceramide visuals + Hindi/English hooks tuned for Meta Advantage+. ₹499+ ships free · COD India-wide.",
    instagram:
      "☔️ Monsoon-proof dew in one serum pump. Tap link for ₹150 launch perk + reel-ready crops—because Mumbai humidity waits for nobody.",
    linkedin:
      "Founder note: premium skincare brands can now ship campaign-ready product visuals without waiting on a studio calendar. One clean catalog shot becomes launch-ready creative, multilingual copy, and a faster PDP refresh cycle.",
    twitter:
      "One catalog photo → 4 premium skincare ad layouts + channel copy. Built for D2C teams shipping faster than studio timelines.",
  },
  Fashion: {
    facebook:
      "Architect your capsule wardrobe without another Lokhandwala studio day. Kota cotton co-ords rendered with runway-grade folds—performance PDP live in minutes.",
    instagram:
      "Monsoon errands hate stiff silhouettes. This fluid co-ord dries before your chai cools—DM 📩 for ₹199 first-order credit.",
    linkedin:
      "Fashion drops move quickly. GrowUrb helps teams turn a single apparel shot into premium launch visuals and platform-aware copy, so PDP and paid social refreshes can move at merchandising speed.",
    twitter:
      "New fashion drop? Turn one SKU photo into premium PDP and paid-social creative in minutes.",
  },
  Jewelry: {
    facebook:
      "Heritage alloys without showroom markup. Jaipur micron plating stacks shot with guilt-free sparkle stories—perfect for festive Advantage+ bursts.",
    instagram:
      "Arm-party quiet flex ✨ Complimentary engraving above ₹2.5k—DM concierge before kiln slots vanish.",
    linkedin:
      "Jewelry campaigns need detail, mood, and trust. Generate macro-style premium layouts and refined launch copy from one product shot without booking a showroom shoot.",
    twitter:
      "Jewelry SKU in, premium campaign kit out. Macro mood, polished copy, and launch-ready layouts.",
  },
  Food: {
    facebook:
      "Cold-chain storytelling without location shoots. Pour shots + ingredient overlays tuned for midnight scrolling founders.",
    instagram:
      "4 AM founders: this bottle is your silent co-founder. Tag #GlowUrbRitual—we’ll amplify three reels nightly.",
    linkedin:
      "Food and beverage founders can now test seasonal packaging, premium launch scenes, and channel copy from a single product photo before committing to a full shoot.",
    twitter:
      "One beverage shot, four campaign-ready layouts. Test creative before your next production run.",
  },
  Electronics: {
    facebook:
      "Dock everything once—surge-aware industrial design localized for flaky mains + bilingual setup QR.",
    instagram:
      "Desk spaghetti ends today. ₹100 off when you WhatsApp your invoice before Friday—PAN India logistics unlocked.",
    linkedin:
      "Electronics teams need clear value communication and sharp product context. Generate launch visuals and copy that explain benefits without losing the premium hardware feel.",
    twitter:
      "Hardware launch assets from one product shot: premium layouts, benefit-led copy, faster PDP refreshes.",
  },
  "Home Decor": {
    facebook:
      "Compact-city vignettes styled like Sunday editorials—glass shelving & boucle accents rendered without renting a Bandra loft.",
    instagram:
      "Golden-hour shelves finally match your espresso ritual. Stories swipe-up unlocks ₹250 bundle credit—limited metros.",
    linkedin:
      "Home decor brands can build editorial-grade room context and launch copy from one clean SKU image, making seasonal PDP updates faster and more affordable.",
    twitter:
      "Home decor SKU → editorial campaign kit. Four layouts, channel copy, ready for your next drop.",
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
    if (tab === "linkedin") return ad.linkedinPost;
    return ad.twitterXLink;
  }
  return getDashboardTabCopy(fallbackCategory, tab);
}
