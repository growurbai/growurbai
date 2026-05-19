import { NextResponse } from "next/server";
import { buildDashboardCreditSnapshot } from "@/lib/dashboard-credits";
import { getTrialStatusForAuthUser } from "@/lib/free-trial";
import { creditsCapForDashboard } from "@/lib/subscription-tier";
import {
  resolveGenerationEntitlement,
  type GenerationActor,
} from "@/lib/user-credits";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    if (!supabase) {
      console.error("[api/credits] Supabase server client is not configured");
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
      console.warn("[api/credits] Unauthorized request", authError?.message);
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const trialStatus = await getTrialStatusForAuthUser(user);
    const actor: GenerationActor = {
      userId: user.id,
      useMockLedger: false,
      accountCreatedAt: user.created_at ?? new Date().toISOString(),
    };
    const entitlement = await resolveGenerationEntitlement(actor);

    return NextResponse.json({
      credits: buildDashboardCreditSnapshot({
        total: creditsCapForDashboard(trialStatus),
        remaining: entitlement.balance,
        unlimited: entitlement.creditsDisplayUnlimited,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load credits.";
    console.error("[api/credits] Route failure:", message);
    const status = message.includes("configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
