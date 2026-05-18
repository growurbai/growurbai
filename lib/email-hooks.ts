import {
  claimEmailNotificationSlot,
  EMAIL_NOTIFICATION_KEYS,
} from "@/lib/email-notification-log";
import {
  sendLowCreditsWarningEmail,
  sendPaymentSuccessEmail,
  sendTrialExpiredEmail,
  sendWelcomeEmail,
} from "@/lib/email-service";
import { getAuthUserContact } from "@/lib/email-user";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/lib/stripe/plans";
import { creditCapForPaidPlan } from "@/lib/subscription-tier";

/** Fire-and-forget wrapper — never throws to callers. */
function queueEmail(task: () => Promise<void>): void {
  void task().catch((err) => {
    console.error("[email-hook]", err);
  });
}

export function hookWelcomeEmail(userId: string, userEmail: string, userName: string): void {
  queueEmail(async () => {
    const claimed = await claimEmailNotificationSlot(
      userId,
      EMAIL_NOTIFICATION_KEYS.welcome,
    );
    if (!claimed) return;
    await sendWelcomeEmail(userEmail, userName);
  });
}

export function hookWelcomeEmailForUser(userId: string): void {
  queueEmail(async () => {
    const contact = await getAuthUserContact(userId);
    if (!contact) return;
    const claimed = await claimEmailNotificationSlot(
      userId,
      EMAIL_NOTIFICATION_KEYS.welcome,
    );
    if (!claimed) return;
    await sendWelcomeEmail(contact.email, contact.name);
  });
}

export function hookPaymentSuccessEmail(params: {
  userId: string;
  userEmail: string;
  userName?: string;
  planId: SubscriptionPlanId;
  invoiceId?: string;
}): void {
  queueEmail(async () => {
    const key = params.invoiceId
      ? `payment_${params.invoiceId}`
      : `payment_${params.planId}_${Date.now()}`;
    const claimed = await claimEmailNotificationSlot(params.userId, key);
    if (!claimed) return;

    const tierName = SUBSCRIPTION_PLANS[params.planId].name;
    const creditAmount = creditCapForPaidPlan(params.planId);
    await sendPaymentSuccessEmail(
      params.userEmail,
      tierName,
      creditAmount,
      params.userName,
    );
  });
}

export function hookTrialExpiredEmail(userId: string): void {
  queueEmail(async () => {
    const claimed = await claimEmailNotificationSlot(
      userId,
      EMAIL_NOTIFICATION_KEYS.trialExpired,
    );
    if (!claimed) return;

    const contact = await getAuthUserContact(userId);
    if (!contact) return;
    await sendTrialExpiredEmail(contact.email, contact.name);
  });
}

export function hookLowCreditsWarningEmail(
  userId: string,
  remainingCredits: number,
): void {
  if (remainingCredits !== 5) return;

  queueEmail(async () => {
    const claimed = await claimEmailNotificationSlot(
      userId,
      EMAIL_NOTIFICATION_KEYS.lowCreditsAt5,
    );
    if (!claimed) return;

    const contact = await getAuthUserContact(userId);
    if (!contact) return;
    await sendLowCreditsWarningEmail(
      contact.email,
      remainingCredits,
      contact.name,
    );
  });
}
