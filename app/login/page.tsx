import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to GrowUrb AI Brand Kit Studio",
};

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-zinc-500">
      <span className="text-sm">Loading…</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
