import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { getTrialStatusForAuthUser } from "@/lib/free-trial";
import { DEFAULT_GENERATION_CREDITS } from "@/lib/user-credits-constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  const { data: creditsRow } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  const initialCreditsRemaining =
    typeof creditsRow?.balance === "number"
      ? creditsRow.balance
      : DEFAULT_GENERATION_CREDITS;

  return (
    <DashboardExperience
      initialTrialStatus={trialStatus}
      initialCreditsRemaining={initialCreditsRemaining}
    />
  );
}
