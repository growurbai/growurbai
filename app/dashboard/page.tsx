import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
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

  return <DashboardExperience />;
}
