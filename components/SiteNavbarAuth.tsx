"use client";

import type { User } from "@supabase/supabase-js";
import {
  CreditCard,
  HelpCircle,
  Images,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserAvatarButton } from "@/components/UserAvatarButton";
import { getUserFirstName } from "@/lib/auth-user-display";
import { createClient } from "@/lib/supabase";

export function SiteNavbarAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const sync = () => {
      void supabase.auth.getUser().then(({ data: { user: u } }) => {
        setUser(u ?? null);
        setReady(true);
      });
    };

    sync();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      sync();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  if (!ready) {
    return (
      <span
        className="inline-block h-10 w-24 animate-pulse rounded-lg bg-white/10"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login?next=%2F"
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:border-electric/40 hover:bg-electric/15 sm:px-4 sm:text-sm"
      >
        Sign In
      </Link>
    );
  }

  const firstName = getUserFirstName(user);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-3 transition hover:border-white/25 hover:bg-white/10"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <UserAvatarButton user={user} />
        <span className="max-w-[7rem] truncate text-sm font-medium text-white sm:max-w-[9rem]">
          {firstName}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition ${menuOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen ? (
        <ProfileDropdown setMenuOpen={setMenuOpen} onLogout={handleLogout} />
      ) : null}
    </div>
  );
}

const menuItemClass =
  "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-200 transition hover:bg-white/[0.07] hover:text-white";

function ProfileDropdown({
  setMenuOpen,
  onLogout,
}: {
  setMenuOpen: (open: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121212]/98 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl"
    >
      <Link
        href="/dashboard"
        role="menuitem"
        onClick={() => setMenuOpen(false)}
        className={menuItemClass}
      >
        <LayoutDashboard className="h-[18px] w-[18px] shrink-0 text-electric stroke-[1.75]" />
        Dashboard
      </Link>
      <Link
        href="/my-creations"
        role="menuitem"
        onClick={() => setMenuOpen(false)}
        className={menuItemClass}
      >
        <Images className="h-[18px] w-[18px] shrink-0 text-zinc-400 stroke-[1.75]" />
        My Creations
      </Link>
      <Link
        href="/#pricing"
        role="menuitem"
        onClick={() => setMenuOpen(false)}
        className={menuItemClass}
      >
        <CreditCard className="h-[18px] w-[18px] shrink-0 text-zinc-400 stroke-[1.75]" />
        Plans &amp; Billing
      </Link>
      <Link
        href="/settings"
        role="menuitem"
        onClick={() => setMenuOpen(false)}
        className={menuItemClass}
      >
        <Settings className="h-[18px] w-[18px] shrink-0 text-zinc-400 stroke-[1.75]" />
        Settings
      </Link>
      <Link
        href="/help"
        role="menuitem"
        onClick={() => setMenuOpen(false)}
        className={menuItemClass}
      >
        <HelpCircle className="h-[18px] w-[18px] shrink-0 text-zinc-400 stroke-[1.75]" />
        Help Support
      </Link>

      <div className="mx-3 my-1.5 h-px bg-white/[0.08]" />

      <button
        type="button"
        role="menuitem"
        onClick={onLogout}
        className={`${menuItemClass} text-red-400 hover:bg-red-500/10 hover:text-red-300`}
      >
        <LogOut className="h-[18px] w-[18px] shrink-0 stroke-[1.75] text-red-400" />
        Logout
      </button>
    </div>
  );
}
