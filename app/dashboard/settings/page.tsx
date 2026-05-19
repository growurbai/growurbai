import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BillingPortalButton } from "@/components/dashboard/settings/BillingPortalButton";
import { getTrialStatusForAuthUser } from "@/lib/free-trial";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/plans";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserDisplayName, getUserInitial } from "@/lib/auth-user-display";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Settings",
  description: "Manage profile, billing, and account controls for GrowUrb AI.",
};

type SubscriptionSnapshot = {
  plan: "free" | "trial" | "growth_pro" | "agency";
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
};

export default async function DashboardSettingsPage() {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    redirect("/login?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fdashboard%2Fsettings");
  }

  const trialStatus = await getTrialStatusForAuthUser(user);
  const { data: subscriptionRow } = await supabase
    .from("subscriptions")
    .select("plan,status,current_period_end,stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const subscription = normalizeSubscription(subscriptionRow);
  const displayName = getUserDisplayName(user);
  const email = user.email ?? "No email available";
  const createdAt = user.created_at
    ? formatDateTime(user.created_at)
    : "Not available";
  const tier = resolveTierLabel(subscription, trialStatus.hasPaidPlan);
  const status = subscription?.status ?? (trialStatus.expired ? "trial_expired" : "trialing");
  const renewal = subscription?.current_period_end
    ? formatDateTime(subscription.current_period_end)
    : trialStatus.hasPaidPlan
      ? "Managed in Stripe"
      : `Trial ends ${formatDate(trialStatus.trialEndsAt)}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[min(55vh,520px)] bg-gradient-to-b from-electric/[0.12] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-32 top-20 h-96 w-96 rounded-full bg-electric/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -left-32 bottom-12 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
          >
            <span aria-hidden>←</span> Back to studio
          </Link>
          <Link
            href="/dashboard/history"
            className="inline-flex w-fit items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-300 transition hover:border-electric/35 hover:bg-electric/15 hover:text-white"
          >
            View History
          </Link>
        </div>

        <header className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-violet-300/80">
            Account command center
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Settings & Profile
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
            Manage identity, billing access, and account control policies from one
            secure dashboard surface.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <SettingsCard
            kicker="Card A"
            title="Profile Settings"
            description="Your authenticated workspace identity and account metadata."
          >
            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/30 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-gold text-lg font-bold text-white shadow-[0_0_32px_-8px_rgba(124,58,237,0.7)]">
                {getUserInitial(user)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight text-white">
                  {displayName}
                </p>
                <span className="mt-1 inline-flex max-w-full items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                  <span className="truncate">{email}</span>
                </span>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoPill label="User ID" value={shortenId(user.id)} />
              <InfoPill label="Created" value={createdAt} />
              <InfoPill label="Auth provider" value={user.app_metadata?.provider ?? "email"} />
              <InfoPill label="Email status" value={user.email_confirmed_at ? "Verified" : "Pending"} />
            </dl>
          </SettingsCard>

          <SettingsCard
            kicker="Card B"
            title="Subscription & Billing Management"
            description="Open Stripe’s secure customer portal to manage cards, invoices, renewals, and cancellation."
            accent
          >
            <div className="rounded-2xl border border-electric/20 bg-gradient-to-br from-electric/15 via-white/[0.04] to-gold/10 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-200/90">
                    Active tier
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {tier}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Status: <span className="font-medium text-zinc-200">{humanizeStatus(status)}</span>
                  </p>
                </div>
                <TierBadge tier={tier} paid={trialStatus.hasPaidPlan} />
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoPill label="Customer" value={subscription?.stripe_customer_id ? "Stripe linked" : "Portal creates on demand"} />
                <InfoPill label="Renewal / Trial" value={renewal} />
              </dl>

              <div className="mt-6">
                <BillingPortalButton />
                <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                  Stripe handles payment methods, invoice history, plan updates, and
                  billing profile changes using a secure hosted portal.
                </p>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            kicker="Card C"
            title="Data Account Control"
            description="Govern future developer access, account exports, and deletion workflows."
            className="lg:col-span-2"
          >
            <div className="grid gap-3 md:grid-cols-3">
              <ControlAction
                title="Generate API Token"
                description="Create scoped API keys for automated catalog workflows."
                label="Coming soon"
              />
              <ControlAction
                title="Export Account Data"
                description="Prepare a secure export of profile, billing, and generation metadata."
                label="Request export"
              />
              <ControlAction
                title="Data Purge"
                description="Queue deletion review for generated assets and account records."
                label="Contact support"
                danger
              />
            </div>
          </SettingsCard>
        </section>
      </div>
    </main>
  );
}

function SettingsCard({
  kicker,
  title,
  description,
  children,
  accent = false,
  className = "",
}: {
  kicker: string;
  title: string;
  description: string;
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <article
      className={`rounded-3xl border p-5 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6 ${
        accent
          ? "border-electric/20 bg-white/[0.055]"
          : "border-white/[0.08] bg-white/[0.04]"
      } ${className}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
        {kicker}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-zinc-200">{value}</dd>
    </div>
  );
}

function ControlAction({
  title,
  description,
  label,
  danger = false,
}: {
  title: string;
  description: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-black/25 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">{description}</p>
      <button
        type="button"
        disabled
        className={`mt-5 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wide ${
          danger
            ? "border-red-500/25 bg-red-500/10 text-red-200/70"
            : "border-white/[0.1] bg-white/[0.05] text-zinc-400"
        } cursor-not-allowed opacity-70`}
      >
        {label}
      </button>
    </div>
  );
}

function TierBadge({ tier, paid }: { tier: string; paid: boolean }) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${
        paid
          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_-8px_rgba(34,211,238,0.45)]"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {paid ? tier : "Trial Access"}
    </span>
  );
}

function normalizeSubscription(value: unknown): SubscriptionSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const plan = row.plan;
  const status = row.status;
  if (
    plan !== "free" &&
    plan !== "trial" &&
    plan !== "growth_pro" &&
    plan !== "agency"
  ) {
    return null;
  }
  return {
    plan,
    status: typeof status === "string" ? status : "inactive",
    current_period_end:
      typeof row.current_period_end === "string" ? row.current_period_end : null,
    stripe_customer_id:
      typeof row.stripe_customer_id === "string" ? row.stripe_customer_id : null,
  };
}

function resolveTierLabel(
  subscription: SubscriptionSnapshot | null,
  hasPaidPlan: boolean,
): string {
  if (hasPaidPlan && subscription?.plan === "growth_pro") {
    return SUBSCRIPTION_PLANS.growth_pro.name;
  }
  if (hasPaidPlan && subscription?.plan === "agency") {
    return SUBSCRIPTION_PLANS.agency.name;
  }
  return "Free Trial";
}

function humanizeStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortenId(value: string): string {
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}
