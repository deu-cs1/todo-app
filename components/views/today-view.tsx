"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function TodayView() {
  const workspace = useQuery(api.teams.getMyWorkspace);
  const tasks = useQuery(api.tasks.listTodayTasks, workspace ? {} : "skip");
  const defaultProject = workspace?.projects[0];

  if (workspace === undefined) {
    return (
      <AppShell active="Today" title="Today" eyebrow="Personal focus">
        <LoadingState />
      </AppShell>
    );
  }

  if (workspace === null) {
    return (
      <AppShell active="Today" title="Today" eyebrow="Personal focus">
        <EmptyState title="Workspace is not ready" description="Sign out and sign back in to prepare your personal workspace." />
      </AppShell>
    );
  }

  return (
    <AppShell active="Today" title="Today" eyebrow="Personal focus">
      <div className="space-y-6">
        <TaskCreateInput teamId={workspace.team._id} projectId={defaultProject?._id} assigneeIds={[workspace.user.userId]} />
        {tasks === undefined ? <LoadingState /> : <TaskList tasks={tasks} currentUserId={workspace.user.userId} />}
      </div>
    </AppShell>
  );
}
