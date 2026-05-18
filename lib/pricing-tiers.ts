import type { SubscriptionPlanId } from "@/lib/stripe/plans";

export type PricingTier = {
  id: SubscriptionPlanId | "trial";
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  checkoutPlanId?: SubscriptionPlanId;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "trial",
    name: "7-Day Free Trial",
    price: "Free",
    period: "",
    description: "Experience the full studio workflow risk-free for 7 days.",
    features: ["5 high-res trial generations", "Watermarked exports", "Basic ad copy"],
  },
  {
    id: "growth_pro",
    name: "Growth Pro",
    price: "$19",
    period: "/mo",
    description: "Scale weekly drops with watermark-free assets and omni-channel copy.",
    features: [
      "50 generations / month",
      "No watermark",
      "Full omni-channel ad copy",
      "Priority support",
    ],
    highlighted: true,
    badge: "Current plan",
    checkoutPlanId: "growth_pro",
  },
  {
    id: "agency",
    name: "Agency",
    price: "$49",
    period: "/mo",
    description: "For teams shipping volume across clients and private-label lines.",
    features: [
      "Unlimited generations",
      "Team access",
      "Brand memory & saved assets",
      "Dedicated support",
    ],
    checkoutPlanId: "agency",
  },
];
