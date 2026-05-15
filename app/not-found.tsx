import Link from "next/link";
import { DashboardOrLoginLink } from "@/components/auth/DashboardOrLoginLink";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-midnight px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
        This page vanished into the render queue.
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-500">
        The URL may be outdated. Head back home or open the studio to resume
        your brand kit workflow.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Back to homepage
        </Link>
        <DashboardOrLoginLink className="rounded-lg bg-gradient-to-r from-electric to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
          Open dashboard
        </DashboardOrLoginLink>
      </div>
    </div>
  );
}
