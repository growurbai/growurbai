import Link from "next/link";
import { DashboardOrLoginLink } from "@/components/auth/DashboardOrLoginLink";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-gold">
                <span className="text-xs font-bold text-white">GU</span>
              </span>
              <span className="font-semibold text-white">GrowUrb AI</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              Elevate catalog photography into polished brand creatives built for global D2C and
              social commerce sellers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Product
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-white">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <DashboardOrLoginLink className="hover:text-white">
                    Studio
                  </DashboardOrLoginLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Company
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help & support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Legal
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-white">
                    Cancellation & Refunds
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} GrowUrb AI. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">Mumbai • Bengaluru • Delhi NCR</p>
        </div>
      </div>
    </footer>
  );
}
