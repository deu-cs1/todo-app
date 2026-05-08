"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function SettingsView({ teamId }: { teamId: Id<"teams"> }) {
  const workspace = useQuery(api.teams.getWorkspaceByTeamId, { teamId });

  if (workspace === undefined) {
    return (
      <AppShell title="Settings" eyebrow="Team">
        <LoadingState />
      </AppShell>
    );
  }

  if (workspace === null) {
    return (
      <AppShell title="Settings" eyebrow="Team">
        <EmptyState title="No accessible team" description="Create or select a team before changing settings." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" eyebrow={workspace.team.name}>
      <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
        <label className="block text-sm font-semibold">
          Team name
          <input className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" defaultValue={workspace.team.name} />
        </label>
        <div className="mt-5 flex justify-end">
          <Button>Save changes</Button>
        </div>
      </div>
    </AppShell>
  );
}
