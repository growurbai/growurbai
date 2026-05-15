"use client";

import { useCallback, useState } from "react";
import { getUserAvatarUrl, getUserInitial } from "@/lib/auth-user-display";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User;
  /** Extra classes (use `!` modifiers to override size if needed). */
  className?: string;
  /** Default `md` matches navbar. */
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-20 w-20 text-lg",
};

const sizePx: Record<NonNullable<Props["size"]>, number> = {
  sm: 32,
  md: 36,
  lg: 80,
};

/**
 * Google profile URLs often 403 without `referrerPolicy="no-referrer"`.
 * Uses native <img> so any OAuth host works without expanding next/image allowlists.
 */
export function UserAvatarButton({ user, className, size = "md" }: Props) {
  const url = getUserAvatarUrl(user);
  const initial = getUserInitial(user);
  const [failed, setFailed] = useState(false);
  const dim = sizePx[size];
  const box = sizeClasses[size];

  const onError = useCallback(() => setFailed(true), []);

  if (!url || failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric to-gold font-bold text-white ring-1 ring-white/20 ${box} ${className ?? ""}`}
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- OAuth avatars need referrerPolicy; hosts vary (Google, etc.)
    <img
      src={url}
      alt=""
      width={dim}
      height={dim}
      referrerPolicy="no-referrer"
      className={`shrink-0 rounded-full object-cover ring-1 ring-white/20 ${box} ${className ?? ""}`}
      onError={onError}
    />
  );
}
