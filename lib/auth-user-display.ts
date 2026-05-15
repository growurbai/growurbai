import type { User } from "@supabase/supabase-js";

/**
 * Prefer explicit `user_metadata.avatar_url` (Google OAuth),
 * then other common OAuth fields and identity payloads.
 */
export function getUserAvatarUrl(user: User): string | null {
  const meta = user.user_metadata ?? {};

  const fromMeta =
    (typeof meta.avatar_url === "string" && meta.avatar_url.trim()) ||
    (typeof meta.picture === "string" && meta.picture.trim()) ||
    (typeof meta.avatar === "string" && meta.avatar.trim());

  if (fromMeta) return fromMeta;

  const identities = user.identities ?? [];
  for (const id of identities) {
    const data = id.identity_data as Record<string, unknown> | undefined;
    if (!data) continue;
    const pic =
      (typeof data.avatar_url === "string" && data.avatar_url) ||
      (typeof data.picture === "string" && data.picture);
    if (pic && pic.trim()) return pic.trim();
  }

  return null;
}

export function getUserFirstName(user: User): string {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  const trimmed = full.trim();
  if (trimmed) return trimmed.split(/\s+/)[0] ?? "there";

  const email = user.email?.split("@")[0];
  if (email) return email.charAt(0).toUpperCase() + email.slice(1);

  return "there";
}

export function getUserDisplayName(user: User): string {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim());
  if (full) return full;
  const email = user.email?.split("@")[0];
  if (email) return email.charAt(0).toUpperCase() + email.slice(1);
  return "User";
}

export function getUserInitial(user: User): string {
  const first = getUserFirstName(user);
  return first.charAt(0).toUpperCase();
}
