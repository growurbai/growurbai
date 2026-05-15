import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AccountPageShell({ title, subtitle, children }: Props) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[min(55vh,520px)] bg-gradient-to-b from-electric/[0.12] via-transparent to-transparent"
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-12">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
        >
          <span aria-hidden>←</span> Back to studio
        </Link>

        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            GrowUrb AI
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-500">{subtitle}</p>
          ) : null}
        </header>

        {children}
      </div>
    </div>
  );
}
