import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold">You have been invited</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Token preview: <span className="font-mono">{token.slice(0, 10)}</span>. Sign in to accept the invite and join the team.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/sign-in">Sign in to accept</Link>
        </Button>
      </section>
    </main>
  );
}
