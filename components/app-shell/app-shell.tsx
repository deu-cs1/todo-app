"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/app-shell/sidebar";

export function AppShell({
  active,
  title,
  eyebrow,
  action,
  children,
}: {
  active?: string;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar active={active} />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-border bg-background/92 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0">
              {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>}
              <h1 className="truncate text-2xl font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="icon" aria-label="Search">
                <Search className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </Button>
              {action}
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
