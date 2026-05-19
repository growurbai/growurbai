"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  {
    href: "/dashboard/history",
    label: "Generation History",
    description: "Saved brand kit assets",
    icon: <GalleryIcon />,
  },
  {
    href: "/dashboard/settings",
    label: "Account Settings",
    description: "Profile & billing controls",
    icon: <SettingsIcon />,
  },
] as const;

export function DashboardNavigationLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard navigation"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1"
    >
      {NAV_LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`group relative overflow-hidden rounded-2xl border p-3 transition duration-300 ${
              active
                ? "border-electric/45 bg-electric/15 text-white shadow-[0_0_32px_-12px_rgba(124,58,237,0.75)]"
                : "border-white/[0.08] bg-white/[0.035] text-zinc-400 hover:border-electric/30 hover:bg-electric/10 hover:text-white"
            }`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-electric/10 via-transparent to-gold/10 opacity-0 transition group-hover:opacity-100"
            />
            <span className="relative flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                  active
                    ? "border-electric/35 bg-electric/25 text-violet-100"
                    : "border-white/[0.08] bg-black/30 text-zinc-500 group-hover:border-electric/25 group-hover:text-violet-200"
                }`}
              >
                {link.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold tracking-tight">
                  {link.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-zinc-500">
                  {link.description}
                </span>
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function GalleryIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM16 11h2a2 2 0 012 2v6a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 8h2m6 8h.01"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
