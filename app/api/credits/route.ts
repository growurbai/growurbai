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
}
