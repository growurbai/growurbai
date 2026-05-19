import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardNavigationLinks } from "@/components/dashboard/DashboardNavigationLinks";
import { GenerationHistoryGallery } from "@/components/dashboard/history/GenerationHistoryGallery";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Generation History",
  description: "Browse and manage saved GrowUrb AI generation history.",
};

export default async function GenerationHistoryPage() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fdashboard%2Fhistory");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[min(55vh,520px)] bg-gradient-to-b from-electric/[0.12] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-32 top-24 h-80 w-80 rounded-full bg-electric/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -left-32 bottom-10 h-80 w-80 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
          >
            <span aria-hidden>←</span> Back to studio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center justify-center rounded-full border border-electric/35 bg-electric/15 px-4 py-2 text-xs font-bold uppercase tracking-wide text-violet-100 transition hover:border-electric/55 hover:bg-electric/25"
          >
            Generate New Kit
          </Link>
        </div>

        <div className="mb-8">
          <DashboardNavigationLinks />
        </div>

        <GenerationHistoryGallery />
      </div>
    </main>
  );
}
