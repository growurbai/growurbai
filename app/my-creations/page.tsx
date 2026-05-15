import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Creations",
};

export default function MyCreationsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-midnight px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Coming soon</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">My Creations</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Save and revisit your generated brand kits here. We&apos;re finishing this space.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-xl bg-gradient-to-r from-electric to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-glow"
      >
        Open studio
      </Link>
    </div>
  );
}
