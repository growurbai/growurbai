import { Resend } from "resend";
import {
  lowCreditsWarningEmailHtml,
  paymentSuccessEmailHtml,
  trialExpiredEmailHtml,
  welcomeEmailHtml,
} from "@/lib/email-templates";
import { getResendFromEmail } from "@/lib/resend-config";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.info("[email-skipped-no-resend-key]", {
      to: params.to,
      subject: params.subject,
    });
    return false;
  }

  const { error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [params.to],
    subject: params.subject,
    html: params.html,
    tags: params.tags,
  });

  if (error) {
    console.error("[email-send-failed]", error.message);
    return false;
  }
  return true;
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
): Promise<boolean> {
  return dispatchEmail({
    to: userEmail,
    subject: "Welcome to GrowUrb AI — your studio is ready",
    html: welcomeEmailHtml(userName),
    tags: [{ name: "category", value: "welcome" }],
  });
}

export async function sendPaymentSuccessEmail(
  userEmail: string,
  tierName: string,
  creditAmount: number,
  userName?: string,
): Promise<boolean> {
  const name = userName?.trim() || userEmail.split("@")[0] || "there";
  return dispatchEmail({
    to: userEmail,
    subject: `Payment confirmed — ${tierName} is active`,
    html: paymentSuccessEmailHtml(name, tierName, creditAmount),
    tags: [
      { name: "category", value: "payment_success" },
      { name: "tier", value: tierName },
    ],
  });
}

export async function sendTrialExpiredEmail(
  userEmail: string,
  userName: string,
): Promise<boolean> {
  return dispatchEmail({
    to: userEmail,
    subject: "Your GrowUrb trial has ended — upgrade to keep generating",
    html: trialExpiredEmailHtml(userName),
    tags: [{ name: "category", value: "trial_expired" }],
  });
}

export async function sendLowCreditsWarningEmail(
  userEmail: string,
  remainingCredits: number,
  userName?: string,
): Promise<boolean> {
  const name = userName?.trim() || userEmail.split("@")[0] || "there";
  return dispatchEmail({
    to: userEmail,
    subject: `Only ${remainingCredits} credits left in your studio`,
    html: lowCreditsWarningEmailHtml(name, remainingCredits),
    tags: [{ name: "category", value: "low_credits" }],
  });
}
