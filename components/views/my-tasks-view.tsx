"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell/app-shell";
import { TaskCreateInput } from "@/components/tasks/task-create-input";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";
import { TaskList } from "@/components/tasks/task-list";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";

export function MyTasksView() {
  const workspace = useQuery(api.teams.getMyWorkspace);
  const tasks = useQuery(api.tasks.listMyTasksDetailed, workspace?.team ? { teamId: workspace.team._id } : "skip");
  const defaultProject = workspace?.projects[0];
  const assigneeIds = workspace?.members.map((member) => member.userId);

  if (workspace === undefined) {
    return (
      <AppShell active="My Tasks" title="My Tasks" eyebrow="Workspace" action={<Button className="hidden sm:inline-flex">New task</Button>}>
        <LoadingState />
      </AppShell>
    );
  }

  if (workspace === null) {
    return (
      <AppShell active="My Tasks" title="My Tasks" eyebrow="Workspace" action={<Button className="hidden sm:inline-flex">New task</Button>}>
        <EmptyState title="No workspace yet" description="Create a team before adding personal or shared tasks." />
      </AppShell>
    );
  }

  return (
    <AppShell active="My Tasks" title="My Tasks" eyebrow={workspace.team.name} action={<Button className="hidden sm:inline-flex">New task</Button>}>
      <div className="space-y-6">
        <TaskCreateInput teamId={workspace.team._id} projectId={defaultProject?._id} assigneeIds={assigneeIds} />
        {tasks === undefined ? (
          <LoadingState />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Metric label="Assigned to me" value={tasks.length} />
              <Metric label="Due today" value={tasks.filter((task) => task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()).length} />
              <Metric label="In progress" value={tasks.filter((task) => task.assignments.some((assignment: any) => assignment.userId === "demo-user-ayse" && assignment.status === "in_progress")).length} />
            </div>
            <TaskList tasks={tasks} />
            {tasks[0] && <TaskDetailDrawer task={tasks[0]} />}
          </>
        )}
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
