"use client";

import { Building2, Clock, Loader2, Mail, MapPin, Phone, Send, User } from "lucide-react";
import { useState } from "react";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LegalSection } from "@/components/legal/LegalSection";
import {
  BRAND_NAME,
  FOUNDER_NAME,
  LEGAL_ADDRESS,
  LEGAL_ENTITY_NAME,
  LEGAL_OPERATING_REGION,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
  supportEmail,
} from "@/lib/site-legal";

const TOPICS = [
  "General inquiry",
  "Billing / cancellation",
  "Technical support",
  "Partnerships",
  "Privacy / legal",
] as const;

export function ContactPageContent() {
  const email = supportEmail();
  const [name, setName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [subject, setSubject] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: formEmail,
          subject,
          message,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send");
      }
      setFeedback({ type: "ok", text: data.message ?? "Message sent." });
      setName("");
      setFormEmail("");
      setSubject(TOPICS[0]);
      setMessage("");
    } catch (err) {
      setFeedback({
        type: "err",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-electric/50 focus:ring-2 focus:ring-electric/25";

  return (
    <LegalPageShell
      title="Contact Us"
      subtitle={`Reach ${FOUNDER_NAME} and the ${BRAND_NAME} team for support, billing, partnerships, or compliance questions. We typically respond within one business day.`}
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LegalSection title="Official business details">
            <div className="space-y-6">
              <div className="flex gap-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Business name
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">{BRAND_NAME}</p>
                  <p className="mt-1 text-sm text-zinc-400">{LEGAL_ENTITY_NAME}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Founder
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">{FOUNDER_NAME}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Business address
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-300">{LEGAL_ADDRESS}</p>
                  <p className="mt-2 text-xs text-zinc-500">{LEGAL_OPERATING_REGION}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Support email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 inline-block break-all text-sm font-medium text-electric hover:underline"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Mobile
                  </p>
                  <a
                    href={SUPPORT_PHONE_HREF}
                    className="mt-1 inline-block text-sm font-medium text-electric hover:underline"
                  >
                    {SUPPORT_PHONE}
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Support hours (IST)
                  </p>
                  <p className="mt-1 text-sm text-zinc-300">Monday–Friday, 10:00–18:00 IST</p>
                </div>
              </div>
            </div>
          </LegalSection>
        </div>

        <div className="lg:col-span-3">
          <LegalSection title="Send a message">
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="text-xs font-medium text-zinc-400">
                  Full name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-xs font-medium text-zinc-400">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="text-xs font-medium text-zinc-400">
                  Topic
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="text-xs font-medium text-zinc-400">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  minLength={10}
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder="How can we help?"
                />
              </div>

              {feedback ? (
                <div
                  role="alert"
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    feedback.type === "ok"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                      : "border-red-500/30 bg-red-500/10 text-red-100"
                  }`}
                >
                  {feedback.text}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] via-violet-600 to-[#7c3aed] py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_-8px_rgba(124,58,237,0.55)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-4 w-4" aria-hidden />
                )}
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>
          </LegalSection>
        </div>
      </div>
    </LegalPageShell>
  );
}
