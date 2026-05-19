import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { buildDashboardCreditSnapshot } from "@/lib/dashboard-credits";
import { getTrialStatusForAuthUser } from "@/lib/free-trial";
import { creditsCapForDashboard } from "@/lib/subscription-tier";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  resolveGenerationEntitlement,
  type GenerationActor,
} from "@/lib/user-credits";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fdashboard");
  }

  const trialStatus = await getTrialStatusForAuthUser(user);
  const actor: GenerationActor = {
    userId: user.id,
    useMockLedger: false,
    accountCreatedAt: user.created_at ?? new Date().toISOString(),
  };
  const entitlement = await resolveGenerationEntitlement(actor);
  const creditSnapshot = buildDashboardCreditSnapshot({
    total: creditsCapForDashboard(trialStatus),
    remaining: entitlement.balance,
    unlimited: entitlement.creditsDisplayUnlimited,
  });

  return (
    <DashboardExperience
      initialTrialStatus={trialStatus}
      initialCreditSnapshot={creditSnapshot}
    />
  );
}
