const BRAND = "GrowUrb AI";

function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000";
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type LayoutParams = {
  preheader: string;
  headline: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
};

export function renderEmailLayout(params: LayoutParams): string {
  const preheader = escapeHtml(params.preheader);
  const headline = escapeHtml(params.headline);
  const footerNote = escapeHtml(
    params.footerNote ??
      "You received this because you have a GrowUrb AI account or completed a billing action.",
  );
  const cta =
    params.ctaLabel && params.ctaHref
      ? `<tr>
          <td style="padding:28px 32px 8px;">
            <a href="${escapeHtml(params.ctaHref)}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 50%,#7c3aed 100%);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px;box-shadow:0 0 32px rgba(124,58,237,0.45);">
              ${escapeHtml(params.ctaLabel)}
            </a>
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050508;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0c0a12;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.55);">
          <tr>
            <td style="padding:32px 32px 20px;background:linear-gradient(180deg,rgba(124,58,237,0.18) 0%,transparent 100%);">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#a78bfa;">${BRAND}</p>
              <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:700;color:#fafafa;">${headline}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 8px;font-size:15px;line-height:1.65;color:#a1a1aa;">
              ${params.bodyHtml}
            </td>
          </tr>
          ${cta}
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:11px;line-height:1.5;color:#52525b;">${footerNote}</p>
              <p style="margin:12px 0 0;font-size:11px;color:#71717a;">© ${new Date().getFullYear()} ${BRAND}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailHtml(userName: string): string {
  const name = escapeHtml(userName);
  const dashboard = `${siteUrl()}/dashboard`;
  return renderEmailLayout({
    preheader: "Your 7-day studio trial is live — upload a product and generate your first Brand Kit.",
    headline: `Welcome to ${BRAND}, ${name}`,
    bodyHtml: `
      <p style="margin:0 0 16px;color:#e4e4e7;">You&apos;re in. Your premium AI studio is ready to turn product photos into agency-grade ads in under a minute.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.28);border-radius:12px;">
        <tr><td style="padding:16px 18px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#c4b5fd;">Included now</p>
          <ul style="margin:0;padding:0 0 0 18px;color:#d4d4d8;font-size:14px;line-height:1.7;">
            <li>7-day full studio access</li>
            <li>4 layout placements per generation</li>
            <li>Omni-channel ad copy (Meta, Google, PDP)</li>
          </ul>
        </td></tr>
      </table>
      <p style="margin:0;color:#a1a1aa;">Upload one hero shot to unlock four channel-ready creatives instantly.</p>
    `,
    ctaLabel: "Open Brand Kit Studio",
    ctaHref: dashboard,
  });
}

export function paymentSuccessEmailHtml(
  userName: string,
  tierName: string,
  creditAmount: number,
): string {
  const name = escapeHtml(userName);
  const tier = escapeHtml(tierName);
  const creditsLabel =
    creditAmount >= 5000
      ? "Unlimited priority lane + 5,000 credit pool"
      : `${creditAmount.toLocaleString()} studio credits`;
  return renderEmailLayout({
    preheader: `Payment confirmed — ${tierName} is active on your account.`,
    headline: "Payment successful",
    bodyHtml: `
      <p style="margin:0 0 16px;color:#e4e4e7;">Hi ${name}, thank you. Your <strong style="color:#fbbf24;">${tier}</strong> subscription is now active.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.28);border-radius:12px;">
        <tr><td style="padding:16px 18px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#fbbf24;">Provisioned</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#fafafa;">${escapeHtml(creditsLabel)}</p>
        </td></tr>
      </table>
      <p style="margin:0;color:#a1a1aa;">Watermark-free exports, live OpenAI generation, and full omni-channel copy are unlocked on your dashboard.</p>
    `,
    ctaLabel: "Go to dashboard",
    ctaHref: `${siteUrl()}/dashboard`,
    footerNote: "This receipt confirms your Stripe subscription payment to GrowUrb AI.",
  });
}

export function trialExpiredEmailHtml(userName: string): string {
  const name = escapeHtml(userName);
  return renderEmailLayout({
    preheader: "Your 7-day trial has ended — upgrade to keep generating Brand Kits.",
    headline: "Your trial has ended",
    bodyHtml: `
      <p style="margin:0 0 16px;color:#e4e4e7;">Hi ${name}, your 7-day GrowUrb studio trial has expired. Your account and saved work are safe — generation is paused until you upgrade.</p>
      <p style="margin:0 0 16px;color:#fca5a5;font-size:14px;">Upgrade to <strong style="color:#fafafa;">Growth Pro</strong> to resume 8K-ready catalog drops, unlimited-style monthly credits, and priority exports.</p>
      <p style="margin:0;color:#a1a1aa;">One click restores full studio access with secure Stripe checkout.</p>
    `,
    ctaLabel: "Upgrade to GrowUrb Pro",
    ctaHref: `${siteUrl()}/dashboard`,
  });
}

export function lowCreditsWarningEmailHtml(
  userName: string,
  remainingCredits: number,
): string {
  const name = escapeHtml(userName);
  const remaining = escapeHtml(String(remainingCredits));
  return renderEmailLayout({
    preheader: `Only ${remainingCredits} generation credits left on your account.`,
    headline: "Credits running low",
    bodyHtml: `
      <p style="margin:0 0 16px;color:#e4e4e7;">Hi ${name}, you have <strong style="color:#fbbf24;">${remaining} credits</strong> remaining in your studio allowance.</p>
      <p style="margin:0 0 16px;color:#a1a1aa;">Each Brand Kit run uses one credit and delivers four layout placements plus omni-channel copy. Consider upgrading before your next campaign drop.</p>
      <p style="margin:0;color:#71717a;font-size:13px;">Growth Pro includes 500 monthly credits; Agency includes a 5,000-credit priority pool.</p>
    `,
    ctaLabel: "View plans & upgrade",
    ctaHref: `${siteUrl()}/#pricing`,
  });
}
