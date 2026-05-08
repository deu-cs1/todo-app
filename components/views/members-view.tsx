"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell/app-shell";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { MemberList } from "@/components/members/member-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function MembersView({ teamId }: { teamId: Id<"teams"> }) {
  const workspace = useQuery(api.teams.getMyWorkspace);
  const canViewTeam = workspace?.team?._id === teamId;
  const members = useQuery(api.teams.listTeamMembers, canViewTeam ? { teamId } : "skip");

  if (workspace === undefined) {
    return (
      <AppShell title="Members" eyebrow="Team">
        <LoadingState />
      </AppShell>
    );
  }

  if (workspace === null || !canViewTeam) {
    return (
      <AppShell title="Members" eyebrow="Team">
        <EmptyState title="No accessible team" description="Create or select a team before managing members." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Members" eyebrow={workspace.team.name} action={<InviteMemberDialog teamId={teamId} />}>
      {members === undefined ? <LoadingState /> : <MemberList members={members} />}
    </AppShell>
  );
}
