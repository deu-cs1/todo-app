import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";

export default function SignUpPage() {
  return (
    <AuthCard title="Create account" subtitle="Start a workspace and invite your team.">
      <input className="h-11 rounded-lg border border-border bg-background px-3" type="text" placeholder="Name" />
      <input className="h-11 rounded-lg border border-border bg-background px-3" type="email" placeholder="Email" />
      <input className="h-11 rounded-lg border border-border bg-background px-3" type="password" placeholder="Password" />
      <Link href="/app/my-tasks" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white">
        Create workspace
      </Link>
    </AuthCard>
  );
}
