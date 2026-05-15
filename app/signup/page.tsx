import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your GrowUrb AI account",
};

export default function SignupPage() {
  return <SignupForm />;
}
