"use client";

import {
  Check,
  Crown,
  ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  UserCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AccountPageShell } from "@/components/account/AccountPageShell";
import { UserAvatarButton } from "@/components/UserAvatarButton";
import { getBrandAssetsBucket, BRAND_LOGO_PATH } from "@/lib/brand-storage";
import {
  getUserDisplayName,
} from "@/lib/auth-user-display";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const ACCEPT_IMAGE = "image/png,image/jpeg,image/webp,image/svg+xml";

export function SettingsPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const syncUser = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setUser(null);
    } else {
      setUser(data.user);
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    void syncUser();
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncUser();
    });
    return () => subscription.unsubscribe();
  }, [syncUser]);

  const meta = user?.user_metadata ?? {};
  const brandLogoUrl =
    typeof meta.brand_logo_url === "string" ? meta.brand_logo_url : null;

  const onLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      setSaveErr("Please choose an image file (PNG, JPG, WebP, or SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveErr("File too large. Max size is 5 MB.");
      return;
    }

    setSaveErr(null);
    setSaveMsg(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const bucket = getBrandAssetsBucket();
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const safeExt = ["png", "jpg", "jpeg", "webp", "svg"].includes(ext)
        ? ext
        : "png";
      const path = `${user.id}/${BRAND_LOGO_PATH}.${safeExt}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/png",
      });

      if (upErr) {
        setSaveErr(
          upErr.message.includes("Bucket not found")
            ? `Create a public storage bucket named "${bucket}" in Supabase (Storage → New bucket), then add upload policies for authenticated users.`
            : upErr.message,
        );
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      const { error: metaErr } = await supabase.auth.updateUser({
        data: { brand_logo_url: publicUrl },
      });

      if (metaErr) {
        setSaveErr(metaErr.message);
        return;
      }

      setSaveMsg("Brand logo saved.");
      await syncUser();
    } catch {
      setSaveErr("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!loadingUser && !user) {
    return (
      <AccountPageShell title="Settings" subtitle="Sign in to manage your account.">
        <Link
          href="/login?next=%2Fsettings"
          className="inline-flex rounded-xl bg-gradient-to-r from-electric to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-glow"
        >
          Sign in
        </Link>
      </AccountPageShell>
    );
  }

  if (loadingUser || !user) {
    return (
      <AccountPageShell title="Settings" subtitle="Manage your profile and brand assets.">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-electric" aria-label="Loading" />
        </div>
      </AccountPageShell>
    );
  }

  const displayName = getUserDisplayName(user);
  const email = user.email ?? "—";

  return (
    <AccountPageShell
      title="Settings"
      subtitle="Manage your profile, brand assets, and subscription snapshot."
    >
      {saveErr ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
        >
          {saveErr}
        </div>
      ) : null}
      {saveMsg ? (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <Check className="h-4 w-4 shrink-0" />
          {saveMsg}
        </div>
      ) : null}

      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Profile */}
        <section className="rounded-[1.35rem] border border-white/[0.1] bg-white/[0.04] p-6 shadow-glass backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-2 text-zinc-400">
            <UserCircle className="h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">Profile</h2>
          </div>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <UserAvatarButton user={user} size="lg" className="ring-2 ring-white/10" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-lg font-semibold text-white">{displayName}</p>
              <p className="truncate text-sm text-zinc-400">{email}</p>
              <p className="mt-3 text-xs text-zinc-600">
                Signed in with Supabase. Name and email come from your account provider.
              </p>
            </div>
          </div>
        </section>

        {/* Brand assets */}
        <section className="rounded-[1.35rem] border border-white/[0.1] bg-white/[0.04] p-6 shadow-glass backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-2 text-zinc-400">
            <ImageIcon className="h-4 w-4 shrink-0 text-electric" strokeWidth={2} />
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">Brand assets</h2>
          </div>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
            Upload your logo for future brand kit features. Stored in your Supabase Storage bucket (
            <span className="font-mono text-zinc-400">{getBrandAssetsBucket()}</span>
            ).
          </p>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex h-28 w-full max-w-[200px] items-center justify-center rounded-2xl border border-dashed border-white/[0.14] bg-black/30 sm:h-32 sm:w-48">
              {brandLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brandLogoUrl}
                  alt="Your brand logo"
                  className="max-h-24 max-w-[90%] object-contain p-2"
                />
              ) : (
                <span className="px-4 text-center text-xs text-zinc-600">No logo yet</span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <label className="relative inline-flex w-full cursor-pointer sm:w-fit">
                <input
                  type="file"
                  accept={ACCEPT_IMAGE}
                  className="sr-only"
                  onChange={onLogoSelected}
                  disabled={uploading}
                />
                <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.06] px-5 py-3 text-sm font-medium text-white transition hover:border-electric/45 hover:bg-white/[0.1] disabled:opacity-50">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 text-electric" strokeWidth={2} />
                  )}
                  {uploading ? "Saving…" : "Upload logo"}
                </span>
              </label>
              <p className="text-xs text-zinc-600">
                PNG, JPG, WebP, or SVG · max 5 MB. Overwrites your previous logo path in storage.
              </p>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="rounded-[1.35rem] border border-white/[0.1] bg-gradient-to-br from-electric/[0.12] via-white/[0.04] to-transparent p-6 shadow-glass backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Crown className="h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Subscription
                </h2>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
                Growth Pro
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Premium generation, omni-channel copy, and priority studio queue for your SKUs.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-3 rounded-2xl border border-white/[0.1] bg-black/40 px-5 py-4 sm:min-w-[180px]">
              <div className="flex items-center gap-2 text-zinc-500">
                <Zap className="h-4 w-4 text-electric" strokeWidth={2} />
                <span className="text-xs font-medium uppercase tracking-wide">Credits</span>
              </div>
              <p className="text-3xl font-semibold tabular-nums text-white">47</p>
              <p className="text-[11px] text-zinc-600">Credits left this cycle</p>
            </div>
          </div>
        </section>
      </div>
    </AccountPageShell>
  );
}
