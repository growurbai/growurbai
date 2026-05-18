import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const EMAIL_NOTIFICATION_KEYS = {
  welcome: "welcome",
  trialExpired: "trial_expired",
  lowCreditsAt5: "low_credits_at_5",
} as const;

export type EmailNotificationKey =
  | (typeof EMAIL_NOTIFICATION_KEYS)[keyof typeof EMAIL_NOTIFICATION_KEYS]
  | `payment_${string}`;

/**
 * Returns true if this notification slot was claimed (first send).
 * Returns false if already sent (duplicate / retry).
 */
export async function claimEmailNotificationSlot(
  userId: string,
  notificationKey: string,
): Promise<boolean> {
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("user_email_log")
      .insert({
        user_id: userId,
        notification_key: notificationKey,
      })
      .select("user_id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") return false;
      console.warn("user_email_log insert failed", error.message);
      return true;
    }
    return data != null;
  } catch (err) {
    console.warn("user_email_log unavailable", err);
    return true;
  }
}
