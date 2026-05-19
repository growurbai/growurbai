import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { GenerationHistoryRecord } from "@/lib/generation-history";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("generations")
    .select("id,user_id,image_url,prompt,aspect_ratio,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load generation history", error.message);
    return NextResponse.json(
      { error: "Could not load generation history." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    generations: (data ?? []) as GenerationHistoryRecord[],
  });
}
