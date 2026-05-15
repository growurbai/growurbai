"use client";

import {
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
  Play,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountPageShell } from "@/components/account/AccountPageShell";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What is GrowUrb AI?",
    a: "GrowUrb turns plain product photos into premium ad creatives and channel-ready copy — tuned for Indian D2C and social sellers.",
  },
  {
    q: "How many images do I get per generation?",
    a: "Each run produces four layout variants plus omni-channel copy (Facebook, Instagram, Google-style, and PDP bullets) from one hero upload.",
  },
  {
    q: "Do credits roll over?",
    a: "Your plan defines credit refresh rules. Growth Pro currently shows 47 credits in-app; billing details follow your subscription in the future billing portal.",
  },
  {
    q: "Which file types can I upload?",
    a: "Use PNG or JPG hero shots up to 20 MB in the studio. For best results, use a clear subject and even lighting.",
  },
  {
    q: "Is my data secure?",
    a: "Auth runs through Supabase. Images are processed for generation only; follow your internal retention policy for sensitive SKUs.",
  },
  {
    q: "How do I get help?",
    a: "Use WhatsApp or email below for priority support. We typically respond within one business day.",
  },
];

function whatsappHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, "") ?? "";
  if (raw.length < 10) return null;
  return `https://wa.me/${raw}`;
}

function supportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@growurb.ai";
}

export function HelpPageContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const wa = whatsappHref();
  const email = supportEmail();

  return (
    <AccountPageShell
      title="Help & Support"
      subtitle="Guides, FAQs, and direct lines to our team — same dark studio vibe as your dashboard."
    >
      <div className="flex flex-col gap-10 lg:gap-14">
        {/* FAQ */}
        <section className="rounded-[1.35rem] border border-white/[0.1] bg-white/[0.04] p-5 shadow-glass backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-2 text-zinc-400">
            <HelpCircle className="h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">FAQ</h2>
          </div>
          <ul className="mt-6 space-y-2">
            {FAQ_ITEMS.map((item, i) => {
              const open = openIndex === i;
              return (
                <li
                  key={item.q}
                  className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25 transition hover:border-white/[0.12]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5 sm:py-4"
                  >
                    <span className="text-sm font-medium text-white sm:text-base">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-zinc-500 transition ${open ? "rotate-180 text-electric" : ""}`}
                      strokeWidth={2}
                    />
                  </button>
                  {open ? (
                    <div className="border-t border-white/[0.06] px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                      <p className="text-sm leading-relaxed text-zinc-400">{item.a}</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Contact CTAs */}
        <section className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-4">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-1 min-w-[200px] items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-5 text-base font-semibold text-white shadow-glow transition hover:brightness-105 sm:py-6"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 bg-[length:200%_100%]"
              />
              <span className="absolute inset-px rounded-2xl bg-gradient-to-b from-white/15 to-transparent opacity-40" />
              <MessageCircle className="relative h-6 w-6 shrink-0" strokeWidth={2} />
              <span className="relative">Chat on WhatsApp</span>
            </a>
          ) : (
            <div className="flex flex-1 min-w-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.03] px-6 py-5 text-center sm:py-6">
              <MessageCircle className="mx-auto h-6 w-6 text-zinc-500" strokeWidth={2} />
              <p className="mt-2 text-sm text-zinc-500">
                Set{" "}
                <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                  NEXT_PUBLIC_SUPPORT_WHATSAPP
                </code>{" "}
                (digits only) in <span className="text-zinc-400">.env.local</span> to enable WhatsApp.
              </p>
            </div>
          )}

          <a
            href={`mailto:${email}?subject=GrowUrb%20AI%20—%20Support`}
            className="group relative flex flex-1 min-w-[200px] items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.06] px-6 py-5 text-base font-semibold text-white transition hover:border-electric/40 hover:bg-white/[0.1] sm:py-6"
          >
            <Mail className="h-6 w-6 shrink-0 text-electric" strokeWidth={2} />
            Email support
          </a>
        </section>

        {/* Video placeholder */}
        <section className="rounded-[1.35rem] border border-white/[0.1] bg-white/[0.04] p-5 shadow-glass backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Play className="h-4 w-4 text-electric" strokeWidth={2} />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              How to use GrowUrb
            </h2>
            <Sparkles className="h-4 w-4 text-gold" strokeWidth={2} />
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            Walkthrough video — embed your Loom or YouTube URL here later.
          </p>
          <div className="relative mt-6 flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-electric/[0.15] via-[#1a1025] to-black/80">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.2),transparent_65%)]" />
            <div className="relative flex flex-col items-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <Play className="ml-1 h-8 w-8 text-white" fill="currentColor" strokeWidth={0} />
              </span>
              <span className="text-sm font-medium text-zinc-300">Video coming soon</span>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-zinc-600">
            Tip: open the{" "}
            <Link href="/dashboard" className="font-medium text-electric hover:underline">
              studio
            </Link>{" "}
            and upload a product shot to try a full generation.
          </p>
        </section>
      </div>
    </AccountPageShell>
  );
}
