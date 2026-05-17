import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNavbar } from "@/components/SiteNavbar";
import { LEGAL_LAST_UPDATED } from "@/lib/site-legal";

type LegalPageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, subtitle, children }: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-midnight">
      <SiteNavbar />
      <main className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(50vh,480px)] bg-gradient-to-b from-electric/[0.14] via-transparent to-transparent"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-32">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
          >
            <span aria-hidden>←</span> Back to home
          </Link>

          <header className="mb-10 border-b border-white/[0.08] pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-electric">
              Legal & compliance
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">{subtitle}</p>
            <p className="mt-4 text-xs text-zinc-600">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
          </header>

          <article className="space-y-10">{children}</article>

          <nav
            className="mt-14 flex flex-wrap gap-3 border-t border-white/[0.08] pt-8 text-sm"
            aria-label="Related legal pages"
          >
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/refund", label: "Refunds" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-zinc-400 transition hover:border-electric/40 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
