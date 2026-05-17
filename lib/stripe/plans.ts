export type SubscriptionPlanId = "growth_pro" | "agency";

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanId,
  { name: string; priceLabel: string }
> = {
  growth_pro: { name: "Growth Pro", priceLabel: "$19/mo" },
  agency: { name: "Agency", priceLabel: "$49/mo" },
};

export function isSubscriptionPlanId(value: string): value is SubscriptionPlanId {
  return value === "growth_pro" || value === "agency";
}

export function getStripePriceId(planId: SubscriptionPlanId): string {
  const envKey =
    planId === "growth_pro"
      ? process.env.STRIPE_PRICE_GROWTH_PRO
      : process.env.STRIPE_PRICE_AGENCY;
  const priceId = envKey?.trim();
  if (!priceId) {
    throw new Error(
      planId === "growth_pro"
        ? "STRIPE_PRICE_GROWTH_PRO is not configured"
        : "STRIPE_PRICE_AGENCY is not configured",
    );
  }
  return priceId;
}

export function planIdFromStripePriceId(priceId: string): SubscriptionPlanId | null {
  const growth = process.env.STRIPE_PRICE_GROWTH_PRO?.trim();
  const agency = process.env.STRIPE_PRICE_AGENCY?.trim();
  if (priceId === growth) return "growth_pro";
  if (priceId === agency) return "agency";
  return null;
}
