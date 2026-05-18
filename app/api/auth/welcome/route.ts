import { NextResponse } from "next/server";
import { hookWelcomeEmailForUser } from "@/lib/email-hooks";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Idempotent welcome email after first authenticated session (signup / OAuth). */
export async function POST() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  hookWelcomeEmailForUser(user.id);

  return NextResponse.json({ ok: true, queued: true });
}
