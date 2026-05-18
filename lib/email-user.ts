import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type UserContact = {
  userId: string;
  email: string;
  name: string;
};

export function displayNameFromMetadata(
  metadata: Record<string, unknown> | undefined,
  email: string,
): string {
  const full = metadata?.full_name;
  if (typeof full === "string" && full.trim().length > 0) {
    return full.trim();
  }
  const local = email.split("@")[0] ?? "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export async function getAuthUserContact(userId: string): Promise<UserContact | null> {
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user?.email) {
      console.warn("getAuthUserContact failed", error?.message);
      return null;
    }
    const email = data.user.email;
    return {
      userId,
      email,
      name: displayNameFromMetadata(
        data.user.user_metadata as Record<string, unknown> | undefined,
        email,
      ),
    };
  } catch (err) {
    console.warn("getAuthUserContact unavailable", err);
    return null;
  }
}
