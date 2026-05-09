"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell/app-shell";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function UpcomingView() {
  const workspace = useQuery(api.teams.getMyWorkspace);
  const tasks = useQuery(api.tasks.listUpcomingTasks, workspace ? {} : "skip");
  const currentMembership = workspace?.members.find((member) => member.userId === workspace.user.userId);

  if (workspace === undefined) {
    return (
      <AppShell active="Upcoming" title="Upcoming" eyebrow="Next commitments">
        <LoadingState />
      </AppShell>
    );
  }

  if (workspace === null) {
    return (
      <AppShell active="Upcoming" title="Upcoming" eyebrow="Next commitments">
        <EmptyState title="Workspace is not ready" description="Sign out and sign back in to prepare your personal workspace." />
      </AppShell>
    );
  }

  return (
    <AppShell active="Upcoming" title="Upcoming" eyebrow="Next commitments">
      {tasks === undefined ? <LoadingState /> : <TaskList tasks={tasks} currentUserId={workspace.user.userId} currentUserRole={currentMembership?.role} />}
    </AppShell>
  );
}
