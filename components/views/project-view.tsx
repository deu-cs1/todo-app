"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export function ProjectView({ teamId, projectId }: { teamId: Id<"teams">; projectId: Id<"projects"> }) {
  const workspace = useQuery(api.teams.getWorkspaceByTeamId, { teamId });
  const project = workspace?.projects.find((item) => item._id === projectId);
  const tasks = useQuery(api.tasks.listProjectTasksDetailed, project ? { projectId } : "skip");
  const currentMembership = workspace?.members.find((member) => member.userId === workspace.user.userId);

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
    <AppShell title={project.name} workspace={{ id: workspace.team._id, name: workspace.team.name, canRename: currentMembership?.role === "owner" || currentMembership?.role === "admin" }}>
      <div className="space-y-6">
        <TaskCreateInput teamId={workspace?.team?._id} projectId={projectId} assignees={workspace?.members} />
        {tasks === undefined ? <LoadingState /> : <TaskList tasks={tasks} currentUserId={workspace.user.userId} currentUserRole={currentMembership?.role} />}
      </div>
    </AppShell>
  );
}
