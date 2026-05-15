/** Default bucket name — create in Supabase Dashboard → Storage, set to public for logo URLs. */
export function getBrandAssetsBucket(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_BRAND_BUCKET?.trim() || "brand-assets";
}

export const BRAND_LOGO_PATH = "logo";
