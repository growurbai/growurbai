"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GrowUrbAuthLogo } from "@/components/auth/GrowUrbAuthLogo";
import { createClient } from "@/lib/supabase";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=%2F`,
          data: {
            full_name: fullName.trim(),
          },
        },
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }
      setInfo(
        "Check your email for a confirmation link to finish creating your account.",
      );
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=%2F`,
        },
      });
      if (oAuthError) setError(oAuthError.message);
    } catch {
      setError("Could not start Google sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-16 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(50vh,480px)] bg-gradient-to-b from-electric/[0.14] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[20%] top-[20%] h-[min(360px,50vw)] w-[min(360px,50vw)] rounded-full bg-electric/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[15%] bottom-[10%] h-[min(280px,45vw)] w-[min(280px,45vw)] rounded-full bg-violet-600/15 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <GrowUrbAuthLogo className="mb-10" />

        <div className="rounded-[1.35rem] border border-white/[0.1] bg-white/[0.04] p-8 shadow-glass backdrop-blur-xl sm:p-10">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-white">
            Create Account
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-500">
            Start turning catalog shots into premium ads
          </p>

          {error ? (
            <p
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-100">
              {info}
            </p>
          ) : null}

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label htmlFor="signup-name" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none ring-electric/40 transition placeholder:text-zinc-600 focus:border-electric/50 focus:ring-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none ring-electric/40 transition placeholder:text-zinc-600 focus:border-electric/50 focus:ring-2"
                placeholder="you@brand.com"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 py-3 text-sm text-white outline-none ring-electric/40 transition placeholder:text-zinc-600 focus:border-electric/50 focus:ring-2"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-[0.97] disabled:opacity-60"
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-electric via-violet-500 to-electric bg-[length:200%_100%] animate-shimmer"
              />
              <span className="relative">{loading ? "Creating…" : "Create Account"}</span>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider text-zinc-500">
              <span className="bg-[#0a0a0a]/80 px-3">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.06] py-3.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.1] disabled:opacity-60"
          >
            <GoogleIcon className="h-5 w-5 text-white" />
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-electric hover:text-gold hover:underline">
              Login
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
