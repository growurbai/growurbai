import { NextResponse } from "next/server";
import { getTrialStatusForAuthUser } from "@/lib/free-trial";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const trial = await getTrialStatusForAuthUser(user);
  return NextResponse.json(trial);
}
