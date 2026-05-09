"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

export function SettingsView({ teamId }: { teamId: Id<"teams"> }) {
  const workspace = useQuery(api.teams.getWorkspaceByTeamId, { teamId });
  const profile = useQuery(api.profiles.getMyProfile);
  const setExperimentalFeaturesEnabled = useMutation(api.profiles.setExperimentalFeaturesEnabled);
  const [isSavingExperimentalFeatures, setIsSavingExperimentalFeatures] = useState(false);
  const currentMembership = workspace?.members.find((member) => member.userId === workspace.user.userId);
  const experimentalFeaturesEnabled = profile?.experimentalFeaturesEnabled ?? false;

  async function toggleExperimentalFeatures() {
    if (profile === undefined || isSavingExperimentalFeatures) return;
    setIsSavingExperimentalFeatures(true);
    try {
      await setExperimentalFeaturesEnabled({ enabled: !experimentalFeaturesEnabled });
    } finally {
      setIsSavingExperimentalFeatures(false);
    }
  }

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
    <AppShell title="Settings" workspace={{ id: workspace.team._id, name: workspace.team.name, canRename: currentMembership?.role === "owner" || currentMembership?.role === "admin" }}>
      <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
        <label className="block text-sm font-semibold">
          Team name
          <input className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" defaultValue={workspace.team.name} />
        </label>
        <div className="mt-5 flex justify-end">
          <Button>Save changes</Button>
        </div>
      </div>

      <div className="mt-4 max-w-2xl rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Enable experimental features</h2>
            <p className="mt-1 text-sm text-muted-foreground">Get early access to in-progress improvements and help us test faster.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={experimentalFeaturesEnabled}
            aria-label="Enable experimental features"
            disabled={profile === undefined || isSavingExperimentalFeatures}
            onClick={toggleExperimentalFeatures}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full border border-transparent transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
              experimentalFeaturesEnabled ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-surface shadow-sm transition-transform",
                experimentalFeaturesEnabled && "translate-x-5",
              )}
            />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
