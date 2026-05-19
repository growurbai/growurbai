export const DEFAULT_RESEND_FROM_EMAIL = "GrowUrb AI <welcome@growurb.com>";

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM_EMAIL;
}
