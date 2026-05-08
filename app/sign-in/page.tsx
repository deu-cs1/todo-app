import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

export default function SignInPage() {
  return (
    <AuthCard title="Sign in" subtitle="Continue to your team workspace.">
      <input className="h-11 rounded-lg border border-border bg-background px-3" type="email" placeholder="Email" />
      <input className="h-11 rounded-lg border border-border bg-background px-3" type="password" placeholder="Password" />
      <Link href="/app/my-tasks" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white">
        Sign in
      </Link>
      <p className="text-center text-sm text-muted-foreground">
        No account? <Link className="font-semibold text-foreground" href="/sign-up">Create one</Link>
      </p>
    </AuthCard>
  );
}
