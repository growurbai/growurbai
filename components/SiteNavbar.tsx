import Link from "next/link";
import { SiteNavbarAuth } from "@/components/SiteNavbarAuth";
import { SmoothScrollLink } from "@/components/landing/SmoothScrollLink";

const navLinks = [
  { href: "/#features", label: "What we offer" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
] as const;

export function SiteNavbar() {
  return (
    <header className="hero-nav-glass fixed inset-x-0 top-0 z-50 border-b bg-midnight/45 backdrop-blur-2xl transition-[background,box-shadow] duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
          aria-label="GrowUrb AI home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-gold shadow-glow">
            <span className="text-xs font-bold text-white">GU</span>
          </span>
          <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
            GrowUrb<span className="text-gold"> AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:gap-6 md:flex" aria-label="Primary">
          {navLinks.map((item) => (
            <SmoothScrollLink
              key={item.href}
              href={item.href}
              className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:inline"
            >
              {item.label}
            </SmoothScrollLink>
          ))}
          <SiteNavbarAuth />
        </nav>
      </div>
    </header>
  );
}
