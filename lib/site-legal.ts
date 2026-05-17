/** Official Growurb AI business identity (legal & compliance pages). */
export const BRAND_NAME = "Growurb AI";

export const FOUNDER_NAME = "Mr. Karan";

export const LEGAL_ENTITY_NAME =
  process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME?.trim() || BRAND_NAME;

export const LEGAL_ADDRESS =
  process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() ||
  "Village Manai, City Jodhpur, State Rajasthan, India";

export const LEGAL_OPERATING_REGION =
  process.env.NEXT_PUBLIC_LEGAL_OPERATING_REGION?.trim() || "Jodhpur, Rajasthan, India";

export const SUPPORT_PHONE =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || "+91 8107367659";

export const SUPPORT_PHONE_HREF = "tel:+918107367659";

export function supportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "team.growurb@gmail.com";
}

export const LEGAL_LAST_UPDATED = "May 16, 2026";
