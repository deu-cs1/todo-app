"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus, UsersRound } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function TeamsView() {
  const teams = useQuery(api.teams.listMyTeams);
  const invites = useQuery(api.invites.listMyPendingInvites);
  const createTeam = useMutation(api.teams.createTeam);
  const acceptInvite = useMutation(api.invites.acceptInvite);
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [acceptingInviteId, setAcceptingInviteId] = useState<Id<"teamInvites"> | null>(null);
  const isLoading = teams === undefined || invites === undefined;

  async function onCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamName.trim()) return;
    setIsCreating(true);
    try {
      await createTeam({ name: teamName.trim() });
      setTeamName("");
    } finally {
      setIsCreating(false);
    }
  }

  async function onAcceptInvite(inviteId: Id<"teamInvites">) {
    setAcceptingInviteId(inviteId);
    try {
      await acceptInvite({ inviteId });
    } finally {
      setAcceptingInviteId(null);
    }
  }

  return (
    <AppShell active="Teams" title="Teams" eyebrow="Shared workspaces">
      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
            {teams.length === 0 ? (
              <EmptyState title="No teams yet" description="Your personal workspace is ready. Create a team when you need shared projects and members." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {teams.map((team) => (
                  <Link key={team!._id} href={`/app/team/${team!._id}`} className="rounded-xl border border-border bg-surface p-5 shadow-line transition hover:-translate-y-0.5 hover:shadow-soft">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
                      <UsersRound className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h2 className="mt-5 text-xl font-bold">{team!.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Open shared projects, members, and settings.</p>
                  </Link>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-lg font-bold">Pending invites</h2>
              <div className="mt-4 space-y-3">
                {invites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending team invitations for this email.</p>
                ) : (
                  invites.map((invite) => (
                    <div key={invite._id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{invite.team?.name ?? "Team invite"}</p>
                        <p className="text-sm text-muted-foreground">
                          {invite.invitedBy?.name ?? "A team admin"} invited you to join as {invite.role}.
                        </p>
                      </div>
                      <Button type="button" onClick={() => onAcceptInvite(invite._id)} disabled={acceptingInviteId === invite._id}>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {acceptingInviteId === invite._id ? "Accepting" : "Accept"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <form onSubmit={onCreateTeam} className="h-fit rounded-xl border border-border bg-surface p-5 shadow-line">
            <h2 className="text-lg font-bold">Create a team</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use teams for shared projects, member invites, and collaborative task ownership.</p>
            <label className="mt-5 block text-sm font-semibold">
              Team name
              <input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3"
                type="text"
                placeholder="Launch Team"
                minLength={2}
              />
            </label>
            <Button type="submit" className="mt-4 w-full" disabled={!teamName.trim() || isCreating}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isCreating ? "Creating" : "Create team"}
            </Button>
          </form>
        </div>
      )}
    </AppShell>
  );
}

export function TeamView({ teamId }: { teamId: Id<"teams"> }) {
  const workspace = useQuery(api.teams.getWorkspaceByTeamId, { teamId });

  return (
    <AppShell title={workspace?.team?.name ?? "Team"} eyebrow="Team dashboard">
      {workspace === undefined ? (
        <LoadingState />
      ) : workspace === null ? (
        <EmptyState title="No accessible team" description="Create or accept a team invite before opening this workspace." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {workspace.projects.map((project) => (
              <Link key={project._id} href={`/app/team/${workspace.team._id}/project/${project._id}`} className="rounded-xl border border-border bg-surface p-5 shadow-line transition hover:-translate-y-0.5 hover:shadow-soft">
                <span className="block h-2 w-14 rounded-full" style={{ backgroundColor: project.color ?? "#dc2626" }} />
                <h2 className="mt-5 text-xl font-bold">{project.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{project.description ?? "Team project"}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button>New project</Button>
            <Button asChild variant="secondary">
              <Link href={`/app/team/${workspace.team._id}/members`}>Members</Link>
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
