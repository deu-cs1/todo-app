"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { AuthCard } from "@/components/auth/auth-card";
import { rememberAccount } from "@/components/auth/auth-redirect";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const ensurePersonalWorkspace = useMutation(api.teams.ensurePersonalWorkspace);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function finishSignIn() {
      try {
        await ensurePersonalWorkspace({});
        if (!cancelled) {
          rememberAccount();
          router.replace("/app/my-tasks");
        }
      } catch (workspaceError) {
        if (!cancelled) {
          setError(workspaceError instanceof Error ? workspaceError.message : "Could not prepare your personal workspace.");
          setIsSubmitting(false);
        }
      }
    }

    void finishSignIn();

    return () => {
      cancelled = true;
    };
  }, [ensurePersonalWorkspace, isAuthenticated, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("flow", "signIn");
      await signIn("password", formData);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not sign in.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="Continue to your personal workspace." onSubmit={onSubmit}>
      <input name="email" className="h-11 rounded-lg border border-border bg-background px-3" type="email" placeholder="Email" autoComplete="email" required />
      <input name="password" className="h-11 rounded-lg border border-border bg-background px-3" type="password" placeholder="Password" autoComplete="current-password" required />
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link className="font-semibold text-foreground" href="/sign-up">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
