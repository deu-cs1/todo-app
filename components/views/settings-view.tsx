"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell/app-shell";
import { MemberAvatar } from "@/components/tasks/member-avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

export function SettingsView({ teamId }: { teamId: Id<"teams"> }) {
  const workspace = useQuery(api.teams.getWorkspaceByTeamId, { teamId });
  const profile = useQuery(api.profiles.getMyProfile);
  const upsertProfile = useMutation(api.profiles.upsertProfile);
  const renameWorkspace = useMutation(api.teams.renameWorkspace);
  const setExperimentalFeaturesEnabled = useMutation(api.profiles.setExperimentalFeaturesEnabled);
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountAvatarUrl, setAccountAvatarUrl] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [isSavingExperimentalFeatures, setIsSavingExperimentalFeatures] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const currentMembership = workspace?.members.find((member) => member.userId === workspace.user.userId);
  const experimentalFeaturesEnabled = profile?.experimentalFeaturesEnabled ?? false;
  const canManageWorkspace = currentMembership?.role === "owner" || currentMembership?.role === "admin";

  useEffect(() => {
    if (workspace === undefined || profile === undefined) return;
    setAccountName(profile?.name ?? workspace?.user.name ?? "");
    setAccountEmail(profile?.email ?? workspace?.user.email ?? "");
    setAccountAvatarUrl(profile?.avatarUrl ?? "");
  }, [profile, workspace]);

  useEffect(() => {
    if (!workspace) return;
    setWorkspaceName(workspace.team.name);
  }, [workspace]);

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSavingAccount || workspace === undefined) return;

    setIsSavingAccount(true);
    setAccountError(null);
    setAccountMessage(null);
    try {
      await upsertProfile({
        name: accountName,
        email: accountEmail,
        avatarUrl: accountAvatarUrl.trim() || undefined,
      });
      setAccountMessage("Account settings saved.");
    } catch (saveError) {
      setAccountError(saveError instanceof Error ? saveError.message : "Could not save account settings.");
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function saveWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace || isSavingWorkspace || !canManageWorkspace) return;

    setIsSavingWorkspace(true);
    setWorkspaceError(null);
    setWorkspaceMessage(null);
    try {
      await renameWorkspace({ teamId: workspace.team._id, name: workspaceName });
      setWorkspaceMessage("Workspace settings saved.");
    } catch (saveError) {
      setWorkspaceError(saveError instanceof Error ? saveError.message : "Could not save workspace settings.");
    } finally {
      setIsSavingWorkspace(false);
    }
  }

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

  const isAccountLoading = workspace === undefined || profile === undefined;

  return (
    <AppShell title="Settings" workspace={{ id: workspace.team._id, name: workspace.team.name, canRename: canManageWorkspace }}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <form onSubmit={saveAccount} className="rounded-xl border border-border bg-surface p-6 shadow-line">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold">Account settings</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update the profile information used across tasks, members, and invites.</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 sm:col-span-2">
                <MemberAvatar
                  userId={workspace.user.userId}
                  profile={{ name: accountName, email: accountEmail, avatarUrl: accountAvatarUrl }}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{accountName || "Display name"}</p>
                  <p className="truncate text-sm text-muted-foreground">{accountEmail || "Email"}</p>
                </div>
              </div>

              <label className="block text-sm font-semibold">
                Display name
                <input
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  type="text"
                  minLength={2}
                  maxLength={80}
                  disabled={isAccountLoading || isSavingAccount}
                />
              </label>
              <label className="block text-sm font-semibold">
                Email
                <input
                  value={accountEmail}
                  onChange={(event) => setAccountEmail(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  type="email"
                  minLength={3}
                  maxLength={160}
                  disabled={isAccountLoading || isSavingAccount}
                />
              </label>
              <label className="block text-sm font-semibold sm:col-span-2">
                Avatar URL
                <input
                  value={accountAvatarUrl}
                  onChange={(event) => setAccountAvatarUrl(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  disabled={isAccountLoading || isSavingAccount}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5 text-sm font-medium">
                {accountError && <span className="text-red-600">{accountError}</span>}
                {accountMessage && <span className="text-emerald-700">{accountMessage}</span>}
              </div>
              <Button type="submit" disabled={isAccountLoading || isSavingAccount || !accountName.trim() || !accountEmail.trim()}>
                {isSavingAccount ? "Saving" : "Save account"}
              </Button>
            </div>
          </form>

          <form onSubmit={saveWorkspace} className="rounded-xl border border-border bg-surface p-6 shadow-line">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold">Workspace settings</h2>
              <p className="mt-1 text-sm text-muted-foreground">Rename the active workspace and review its current access level.</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold sm:col-span-2">
                Workspace name
                <input
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  type="text"
                  minLength={2}
                  maxLength={60}
                  disabled={!canManageWorkspace || isSavingWorkspace}
                />
              </label>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Role</p>
                <p className="mt-1 text-sm font-semibold capitalize">{currentMembership?.role ?? "Member"}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Members</p>
                <p className="mt-1 text-sm font-semibold">{workspace.members.length}</p>
              </div>
            </div>

            {!canManageWorkspace && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">Only workspace owners and admins can rename this workspace.</p>}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5 text-sm font-medium">
                {workspaceError && <span className="text-red-600">{workspaceError}</span>}
                {workspaceMessage && <span className="text-emerald-700">{workspaceMessage}</span>}
              </div>
              <Button type="submit" disabled={!canManageWorkspace || isSavingWorkspace || !workspaceName.trim()}>
                {isSavingWorkspace ? "Saving" : "Save workspace"}
              </Button>
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-surface p-6 shadow-line">
          <h2 className="text-lg font-bold">Preferences</h2>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">Experimental features</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get early access to in-progress improvements and help test faster.</p>
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
        </aside>
      </div>
    </AppShell>
  );
}
