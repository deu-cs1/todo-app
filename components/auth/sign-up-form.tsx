"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { AuthCard } from "@/components/auth/auth-card";
import { rememberAccount } from "@/components/auth/auth-redirect";
import { Button } from "@/components/ui/button";

type PendingWorkspace = {
  name: string;
  email: string;
};

export function SignUpForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const ensurePersonalWorkspace = useMutation(api.teams.ensurePersonalWorkspace);
  const [pendingWorkspace, setPendingWorkspace] = useState<PendingWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !pendingWorkspace) return;
    let cancelled = false;
    const workspace = pendingWorkspace;

    async function finishSignup() {
      try {
        await ensurePersonalWorkspace(workspace);
        if (!cancelled) {
          rememberAccount();
          router.replace("/app/my-tasks");
        }
      } catch (workspaceError) {
        if (!cancelled) {
          setError(workspaceError instanceof Error ? workspaceError.message : "Could not create your personal workspace.");
          setIsSubmitting(false);
        }
      }
    }

    void finishSignup();

    return () => {
      cancelled = true;
    };
  }, [ensurePersonalWorkspace, isAuthenticated, pendingWorkspace, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    try {
      formData.set("flow", "signUp");
      await signIn("password", formData);
      rememberAccount();
      setPendingWorkspace({ name, email });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not create account.");
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard title="Create account" subtitle="Start with your personal workspace. Teams can be added later." onSubmit={onSubmit}>
      <input name="name" className="h-11 rounded-lg border border-border bg-background px-3" type="text" placeholder="Name" autoComplete="name" required minLength={2} />
      <input name="email" className="h-11 rounded-lg border border-border bg-background px-3" type="email" placeholder="Email" autoComplete="email" required />
      <input name="password" className="h-11 rounded-lg border border-border bg-background px-3" type="password" placeholder="Password" autoComplete="new-password" required minLength={8} />
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-semibold text-foreground" href="/sign-in">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
