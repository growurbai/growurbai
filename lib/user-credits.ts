import { GenerateApiError } from "@/lib/generate-api-errors";
import {
  fetchSubscriptionSnapshot,
  isPaidSubscription,
} from "@/lib/subscription-queries";
import { agencySkipsPerGenerationCreditDeduction } from "@/lib/subscription-tier";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  CREDITS_PER_BRAND_KIT,
  DEFAULT_GENERATION_CREDITS,
} from "@/lib/user-credits-constants";

export { CREDITS_PER_BRAND_KIT, DEFAULT_GENERATION_CREDITS } from "@/lib/user-credits-constants";

const DEV_MOCK_USER_ID = "local-dev-credits-user";

/** In-process mock ledger when Supabase admin is unavailable (local dev). */
const mockCreditLedger = new Map<string, number>();

export type GenerationEntitlement = {
  balance: number;
  /** Agency paid: no per-run credit decrement (priority / unlimited lane). */
  skipPerGenerationCreditDeduction: boolean;
  /** UI: show “Unlimited” style meter for Agency. */
  creditsDisplayUnlimited: boolean;
};

export type GenerationActor = {
  userId: string;
  useMockLedger: boolean;
  /** Supabase auth.users.created_at — used for 7-day trial enforcement. */
  accountCreatedAt: string;
};

export async function resolveGenerationActor(): Promise<GenerationActor> {
  const supabase = createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      throw new GenerateApiError(
        "GENERATION_FAILED",
        "Sign in required to generate a Brand Kit.",
        401,
      );
    }
    return {
      userId: user.id,
      useMockLedger: false,
      accountCreatedAt: user.created_at ?? new Date().toISOString(),
    };
  }

  if (process.env.ALLOW_ANONYMOUS_GENERATE === "true") {
    return {
      userId: DEV_MOCK_USER_ID,
      useMockLedger: true,
      accountCreatedAt: new Date().toISOString(),
    };
  }

  throw new GenerateApiError(
    "CONFIG_ERROR",
    "Authentication is not configured. Sign in or enable local dev mode.",
    503,
  );
}

function readMockBalance(userId: string): number {
  if (!mockCreditLedger.has(userId)) {
    mockCreditLedger.set(userId, DEFAULT_GENERATION_CREDITS);
  }
  return mockCreditLedger.get(userId)!;
}

function writeMockBalance(userId: string, balance: number): number {
  const next = Math.max(0, balance);
  mockCreditLedger.set(userId, next);
  return next;
}

async function fetchDbBalance(userId: string): Promise<number | null> {
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("user_credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("user_credits read failed, using mock ledger", error.message);
      return null;
    }

    if (data == null) return null;
    return typeof data.balance === "number" ? data.balance : DEFAULT_GENERATION_CREDITS;
  } catch (err) {
    console.warn("user_credits admin unavailable, using mock ledger", err);
    return null;
  }
}

async function ensureDbBalance(userId: string): Promise<number> {
  const existing = await fetchDbBalance(userId);
  if (existing !== null) return existing;

  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("user_credits")
      .upsert(
        {
          user_id: userId,
          balance: DEFAULT_GENERATION_CREDITS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("balance")
      .single();

    if (error) {
      console.warn("user_credits seed failed", error.message);
      return readMockBalance(userId);
    }

    return typeof data?.balance === "number" ? data.balance : DEFAULT_GENERATION_CREDITS;
  } catch {
    return readMockBalance(userId);
  }
}

export async function getUserCreditBalance(actor: GenerationActor): Promise<number> {
  if (actor.useMockLedger) {
    return readMockBalance(actor.userId);
  }

  const dbBalance = await fetchDbBalance(actor.userId);
  if (dbBalance !== null) return dbBalance;
  return ensureDbBalance(actor.userId);
}

export async function resolveGenerationEntitlement(
  actor: GenerationActor,
): Promise<GenerationEntitlement> {
  if (actor.useMockLedger) {
    const balance = readMockBalance(actor.userId);
    return {
      balance,
      skipPerGenerationCreditDeduction: false,
      creditsDisplayUnlimited: false,
    };
  }

  const snapshot = await fetchSubscriptionSnapshot(actor.userId);
  const paid = isPaidSubscription(snapshot);
  const plan = snapshot?.plan ?? "";
  const status = snapshot?.status ?? "";
  const balance = await getUserCreditBalance(actor);
  const skip =
    paid && agencySkipsPerGenerationCreditDeduction(plan, status);

  return {
    balance,
    skipPerGenerationCreditDeduction: skip,
    creditsDisplayUnlimited: skip,
  };
}

export function assertEntitlementHasCredits(entitlement: GenerationEntitlement): void {
  if (entitlement.skipPerGenerationCreditDeduction) return;
  assertHasGenerationCredits(entitlement.balance);
}

export async function applyPostSuccessCredits(
  actor: GenerationActor,
  entitlement: GenerationEntitlement,
): Promise<number> {
  if (entitlement.skipPerGenerationCreditDeduction) {
    return entitlement.balance;
  }
  return deductGenerationCredit(actor);
}

export function assertHasGenerationCredits(balance: number): void {
  if (balance > 0) return;
  throw new GenerateApiError(
    "INSUFFICIENT_CREDITS",
    "You have run out of generation credits. Please upgrade your plan.",
    403,
  );
}

async function deductDbCredit(userId: string): Promise<number | null> {
  try {
    const admin = createAdminSupabaseClient();
    const current = await ensureDbBalance(userId);
    const next = Math.max(0, current - CREDITS_PER_BRAND_KIT);

    const { data, error } = await admin
      .from("user_credits")
      .update({
        balance: next,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("balance")
      .single();

    if (error) {
      console.warn("user_credits deduct failed", error.message);
      return null;
    }

    return typeof data?.balance === "number" ? data.balance : next;
  } catch (err) {
    console.warn("user_credits deduct unavailable", err);
    return null;
  }
}

/** Deduct one Brand Kit credit after a successful generation. Returns remaining balance. */
export async function deductGenerationCredit(actor: GenerationActor): Promise<number> {
  if (actor.useMockLedger) {
    const current = readMockBalance(actor.userId);
    return writeMockBalance(actor.userId, current - CREDITS_PER_BRAND_KIT);
  }

  const dbNext = await deductDbCredit(actor.userId);
  if (dbNext !== null) return dbNext;

  const current = readMockBalance(actor.userId);
  return writeMockBalance(actor.userId, current - CREDITS_PER_BRAND_KIT);
}
