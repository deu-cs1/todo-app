"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function ProjectView({ projectId }: { projectId: Id<"projects"> }) {
  const workspace = useQuery(api.teams.getMyWorkspace);
  const project = workspace?.projects.find((item) => item._id === projectId);
  const tasks = useQuery(api.tasks.listProjectTasksDetailed, project ? { projectId } : "skip");

  if (workspace === undefined) {
    return (
      <AppShell title="Project" eyebrow="Team project">
        <LoadingState />
      </AppShell>
    );
  }

  if (workspace === null || !project) {
    return (
      <AppShell title="Project" eyebrow="Team project">
        <EmptyState title="Project not available" description="This project no longer exists or your current user cannot access it." />
      </AppShell>
    );
  }

  return (
    <AppShell title={project.name} eyebrow={workspace.team.name}>
      <div className="space-y-6">
        <TaskCreateInput teamId={workspace?.team?._id} projectId={projectId} assigneeIds={workspace?.members.map((member) => member.userId)} />
        {tasks === undefined ? <LoadingState /> : <TaskList tasks={tasks} />}
      </div>
    </AppShell>
  );
}
