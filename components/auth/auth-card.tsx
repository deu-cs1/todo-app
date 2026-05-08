import Link from "next/link";
import { CircleDot } from "lucide-react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <Link href="/" className="mx-auto flex w-max items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-white">
            <CircleDot className="h-5 w-5" aria-hidden="true" />
          </span>
          Orbitask
        </Link>
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <form className="mt-8 flex flex-col gap-3">{children}</form>
      </section>
    </main>
  );
}
