import { NextResponse } from "next/server";
import { supportEmail } from "@/lib/site-legal";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

async function sendViaResend(payload: {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from,
      to: [payload.to],
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error (${res.status}): ${err.slice(0, 400)}`);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: "Please enter a subject." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Please enter a message (at least 10 characters)." },
        { status: 400 },
      );
    }
    if (message.length > 8000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const to = process.env.CONTACT_TO_EMAIL?.trim() || supportEmail();
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() || "GrowUrb AI <onboarding@resend.dev>";

    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      message,
      "",
      "---",
      `Submitted via GrowUrb AI contact form at ${new Date().toISOString()}`,
    ].join("\n");

    if (process.env.RESEND_API_KEY?.trim()) {
      await sendViaResend({
        to,
        from,
        replyTo: email,
        subject: `[GrowUrb Contact] ${subject}`,
        text,
      });
    } else {
      console.info("[contact-form]", { to, name, email, subject, message });
    }

    return NextResponse.json({
      ok: true,
      message:
        "Thank you — we received your message and will respond within one business day.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send message";
    console.error("Contact form error:", msg);
    return NextResponse.json(
      {
        error:
          "We could not send your message right now. Please email us directly at " +
          supportEmail(),
      },
      { status: 500 },
    );
  }
}
