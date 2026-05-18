"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Props = {
  hrefWhenAuthed?: string;
  hrefWhenGuest?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Resolves to `/dashboard` when signed in, otherwise guest href (default `/login?next=/dashboard`).
 */
export function DashboardOrLoginLink({
  hrefWhenAuthed = "/dashboard",
  hrefWhenGuest = "/dashboard",
  className,
  children,
}: Props) {
  const [target, setTarget] = useState(hrefWhenGuest);

  useEffect(() => {
    const supabase = createClient();

    const sync = () => {
      void supabase.auth.getUser().then(({ data: { user } }) => {
        setTarget(user ? hrefWhenAuthed : hrefWhenGuest);
      });
    };

    sync();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      sync();
    });
    return () => subscription.unsubscribe();
  }, [hrefWhenAuthed, hrefWhenGuest]);

  return (
    <Link href={target} className={className}>
      {children}
    </Link>
  );
}
